import os
import argparse
import json

from eth_utils import is_hex_address, to_normalized_address

from eth2deposit.credentials import (
    CredentialList,
)

from eth2deposit.exceptions import ValidationError
from eth2deposit.utils.validation import (
    verify_deposit_data_json,
)
from eth2deposit.utils.constants import (
    MAX_DEPOSIT_AMOUNT,
)

from eth2deposit.settings import (
    get_chain_setting,
)

def generate_keys(args):
    eth1_withdrawal_address = None
    if args.eth1_withdrawal_address:
        eth1_withdrawal_address = args.eth1_withdrawal_address
        if not is_hex_address(eth1_withdrawal_address):
            raise ValueError("The given Eth1 address is not in hexadecimal encoded form.")

        eth1_withdrawal_address = to_normalized_address(eth1_withdrawal_address)

    mnemonic = args.mnemonic
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mnemonic", help="Mnemonic", type=str)
    parser.add_argument("index", help="Validator start index", type=int)
    parser.add_argument("count", help="Validator count", type=int)
    parser.add_argument("folder", help="Where to put the deposit data and keystore files", type=str)
    parser.add_argument("network", help="For which network to create these keys for", type=str)
    parser.add_argument("password", help="Password for the keystore files", type=str)
    parser.add_argument("--eth1_withdrawal_address", help="Optional eth1 withdrawal address", type=str)
    args = parser.parse_args()

    generate_keys(args)