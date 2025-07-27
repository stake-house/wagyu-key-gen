import os
import time
import json

from click.testing import CliRunner

from ethstaker_deposit.credentials import Credential
from ethstaker_deposit.deposit import cli
from ethstaker_deposit.settings import get_chain_setting, get_devnet_chain_setting
from ethstaker_deposit.utils.constants import DEFAULT_EXIT_TRANSACTION_FOLDER_NAME
from ethstaker_deposit.utils.intl import (
    load_text,
)
from tests.test_cli.helpers import (
    clean_exit_transaction_folder,
    read_json_file,
    verify_file_permission,
)


def test_exit_transaction_keystore() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    exit_transaction_folder_path = os.path.join(my_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    clean_exit_transaction_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(exit_transaction_folder_path):
        os.mkdir(exit_transaction_folder_path)

    # Shared parameters
    chain = 'mainnet'
    keystore_password = 'solo-stakers'

    # Prepare credential
    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting(chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    # Save keystore file
    keystore_filepath = credential.save_signing_keystore(keystore_password, exit_transaction_folder_path, time.time())

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', my_folder_path,
        '--chain', chain,
        '--keystore', keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0

    # Check files
    _, _, exit_transaction_files = next(os.walk(exit_transaction_folder_path))

    # Filter files to signed_exit as keystore file will exist as well
    exit_transaction_file = [f for f in exit_transaction_files if 'signed_exit' in f]

    assert len(set(exit_transaction_file)) == 1

    json_data = read_json_file(exit_transaction_folder_path, exit_transaction_file[0])

    # Verify file content
    assert json_data['message']['epoch'] == '1234'
    assert json_data['message']['validator_index'] == '1'
    assert json_data['signature']

    # Verify file permissions
    verify_file_permission(os, folder_path=exit_transaction_folder_path, files=exit_transaction_file)

    # Clean up
    clean_exit_transaction_folder(my_folder_path)


def test_exit_transaction_with_pbkdf2() -> None:
    # Prepare folder
    pbkdf2_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    pbkdf2_exit_transaction_folder_path = os.path.join(pbkdf2_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    clean_exit_transaction_folder(pbkdf2_folder_path)
    scrypt_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER2')
    scrypt_exit_transaction_folder_path = os.path.join(scrypt_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    clean_exit_transaction_folder(pbkdf2_folder_path)
    if not os.path.exists(pbkdf2_folder_path):
        os.mkdir(pbkdf2_folder_path)
    if not os.path.exists(scrypt_folder_path):
        os.mkdir(scrypt_folder_path)
    if not os.path.exists(pbkdf2_exit_transaction_folder_path):
        os.mkdir(pbkdf2_exit_transaction_folder_path)
    if not os.path.exists(scrypt_exit_transaction_folder_path):
        os.mkdir(scrypt_exit_transaction_folder_path)

    # Shared parameters
    chain = 'mainnet'
    keystore_password = 'solo-stakers'

    # Prepare credential
    pbkdf2_credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting(chain),
        hex_withdrawal_address=None,
        compounding=False,
        use_pbkdf2=True,
    )
    scrypt_credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting(chain),
        hex_withdrawal_address=None,
        compounding=False,
        use_pbkdf2=False,
    )

    # Save keystore file
    pbkdf2_keystore_filepath = pbkdf2_credential.save_signing_keystore(
        keystore_password,
        pbkdf2_exit_transaction_folder_path,
        time.time(),
    )
    scrypt_keystore_filepath = scrypt_credential.save_signing_keystore(
        keystore_password,
        scrypt_exit_transaction_folder_path,
        time.time(),
    )

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', pbkdf2_folder_path,
        '--chain', chain,
        '--keystore', pbkdf2_keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments)
    assert result.exit_code == 0

    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', scrypt_folder_path,
        '--chain', chain,
        '--keystore', scrypt_keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments)
    assert result.exit_code == 0

    # Check files
    _, _, exit_transaction_files = next(os.walk(pbkdf2_exit_transaction_folder_path))
    pbkdf2_exit_transaction_file = [f for f in exit_transaction_files if 'signed_exit' in f]
    assert len(set(pbkdf2_exit_transaction_file)) == 1
    pbkdf2_json_data = read_json_file(pbkdf2_exit_transaction_folder_path, pbkdf2_exit_transaction_file[0])

    _, _, exit_transaction_files = next(os.walk(scrypt_exit_transaction_folder_path))
    scrypt_exit_transaction_file = [f for f in exit_transaction_files if 'signed_exit' in f]
    assert len(set(scrypt_exit_transaction_file)) == 1
    scrypt_json_data = read_json_file(scrypt_exit_transaction_folder_path, scrypt_exit_transaction_file[0])

    assert pbkdf2_json_data['message']['epoch'] == scrypt_json_data['message']['epoch']
    assert pbkdf2_json_data['message']['validator_index'] == scrypt_json_data['message']['validator_index']
    assert pbkdf2_json_data['signature'] == scrypt_json_data['signature']

    verify_file_permission(os, folder_path=pbkdf2_exit_transaction_folder_path, files=pbkdf2_exit_transaction_file)
    verify_file_permission(os, folder_path=scrypt_exit_transaction_folder_path, files=scrypt_exit_transaction_file)

    clean_exit_transaction_folder(pbkdf2_folder_path)
    clean_exit_transaction_folder(scrypt_folder_path)


def test_invalid_keystore_path() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_exit_transaction_folder(my_folder_path)

    invalid_keystore_file = os.path.join(os.getcwd(), 'README.md')

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', my_folder_path,
        '--chain', "mainnet",
        '--keystore', invalid_keystore_file,
        '--keystore_password', "password",
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 2

    clean_exit_transaction_folder(my_folder_path)


def test_invalid_keystore_file() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_exit_transaction_folder(my_folder_path)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', my_folder_path,
        '--chain', "mainnet",
        '--keystore', "invalid_keystore_path",
        '--keystore_password', "password",
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 2

    clean_exit_transaction_folder(my_folder_path)


def test_invalid_keystore_password() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    exit_transaction_folder_path = os.path.join(my_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    clean_exit_transaction_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(exit_transaction_folder_path):
        os.mkdir(exit_transaction_folder_path)

    # Shared parameters
    chain = 'mainnet'
    keystore_password = 'solo-stakers'

    # Prepare credential
    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting(chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    # Save keystore file
    keystore_filepath = credential.save_signing_keystore(keystore_password, exit_transaction_folder_path, time.time())
    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', my_folder_path,
        '--chain', chain,
        '--keystore', keystore_filepath,
        '--keystore_password', "incorrect_password",
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 1

    mnemonic_json_file = os.path.join(os.getcwd(), 'ethstaker_deposit/cli/', 'exit_transaction_keystore.json')
    assert load_text(
        ['arg_exit_transaction_keystore_keystore_password', 'mismatch'],
        mnemonic_json_file,
        'exit_transaction_keystore'
    ) in result.output

    clean_exit_transaction_folder(my_folder_path)


def test_exit_transaction_keystore_custom_testnet() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    exit_transaction_folder_path = os.path.join(my_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    clean_exit_transaction_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(exit_transaction_folder_path):
        os.mkdir(exit_transaction_folder_path)

    # Shared parameters
    devnet_chain = {
        "network_name": "holeskycopy",
        "genesis_fork_version": "01017000",
        "exit_fork_version": "04017000",
        "genesis_validator_root": "9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1"
    }
    devnet_chain_setting = json.dumps(devnet_chain)
    keystore_password = 'solo-stakers'

    # Prepare credential
    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_devnet_chain_setting(**devnet_chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    # Save keystore file
    keystore_filepath = credential.save_signing_keystore(keystore_password, exit_transaction_folder_path, time.time())

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-keystore',
        '--output_folder', my_folder_path,
        '--devnet_chain_setting', devnet_chain_setting,
        '--keystore', keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0

    # Check files
    _, _, exit_transaction_files = next(os.walk(exit_transaction_folder_path))

    # Filter files to signed_exit as keystore file will exist as well
    exit_transaction_file = [f for f in exit_transaction_files if 'signed_exit' in f]

    assert len(set(exit_transaction_file)) == 1

    json_data = read_json_file(exit_transaction_folder_path, exit_transaction_file[0])

    # Verify file content
    assert json_data['message']['epoch'] == '1234'
    assert json_data['message']['validator_index'] == '1'
    assert json_data['signature']

    # Verify file permissions
    verify_file_permission(os, folder_path=exit_transaction_folder_path, files=exit_transaction_file)

    # Clean up
    clean_exit_transaction_folder(my_folder_path)
