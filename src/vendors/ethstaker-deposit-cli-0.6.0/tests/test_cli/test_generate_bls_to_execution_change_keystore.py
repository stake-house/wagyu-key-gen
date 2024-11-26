import os
import time
import json

from click.testing import CliRunner

from ethstaker_deposit.credentials import Credential
from ethstaker_deposit.deposit import cli
from ethstaker_deposit.settings import get_chain_setting, get_devnet_chain_setting
from ethstaker_deposit.utils.constants import DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME
from ethstaker_deposit.utils.intl import load_text
from .helpers import (
    clean_btec_keystore_folder,
    clean_key_folder,
    prepare_testing_folder,
    read_json_file,
    verify_file_permission,
)


def test_bls_change_keystore() -> None:
    my_folder_path = prepare_testing_folder(os)
    changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)

    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(changes_folder_path):
        os.mkdir(changes_folder_path)

    chain = 'mainnet'
    keystore_password = 'solo-stakers'

    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting(chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    keystore_filepath = credential.save_signing_keystore(keystore_password, changes_folder_path, time.time())

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', my_folder_path,
        '--chain', chain,
        '--keystore', keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0

    _, _, files = next(os.walk(changes_folder_path))

    change_files = [f for f in files if 'bls_to_execution_change_keystore_' in f]

    assert len(set(change_files)) == 1

    json_data = read_json_file(changes_folder_path, change_files[0])

    assert json_data['message']['to_execution_address'] == '0xcd60a5f152724480c3a95e4ff4daceef4074854d'
    assert json_data['message']['validator_index'] == 1
    assert json_data['signature']

    verify_file_permission(os, folder_path=changes_folder_path, files=change_files)

    clean_btec_keystore_folder(my_folder_path)


def test_bls_change_keystore_with_pbkdf2() -> None:
    pbkdf2_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    pbkdf2_bls_change_folder_path = os.path.join(pbkdf2_folder_path,
                                                 DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)
    clean_btec_keystore_folder(pbkdf2_folder_path)
    scrypt_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER2')
    scrypt_bls_change_folder_path = os.path.join(scrypt_folder_path,
                                                 DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)
    clean_btec_keystore_folder(pbkdf2_folder_path)
    if not os.path.exists(pbkdf2_folder_path):
        os.mkdir(pbkdf2_folder_path)
    if not os.path.exists(scrypt_folder_path):
        os.mkdir(scrypt_folder_path)
    if not os.path.exists(pbkdf2_bls_change_folder_path):
        os.mkdir(pbkdf2_bls_change_folder_path)
    if not os.path.exists(scrypt_bls_change_folder_path):
        os.mkdir(scrypt_bls_change_folder_path)

    chain = 'mainnet'
    keystore_password = 'solo-stakers'

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

    pbkdf2_keystore_filepath = pbkdf2_credential.save_signing_keystore(
        keystore_password,
        pbkdf2_bls_change_folder_path,
        time.time(),
    )
    scrypt_keystore_filepath = scrypt_credential.save_signing_keystore(
        keystore_password,
        scrypt_bls_change_folder_path,
        time.time(),
    )

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', pbkdf2_folder_path,
        '--chain', chain,
        '--keystore', pbkdf2_keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments)
    assert result.exit_code == 0

    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', scrypt_folder_path,
        '--chain', chain,
        '--keystore', scrypt_keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments)
    assert result.exit_code == 0

    # Check files
    _, _, bls_change_files = next(os.walk(pbkdf2_bls_change_folder_path))
    pbkdf2_bls_change_files = [f for f in bls_change_files if 'bls_to_execution_change_keystore_' in f]
    assert len(set(pbkdf2_bls_change_files)) == 1
    pbkdf2_json_data = read_json_file(pbkdf2_bls_change_folder_path, pbkdf2_bls_change_files[0])

    _, _, bls_change_files = next(os.walk(scrypt_bls_change_folder_path))
    scrypt_bls_change_files = [f for f in bls_change_files if 'bls_to_execution_change_keystore_' in f]
    assert len(set(scrypt_bls_change_files)) == 1
    scrypt_json_data = read_json_file(scrypt_bls_change_folder_path, scrypt_bls_change_files[0])

    assert pbkdf2_json_data['message']['to_execution_address'] == scrypt_json_data['message']['to_execution_address']
    assert pbkdf2_json_data['message']['validator_index'] == scrypt_json_data['message']['validator_index']
    assert pbkdf2_json_data['signature'] == scrypt_json_data['signature']

    verify_file_permission(os, folder_path=pbkdf2_bls_change_folder_path, files=pbkdf2_bls_change_files)
    verify_file_permission(os, folder_path=scrypt_bls_change_folder_path, files=scrypt_bls_change_files)

    clean_btec_keystore_folder(pbkdf2_folder_path)
    clean_btec_keystore_folder(scrypt_folder_path)


def test_invalid_keystore_path() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_btec_keystore_folder(my_folder_path)

    invalid_keystore_file = os.path.join(os.getcwd(), 'README.md')

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', my_folder_path,
        '--chain', "mainnet",
        '--keystore', invalid_keystore_file,
        '--keystore_password', "password",
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 2

    clean_btec_keystore_folder(my_folder_path)


def test_invalid_keystore_file() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_btec_keystore_folder(my_folder_path)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', my_folder_path,
        '--chain', "mainnet",
        '--keystore', "invalid_keystore_file",
        '--keystore_password', "password",
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 2

    clean_btec_keystore_folder(my_folder_path)


def test_invalid_keystore_password() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    bls_change_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)
    clean_btec_keystore_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(bls_change_folder_path):
        os.mkdir(bls_change_folder_path)

    chain = 'mainnet'
    keystore_password = 'solo-stakers'

    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_chain_setting(chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    keystore_filepath = credential.save_signing_keystore(keystore_password, bls_change_folder_path, time.time())
    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', my_folder_path,
        '--chain', "mainnet",
        '--keystore', keystore_filepath,
        '--keystore_password', "incorrect_password",
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 1

    mnemonic_json_file = os.path.join(os.getcwd(),
                                      'ethstaker_deposit/cli/',
                                      'generate_bls_to_execution_change_keystore.json')
    assert load_text(
        ['arg_bls_to_execution_changes_keystore_keystore_password', 'mismatch'],
        mnemonic_json_file,
        'generate_bls_to_execution_change_keystore'
    ) in result.output

    clean_btec_keystore_folder(my_folder_path)


def test_bls_change_keystore_custom_testnet() -> None:
    my_folder_path = prepare_testing_folder(os)
    changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)

    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(changes_folder_path):
        os.mkdir(changes_folder_path)

    devnet_chain = {
        "network_name": "holeskycopy",
        "genesis_fork_version": "01017000",
        "exit_fork_version": "04017000",
        "genesis_validator_root": "9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1"
    }

    devnet_chain_setting = json.dumps(devnet_chain)
    keystore_password = 'solo-stakers'

    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_devnet_chain_setting(**devnet_chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    keystore_filepath = credential.save_signing_keystore(keystore_password, changes_folder_path, time.time())

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', my_folder_path,
        '--devnet_chain_setting', devnet_chain_setting,
        '--keystore', keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0

    _, _, files = next(os.walk(changes_folder_path))

    change_files = [f for f in files if 'bls_to_execution_change_keystore_' in f]

    assert len(set(change_files)) == 1

    json_data = read_json_file(changes_folder_path, change_files[0])

    assert json_data['message']['to_execution_address'] == '0xcd60a5f152724480c3a95e4ff4daceef4074854d'
    assert json_data['message']['validator_index'] == 1
    assert json_data['signature']

    verify_file_permission(os, folder_path=changes_folder_path, files=change_files)

    clean_btec_keystore_folder(my_folder_path)


def test_invalid_custom_testnet() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)

    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    if not os.path.exists(changes_folder_path):
        os.mkdir(changes_folder_path)

    devnet_chain = {
        "network_name": "holeskycopy",
        "exit_fork_version": "04017000",
    }

    correct_devnet_chain = {
        "network_name": "holeskycopy",
        "genesis_fork_version": "01017000",
        "exit_fork_version": "04017000",
        "genesis_validator_root": "9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1"
    }

    devnet_chain_setting = json.dumps(devnet_chain)
    keystore_password = 'solo-stakers'

    credential = Credential(
        mnemonic='aban aban aban aban aban aban aban aban aban aban aban abou',
        mnemonic_password='',
        index=0,
        amount=0,
        chain_setting=get_devnet_chain_setting(**correct_devnet_chain),
        hex_withdrawal_address=None,
        compounding=False,
    )

    keystore_filepath = credential.save_signing_keystore(keystore_password, changes_folder_path, time.time())

    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change-keystore',
        '--output_folder', my_folder_path,
        '--devnet_chain_setting', devnet_chain_setting,
        '--keystore', keystore_filepath,
        '--keystore_password', keystore_password,
        '--validator_index', '1',
        '--withdrawal_address', '0xcd60A5f152724480c3a95E4Ff4dacEEf4074854d',
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 1

    clean_btec_keystore_folder(my_folder_path)
