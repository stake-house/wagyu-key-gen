"""The stakingdeposit_proxy application.

This application is used as a proxy between our electron application and the ethstaker-deposit-cli
internals. It exposes some ethstaker-deposit-cli functions as easy to use commands that can be called
on the CLI.
"""

import os
import argparse
import json
import sys
import time
from typing import (
    Sequence,
)

from eth_typing import HexAddress

from ethstaker_deposit.key_handling.key_derivation.mnemonic import (
    get_mnemonic,
    reconstruct_mnemonic
)

from eth_utils import is_hex_address, to_normalized_address

from ethstaker_deposit.credentials import (
    CredentialList,
    Credential
)

from ethstaker_deposit.exceptions import ValidationError
from ethstaker_deposit.utils.validation import (
    validate_deposit,
    validate_bls_to_execution_change
)
from ethstaker_deposit.utils.constants import (
    MAX_DEPOSIT_AMOUNT,
)

from ethstaker_deposit.settings import (
    get_chain_setting,
)

from ethstaker_deposit.utils.crypto import SHA256

def generate_bls_to_execution_change(
        folder: str,
        chain: str,
        mnemonic: str,
        validator_start_index: int,
        validator_indices: Sequence[int],
        bls_withdrawal_credentials_list: Sequence[bytes],
        execution_address: HexAddress
        ) -> None:
    """Generate bls to execution change file.

    Keyword arguments:
    folder -- folder path for the resulting bls to execution change files
    chain -- chain setting for the signing domain, possible values are 'mainnet',
                'goerli', 'holesky'
    mnemonic -- mnemonic to be used as the seed for generating the keys
    validator_start_index -- index position for the keys to start generating withdrawal credentials
    validator_indices -- a list of the chosen validator index number(s) as identified on the beacon chain
    bls_withdrawal_credentials_list -- a list of the old BLS withdrawal credentials of the given validator(s)
    execution_address -- withdrawal address
    """
    if not os.path.exists(folder):
        os.mkdir(folder)
    
    eth1_withdrawal_address = execution_address
    if not is_hex_address(eth1_withdrawal_address):
        raise ValueError("The given Eth1 address is not in hexadecimal encoded form.")

    eth1_withdrawal_address = to_normalized_address(eth1_withdrawal_address)
    execution_address = eth1_withdrawal_address
    
    # Get chain setting
    chain_setting = get_chain_setting(chain)

    if len(validator_indices) != len(bls_withdrawal_credentials_list):
        raise ValueError(
            "The size of `validator_indices` (%d) should be as same as `bls_withdrawal_credentials_list` (%d)."
            % (len(validator_indices), len(bls_withdrawal_credentials_list))
        )

    num_validators = len(validator_indices)
    amounts = [MAX_DEPOSIT_AMOUNT] * num_validators

    mnemonic_password = ''

    num_keys = num_validators
    start_index = validator_start_index
    hex_eth1_withdrawal_address = execution_address

    if len(amounts) != num_keys:
        raise ValueError(
            f"The number of keys ({num_keys}) doesn't equal to the corresponding deposit amounts ({len(amounts)})."
        )
    key_indices = range(start_index, start_index + num_keys)
    credentials = CredentialList(
        [Credential(mnemonic=mnemonic, mnemonic_password=mnemonic_password,
            index=index, amount=amounts[index - start_index], chain_setting=chain_setting,
            hex_eth1_withdrawal_address=hex_eth1_withdrawal_address)
        for index in key_indices])

    # Check if the given old bls_withdrawal_credentials is as same as the mnemonic generated
    for i, credential in enumerate(credentials.credentials):
        bls_withdrawal_credentials = bls_withdrawal_credentials_list[i]
        if bls_withdrawal_credentials[1:] != SHA256(credential.withdrawal_pk)[1:]:
            raise ValidationError('err_not_matching')

    bls_to_execution_changes = [cred.get_bls_to_execution_change_dict(validator_indices[i])
        for i, cred in enumerate(credentials.credentials)]

    filefolder = os.path.join(folder, 'bls_to_execution_change-%i.json' % time.time())
    with open(filefolder, 'w') as f:
        json.dump(bls_to_execution_changes, f)
    if os.name == 'posix':
        os.chmod(filefolder, int('400', 8))  # Read for owner & group
    btec_file = filefolder

    with open(btec_file, 'r') as f:
        btec_json = json.load(f)
        json_file_validation_result = all([
            validate_bls_to_execution_change(
                btec, credential,
                input_validator_index=input_validator_index,
                input_execution_address=execution_address,
                chain_setting=chain_setting)
            for btec, credential, input_validator_index in zip(btec_json, credentials.credentials, validator_indices)
        ])
    if not json_file_validation_result:
        raise ValidationError('err_verify_btec')

def validate_bls_credentials(
        chain: str,
        mnemonic: str,
        validator_start_index: int,
        bls_withdrawal_credentials_list: Sequence[bytes],
        ) -> None:
    """Validate BLS credentials against what was generated from a mnemonic.

    Keyword arguments:
    chain -- chain setting for the signing domain, possible values are 'mainnet',
                'goerli', 'holesky'
    mnemonic -- mnemonic to be used as the seed for generating the keys
    validator_start_index -- index position for the keys to start generating withdrawal credentials
    bls_withdrawal_credentials_list -- a list of the old BLS withdrawal credentials of the given validator(s)
    """

    chain_setting = get_chain_setting(chain)

    num_validators = len(bls_withdrawal_credentials_list)
    amounts = [MAX_DEPOSIT_AMOUNT] * num_validators

    mnemonic_password = ''

    num_keys = num_validators
    start_index = validator_start_index

    key_indices = range(start_index, start_index + num_keys)
    credentials = CredentialList(
        [Credential(mnemonic=mnemonic, mnemonic_password=mnemonic_password,
            index=index, amount=amounts[index - start_index], chain_setting=chain_setting,
            hex_eth1_withdrawal_address=None)
        for index in key_indices])

    # Check if the given old bls_withdrawal_credentials is as same as the mnemonic generated
    for i, credential in enumerate(credentials.credentials):
        bls_withdrawal_credentials = bls_withdrawal_credentials_list[i]
        if bls_withdrawal_credentials[1:] != SHA256(credential.withdrawal_pk)[1:]:
            raise ValidationError('err_not_matching')


def validate_mnemonic(mnemonic: str, word_lists_path: str) -> str:
    """Validate a mnemonic using the ethstaker-deposit-cli logic and returns the mnemonic.

    Keyword arguments:
    mnemonic -- the mnemonic to validate
    word_lists_path -- path to the word lists directory
    """

    mnemonic = reconstruct_mnemonic(mnemonic, word_lists_path)
    if mnemonic is not None:
        return mnemonic
    else:
        raise ValidationError('That is not a valid mnemonic, please check for typos.')

def create_mnemonic(word_list, language='english'):
    """Returns a new random mnemonic.

    Keyword arguments:
    word_lists -- path to the word lists directory
    language -- the language for the mnemonic words, possible values are 'chinese_simplified',
                'chinese_traditional', 'czech', 'english', 'italian', 'korean', 'portuguese' or
                'spanish' (default 'english')
    """
    return get_mnemonic(language=language, words_path=word_list)

def generate_keys(args):
    """Generate validator keys.

    Keyword arguments:
    args -- contains the CLI arguments pass to the application, it should have those properties:
            - wordlist: path to the word lists directory
            - mnemonic: mnemonic to be used as the seed for generating the keys
            - index: index of the first validator's keys you wish to generate
            - count: number of signing keys you want to generate
            - folder: folder path for the resulting keystore(s) and deposit(s) files
            - network: network setting for the signing domain, possible values are 'mainnet',
                       'prater', 'kintsugi' or 'kiln'
            - password: password that will protect the resulting keystore(s)
            - eth1_withdrawal_address: (Optional) eth1 address that will be used to create the
                                       withdrawal credentials
    """
    
    eth1_withdrawal_address = None
    if args.eth1_withdrawal_address:
        eth1_withdrawal_address = args.eth1_withdrawal_address
        if not is_hex_address(eth1_withdrawal_address):
            raise ValueError("The given Eth1 address is not in hexadecimal encoded form.")

        eth1_withdrawal_address = to_normalized_address(eth1_withdrawal_address)

    mnemonic = validate_mnemonic(args.mnemonic, args.wordlist)
    mnemonic_password = ''
    amounts = [MAX_DEPOSIT_AMOUNT] * args.count
    folder = args.folder
    chain_setting = get_chain_setting(args.network)
    if not os.path.exists(folder):
        os.mkdir(folder)

    start_index = args.index
    num_keys=args.count
    hex_eth1_withdrawal_address=eth1_withdrawal_address
    password=args.password

    if len(amounts) != num_keys:
        raise ValueError(
            f"The number of keys ({num_keys}) doesn't equal to the corresponding deposit amounts ({len(amounts)})."
        )
    key_indices = range(start_index, start_index + num_keys)
    credentials = CredentialList(
        [Credential(mnemonic=mnemonic, mnemonic_password=mnemonic_password,
            index=index, amount=amounts[index - start_index], chain_setting=chain_setting,
            hex_eth1_withdrawal_address=hex_eth1_withdrawal_address)
        for index in key_indices])

    keystore_filefolders = [credential.save_signing_keystore(password=password, folder=folder) for credential in credentials.credentials]

    deposit_data = [cred.deposit_datum_dict for cred in credentials.credentials]
    filefolder = os.path.join(folder, 'deposit_data-%i.json' % time.time())
    with open(filefolder, 'w') as f:
        json.dump(deposit_data, f, default=lambda x: x.hex())
    if os.name == 'posix':
        os.chmod(filefolder, int('400', 8))  # Read for owner & group
    deposits_file = filefolder

    items = zip(credentials.credentials, keystore_filefolders)

    if not all(credential.verify_keystore(keystore_filefolder=filefolder, password=password)
        for credential, filefolder in items):
        raise ValidationError("Failed to verify the keystores.")

    with open(deposits_file, 'r') as f:
        deposit_json = json.load(f)
        if not all([validate_deposit(deposit, credential) for deposit, credential in zip(deposit_json, credentials.credentials)]):
            raise ValidationError("Failed to verify the deposit data JSON files.")

def decode_bytes(value):
    if value.startswith('0x'):
        value = value[2:]
    return bytes.fromhex(value)

def parse_bls_change(args):
    """Parse CLI arguments to call the generate_bls_to_execution_change function.
    """
    generate_bls_to_execution_change(
        args.folder,
        args.chain,
        args.mnemonic,
        args.index,
        [int(i) for i in args.indices.split(',')],
        [decode_bytes(i) for i in args.withdrawal_credentials.split(',')],
        args.execution_address)

def parse_validate_bls_credentials(args):
    """Parse CLI arguments to call the validate_bls_credentials function.
    """
    validate_bls_credentials(
        args.chain,
        args.mnemonic,
        args.index,
        [decode_bytes(i) for i in args.withdrawal_credentials.split(',')])

def parse_create_mnemonic(args):
    """Parse CLI arguments to call the create_mnemonic function.
    """
    mnemonic = None
    if args.language:
        mnemonic = create_mnemonic(args.wordlist, language=args.language)
    else:
        mnemonic = create_mnemonic(args.wordlist)

    print(json.dumps({
        'mnemonic': mnemonic
    }))

def parse_generate_keys(args):
    """Parse CLI arguments to call the generate_keys function.
    """
    generate_keys(args)

def parse_validate_mnemonic(args):
    """Parse CLI arguments to call the validate_mnemonic function.
    """
    validate_mnemonic(args.mnemonic, args.wordlist)

def main():
    """The application starting point.
    """
    main_parser = argparse.ArgumentParser()

    subparsers = main_parser.add_subparsers(title="subcommands")
    
    create_parser = subparsers.add_parser("create_mnemonic")
    create_parser.add_argument("wordlist", help="Path to word list directory", type=str)
    create_parser.add_argument("--language", help="Language", type=str)
    create_parser.set_defaults(func=parse_create_mnemonic)

    generate_parser = subparsers.add_parser("generate_keys")
    generate_parser.add_argument("wordlist", help="Path to word list directory", type=str)
    generate_parser.add_argument("mnemonic", help="Mnemonic", type=str)
    generate_parser.add_argument("index", help="Validator start index", type=int)
    generate_parser.add_argument("count", help="Validator count", type=int)
    generate_parser.add_argument("folder", help="Where to put the deposit data and keystore files", type=str)
    generate_parser.add_argument("network", help="For which network to create these keys for", type=str)
    generate_parser.add_argument("password", help="Password for the keystore files", type=str)
    generate_parser.add_argument("--eth1_withdrawal_address", help="Optional eth1 withdrawal address", type=str)
    generate_parser.set_defaults(func=parse_generate_keys)

    validate_parser = subparsers.add_parser("validate_mnemonic")
    validate_parser.add_argument("wordlist", help="Path to word list directory", type=str)
    validate_parser.add_argument("mnemonic", help="Mnemonic", type=str)
    validate_parser.set_defaults(func=parse_validate_mnemonic)

    generate_parser = subparsers.add_parser("bls_change")
    generate_parser.add_argument("folder", help="Where to put the bls change files", type=str)
    generate_parser.add_argument("chain", help="For which network to create the change", type=str)
    generate_parser.add_argument("mnemonic", help="Mnemonic", type=str)
    generate_parser.add_argument("index", help="Validator start index", type=int)
    generate_parser.add_argument("indices", help="Validator index number(s) as identified on the beacon chain (comma separated)", type=str)
    generate_parser.add_argument("withdrawal_credentials", help="Old BLS withdrawal credentials of the given validator(s) (comma separated)", type=str)
    generate_parser.add_argument("execution_address", help="withdrawal address", type=str)
    generate_parser.set_defaults(func=parse_bls_change)

    generate_parser = subparsers.add_parser("validate_bls_credentials")
    generate_parser.add_argument("chain", help="For which network to validate these BLS credentials", type=str)
    generate_parser.add_argument("mnemonic", help="Mnemonic", type=str)
    generate_parser.add_argument("index", help="Validator start index", type=int)
    generate_parser.add_argument("withdrawal_credentials", help="Old BLS withdrawal credentials of the given validator(s) (comma separated)", type=str)
    generate_parser.set_defaults(func=parse_validate_bls_credentials)

    args = main_parser.parse_args()
    if not args or 'func' not in args:
        main_parser.parse_args(['-h'])
    else:
        try:
            args.func(args)
        except (ValidationError, ValueError) as exc:
            print(str(exc), file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()