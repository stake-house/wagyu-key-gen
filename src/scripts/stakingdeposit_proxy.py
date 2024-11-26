"""The stakingdeposit_proxy application.

This application is used as a proxy between our electron application and the ethstaker-deposit-cli
internals. It exposes some ethstaker-deposit-cli functions as easy to use commands that can be called
on the CLI.
"""

import os
import argparse
import json
import concurrent.futures
import sys
import time
from multiprocessing import freeze_support
from typing import (
    Sequence,
    Dict,
    Any,
    Optional,
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
    validate_bls_to_execution_change,
    validate_bls_withdrawal_credentials_matching,
)
from ethstaker_deposit.utils.constants import (
    MIN_ACTIVATION_AMOUNT,
)
from ethstaker_deposit.utils.deposit import export_deposit_data_json as export_deposit_data_json_util

from ethstaker_deposit.settings import (
    get_chain_setting,
)

from ethstaker_deposit.utils.file_handling import (
    sensitive_opener,
)

from ethstaker_deposit.utils.crypto import SHA256

def _validate_credentials_match(kwargs: Dict[str, Any]) -> Optional[ValidationError]:
    credential: Credential = kwargs.pop('credential')
    bls_withdrawal_credentials: bytes = kwargs.pop('bls_withdrawal_credentials')

    try:
        validate_bls_withdrawal_credentials_matching(bls_withdrawal_credentials, credential)
    except ValidationError as e:
        return e
    return None

def _bls_to_execution_change_builder(kwargs: Dict[str, Any]) -> Dict[str, bytes]:
    credential: Credential = kwargs.pop('credential')
    return credential.get_bls_to_execution_change_dict(**kwargs)

def _bls_to_execution_change_validator(kwargs: Dict[str, Any]) -> bool:
    return validate_bls_to_execution_change(**kwargs)

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
        raise ValueError("The given withdrawal address is not in hexadecimal encoded form.")

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
    amounts = [MIN_ACTIVATION_AMOUNT] * num_validators

    mnemonic_password = ''

    num_keys = num_validators
    start_index = validator_start_index
    hex_withdrawal_address = execution_address

    if len(amounts) != num_keys:
        raise ValueError(
            f"The number of keys ({num_keys}) doesn't equal to the corresponding deposit amounts ({len(amounts)})."
        )

    compounding = False
    use_pbkdf2 = False

    key_indices = range(start_index, start_index + num_keys)

    credentials: list[Credential] = []
    executor_kwargs = [{
        'mnemonic': mnemonic,
        'mnemonic_password': mnemonic_password,
        'index': index,
        'amount': amounts[index - start_index],
        'chain_setting': chain_setting,
        'hex_withdrawal_address': hex_withdrawal_address,
        'compounding': compounding,
        'use_pbkdf2': use_pbkdf2,
    } for index in key_indices]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for credential in executor.map(_credential_builder, executor_kwargs):
            credentials.append(credential)

    credentials = CredentialList(credentials)

    # Check if the given old bls_withdrawal_credentials is as same as the mnemonic generated
    executor_kwargs = [{
        'credential': credential,
        'bls_withdrawal_credentials': bls_withdrawal_credentials_list[i],
    } for i, credential in enumerate(credentials.credentials)]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for e in executor.map(_validate_credentials_match, executor_kwargs):
            if e is not None:
                raise ValidationError('err_not_matching')

    bls_to_execution_changes = []

    executor_kwargs = [{
        'credential': credential,
        'validator_index': validator_indices[i],
    } for i, credential in enumerate(credentials.credentials)]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for bls_to_execution_change in executor.map(_bls_to_execution_change_builder, executor_kwargs):
            bls_to_execution_changes.append(bls_to_execution_change)

    filefolder = os.path.join(folder, 'bls_to_execution_change-%i.json' % time.time())
    with open(filefolder, 'w', encoding='utf-8', opener=sensitive_opener) as f:
        json.dump(bls_to_execution_changes, f)
    btec_file = filefolder

    btec_json = []
    with open(btec_file, 'r', encoding='utf-8') as f:
        btec_json = json.load(f)

    all_valid_bls_changes = True

    executor_kwargs = [{
        'btec_dict': btec,
        'credential': credential,
        'input_validator_index': input_validator_index,
        'input_withdrawal_address': hex_withdrawal_address,
        'chain_setting': chain_setting,
    } for btec, credential, input_validator_index in zip(btec_json, credentials.credentials, validator_indices)]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for valid_bls_change in executor.map(_bls_to_execution_change_validator, executor_kwargs):
            all_valid_bls_changes &= valid_bls_change

    if not all_valid_bls_changes:
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
    amounts = [MIN_ACTIVATION_AMOUNT] * num_validators

    mnemonic_password = ''

    num_keys = num_validators
    start_index = validator_start_index

    compounding = False
    use_pbkdf2 = False

    key_indices = range(start_index, start_index + num_keys)

    credentials: list[Credential] = []
    executor_kwargs = [{
        'mnemonic': mnemonic,
        'mnemonic_password': mnemonic_password,
        'index': index,
        'amount': amounts[index - start_index],
        'chain_setting': chain_setting,
        'hex_withdrawal_address': None,
        'compounding': compounding,
        'use_pbkdf2': use_pbkdf2,
    } for index in key_indices]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for credential in executor.map(_credential_builder, executor_kwargs):
            credentials.append(credential)

    credentials = CredentialList(credentials)

    # Check if the given old bls_withdrawal_credentials is as same as the mnemonic generated
    executor_kwargs = [{
        'credential': credential,
        'bls_withdrawal_credentials': bls_withdrawal_credentials_list[i],
    } for i, credential in enumerate(credentials.credentials)]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for e in executor.map(_validate_credentials_match, executor_kwargs):
            if e is not None:
                raise ValidationError('err_not_matching')


def validate_mnemonic(mnemonic: str, word_lists_path: str, language: Optional[str] = 'english') -> str:
    """Validate a mnemonic using the ethstaker-deposit-cli logic and returns the mnemonic.

    Keyword arguments:
    mnemonic -- the mnemonic to validate
    word_lists_path -- path to the word lists directory
    """

    mnemonic = reconstruct_mnemonic(mnemonic, word_lists_path, language)
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

def _credential_builder(kwargs: Dict[str, Any]) -> Credential:
    return Credential(**kwargs)

def _keystore_exporter(kwargs: Dict[str, Any]) -> str:
    credential: Credential = kwargs.pop('credential')
    return credential.save_signing_keystore(**kwargs)

def _deposit_data_builder(credential: Credential) -> Dict[str, bytes]:
    return credential.deposit_datum_dict

def _keystore_verifier(kwargs: Dict[str, Any]) -> bool:
    credential: Credential = kwargs.pop('credential')
    return credential.verify_keystore(**kwargs)

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
    amounts = [MIN_ACTIVATION_AMOUNT] * args.count
    folder = args.folder
    chain_setting = get_chain_setting(args.network)
    if not os.path.exists(folder):
        os.mkdir(folder)

    start_index = args.index
    num_keys=args.count
    hex_withdrawal_address=eth1_withdrawal_address
    password=args.password

    if len(amounts) != num_keys:
        raise ValueError(
            f"The number of keys ({num_keys}) doesn't equal to the corresponding deposit amounts ({len(amounts)})."
        )

    timestamp = time.time()
    compounding = False
    use_pbkdf2 = False

    key_indices = range(start_index, start_index + num_keys)

    credentials: list[Credential] = []
    executor_kwargs = [{
        'mnemonic': mnemonic,
        'mnemonic_password': mnemonic_password,
        'index': index,
        'amount': amounts[index - start_index],
        'chain_setting': chain_setting,
        'hex_withdrawal_address': hex_withdrawal_address,
        'compounding': compounding,
        'use_pbkdf2': use_pbkdf2,
    } for index in key_indices]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for credential in executor.map(_credential_builder, executor_kwargs):
            credentials.append(credential)

    credentials = CredentialList(credentials)

    keystore_filefolders: list[str] = []
    executor_kwargs = [{
        'credential': credential,
        'password': password,
        'folder': folder,
        'timestamp': timestamp,
    } for credential in credentials.credentials]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for filefolder in executor.map(_keystore_exporter, executor_kwargs):
            keystore_filefolders.append(filefolder)

    deposit_data = []

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for datum_dict in executor.map(_deposit_data_builder, credentials.credentials):
            deposit_data.append(datum_dict)

    deposits_file = export_deposit_data_json_util(folder, timestamp, deposit_data)

    items = zip(credentials.credentials, keystore_filefolders)

    all_valid_keystores = True
    executor_kwargs = [{
        'credential': credential,
        'keystore_filefolder': fileholder,
        'password': password,
    } for credential, fileholder in zip(credentials.credentials, keystore_filefolders)]

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for valid_keystore in executor.map(_keystore_verifier, executor_kwargs):
            all_valid_keystores &= valid_keystore

    if not all_valid_keystores:
        raise ValidationError("Failed to verify the keystores.")

    all_valid_deposits = True
    deposit_json = []
    with open(deposits_file, 'r', encoding='utf-8') as f:
        deposit_json = json.load(f)

    with concurrent.futures.ProcessPoolExecutor() as executor:
        for valid_deposit in executor.map(validate_deposit, deposit_json, credentials.credentials):
            all_valid_deposits &= valid_deposit

    if not all_valid_deposits:
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
    freeze_support()  # Needed when running under Windows in a frozen bundle
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
