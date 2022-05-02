"""The eth2deposit_proxy application.

This application is used as a proxy between our electron application and the eth2-deposit-cli
internals. It exposes some eth2-deposit-cli functions as easy to use commands that can be called
on the CLI.
"""

import os
import argparse
import json
import sys

from staking_deposit.key_handling.key_derivation.mnemonic import (
    get_mnemonic,
    reconstruct_mnemonic
)

from eth_utils import is_hex_address, to_normalized_address

from staking_deposit.credentials import (
    CredentialList,
)

from staking_deposit.exceptions import ValidationError
from staking_deposit.utils.validation import (
    verify_deposit_data_json,
)
from staking_deposit.utils.constants import (
    MAX_DEPOSIT_AMOUNT,
)

from staking_deposit.settings import (
    get_chain_setting,
)

def validate_mnemonic(mnemonic: str, word_lists_path: str) -> str:
    """Validate a mnemonic using the eth2-deposit-cli logic and returns the mnemonic.

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

    credentials = CredentialList.from_mnemonic(
        mnemonic=mnemonic,
        mnemonic_password=mnemonic_password,
        num_keys=args.count,
        amounts=amounts,
        chain_setting=chain_setting,
        start_index=args.index,
        hex_eth1_withdrawal_address=eth1_withdrawal_address,
    )

    keystore_filefolders = credentials.export_keystores(password=args.password, folder=folder)
    deposits_file = credentials.export_deposit_data_json(folder=folder)
    if not credentials.verify_keystores(keystore_filefolders=keystore_filefolders, password=args.password):
        raise ValidationError("Failed to verify the keystores.")
    if not verify_deposit_data_json(deposits_file, credentials.credentials):
        raise ValidationError("Failed to verify the deposit data JSON files.")

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