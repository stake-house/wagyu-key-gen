import os
import time

from click.testing import CliRunner

from ethstaker_deposit.credentials import Credential
from ethstaker_deposit.deposit import cli
from ethstaker_deposit.settings import get_chain_setting
from ethstaker_deposit.utils.constants import DEFAULT_VALIDATOR_KEYS_FOLDER_NAME
from tests.test_cli.helpers import clean_key_folder


def test_exit_transaction_keystore() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(keys_folder_path):
        os.mkdir(keys_folder_path)

    # Shared parameters
    keystore_password = 'solo-stakers'

    # Prepare credential
    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting('mainnet'),
        hex_withdrawal_address=None,
        compounding=False,
    )

    # Save keystore file
    keystore_filepath = credential.save_signing_keystore(keystore_password, keys_folder_path, time.time())

    # Test invalid password
    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'test-keystore',
        '--keystore', keystore_filepath,
        '--keystore_password', 'very_wrong_password',
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 1

    # Test correct password
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'test-keystore',
        '--keystore', keystore_filepath,
        '--keystore_password', keystore_password,
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0

    clean_key_folder(my_folder_path)
