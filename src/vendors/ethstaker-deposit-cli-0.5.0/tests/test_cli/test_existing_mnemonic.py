import asyncio
import json
import os

import pytest
from click.testing import CliRunner

from eth_utils import decode_hex

from ethstaker_deposit.deposit import cli
from ethstaker_deposit.utils.constants import (
    DEFAULT_VALIDATOR_KEYS_FOLDER_NAME,
    EXECUTION_ADDRESS_WITHDRAWAL_PREFIX,
    COMPOUNDING_WITHDRAWAL_PREFIX,
    MIN_ACTIVATION_AMOUNT,
    ETH2GWEI,
)
from .helpers import clean_key_folder, get_permissions, get_uuid


def test_existing_mnemonic_bls_withdrawal() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_withdrawal_address() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address, '', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--folder', my_folder_path,
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        deposits_dict = json.load(f)
    for deposit in deposits_dict:
        withdrawal_credentials = bytes.fromhex(deposit['withdrawal_credentials'])
        assert withdrawal_credentials == (
            EXECUTION_ADDRESS_WITHDRAWAL_PREFIX + b'\x00' * 11 + decode_hex(withdrawal_address)
        )

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_compounding_validators() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address, 'yes', '', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--folder', my_folder_path,
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        deposits_dict = json.load(f)
    for deposit in deposits_dict:
        withdrawal_credentials = bytes.fromhex(deposit['withdrawal_credentials'])
        assert withdrawal_credentials == (
            COMPOUNDING_WITHDRAWAL_PREFIX + b'\x00' * 11 + decode_hex(withdrawal_address)
        )
        amount = deposit['amount']
        assert amount == MIN_ACTIVATION_AMOUNT

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_compounding_custom_amount() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    custom_amount = 1050

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address, 'yes', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--folder', my_folder_path,
        '--amount', str(custom_amount),
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        deposits_dict = json.load(f)
    for deposit in deposits_dict:
        withdrawal_credentials = bytes.fromhex(deposit['withdrawal_credentials'])
        assert withdrawal_credentials == (
            COMPOUNDING_WITHDRAWAL_PREFIX + b'\x00' * 11 + decode_hex(withdrawal_address)
        )
        amount = deposit['amount']
        assert amount == (custom_amount * ETH2GWEI)

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_compounding_cli_args() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    custom_amount = 247

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address, '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--folder', my_folder_path,
        '--compounding',
        '--amount', str(custom_amount),
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        deposits_dict = json.load(f)
    for deposit in deposits_dict:
        withdrawal_credentials = bytes.fromhex(deposit['withdrawal_credentials'])
        assert withdrawal_credentials == (
            COMPOUNDING_WITHDRAWAL_PREFIX + b'\x00' * 11 + decode_hex(withdrawal_address)
        )
        amount = deposit['amount']
        assert amount == (custom_amount * ETH2GWEI)

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_withdrawal_address_bad_checksum() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()

    # NOTE: final 'A' needed to be an 'a'
    wrong_withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705FA'
    correct_withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'

    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'mainnet', 'MyPasswordIs', 'MyPasswordIs',
        wrong_withdrawal_address, correct_withdrawal_address, correct_withdrawal_address, '', ''
    ]
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--folder', my_folder_path,
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        deposits_dict = json.load(f)
    for deposit in deposits_dict:
        withdrawal_credentials = bytes.fromhex(deposit['withdrawal_credentials'])
        assert withdrawal_credentials == (
            EXECUTION_ADDRESS_WITHDRAWAL_PREFIX + b'\x00' * 11 + decode_hex(correct_withdrawal_address)
        )

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_pbkdf2_new_mnemonic() -> None:
    # Prepare pbkdf2 folder
    pbkdf2_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(pbkdf2_folder_path)
    if not os.path.exists(pbkdf2_folder_path):
        os.mkdir(pbkdf2_folder_path)

    # Prepare scrypt folder
    scrypt_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER_2')
    clean_key_folder(scrypt_folder_path)
    if not os.path.exists(scrypt_folder_path):
        os.mkdir(scrypt_folder_path)

    runner = CliRunner()
    inputs = [
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '0', '0', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '',
    ]
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        'existing-mnemonic',
        '--withdrawal_address', '',
        '--folder', pbkdf2_folder_path,
        '--pbkdf2',
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    arguments = [
        '--language', 'english',
        'existing-mnemonic',
        '--withdrawal_address', '',
        '--folder', scrypt_folder_path,
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    # Load store generated files
    validator_keys_folder_path = os.path.join(pbkdf2_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        pbkdf2_deposit_dict = json.load(f)[0]

    keystore_file = [key_file for key_file in key_files if key_file.startswith('keystore-m_')][0]
    with open(validator_keys_folder_path + '/' + keystore_file, 'r', encoding='utf-8') as f:
        pbkdf2_keystore_dict = json.load(f)

    validator_keys_folder_path = os.path.join(scrypt_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        scrypt_deposit_dict = json.load(f)[0]

    keystore_file = [key_file for key_file in key_files if key_file.startswith('keystore-m_')][0]
    with open(validator_keys_folder_path + '/' + keystore_file, 'r', encoding='utf-8') as f:
        scrypt_keystore_dict = json.load(f)

    # Verify deposit files
    assert pbkdf2_deposit_dict['withdrawal_credentials'] == scrypt_deposit_dict['withdrawal_credentials']
    assert pbkdf2_deposit_dict['pubkey'] == scrypt_deposit_dict['pubkey']
    assert pbkdf2_deposit_dict['signature'] == scrypt_deposit_dict['signature']
    assert pbkdf2_deposit_dict['deposit_message_root'] == scrypt_deposit_dict['deposit_message_root']
    assert pbkdf2_deposit_dict['deposit_data_root'] == scrypt_deposit_dict['deposit_data_root']

    # Verify keystore files
    assert pbkdf2_keystore_dict['crypto']['kdf']['function'] == 'pbkdf2'
    assert scrypt_keystore_dict['crypto']['kdf']['function'] == 'scrypt'
    assert pbkdf2_keystore_dict['pubkey'] == scrypt_keystore_dict['pubkey']

    # Clean up
    clean_key_folder(pbkdf2_folder_path)
    clean_key_folder(scrypt_folder_path)


@pytest.mark.asyncio
async def test_script() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    if os.name == 'nt':  # Windows
        run_script_cmd = 'sh deposit.sh'
    else:  # Mac or Linux
        run_script_cmd = './deposit.sh'

    install_cmd = run_script_cmd + ' install'
    proc = await asyncio.create_subprocess_shell(
        install_cmd,
    )
    await proc.wait()

    cmd_args = [
        run_script_cmd,
        '--language', 'english',
        '--non_interactive',
        'existing-mnemonic',
        '--num_validators', '1',
        '--mnemonic="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"',
        '--mnemonic_password', 'TREZOR',
        '--validator_start_index', '1',
        '--chain', 'mainnet',
        '--keystore_password', 'MyPasswordIs',
        '--withdrawal_address', '""',
        '--folder', my_folder_path,
    ]
    proc = await asyncio.create_subprocess_shell(
        ' '.join(cmd_args),
    )
    await proc.wait()

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


@pytest.mark.asyncio
async def test_script_abbreviated_mnemonic() -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    if os.name == 'nt':  # Windows
        run_script_cmd = 'sh deposit.sh'
    else:  # Mac or Linux
        run_script_cmd = './deposit.sh'

    install_cmd = run_script_cmd + ' install'
    proc = await asyncio.create_subprocess_shell(
        install_cmd,
    )
    await proc.wait()

    cmd_args = [
        run_script_cmd,
        '--language', 'english',
        '--non_interactive',
        'existing-mnemonic',
        '--num_validators', '1',
        '--mnemonic="aban aban aban aban aban aban aban aban aban aban aban abou"',
        '--mnemonic_password', 'TREZOR',
        '--validator_start_index', '1',
        '--chain', 'mainnet',
        '--keystore_password', 'MyPasswordIs',
        '--withdrawal_address', '""',
        '--folder', my_folder_path,
    ]
    proc = await asyncio.create_subprocess_shell(
        ' '.join(cmd_args),
    )
    await proc.wait()

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_custom_testnet() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    devnet_chain = {
        "network_name": "holeskycopy",
        "genesis_fork_version": "01017000",
        "exit_fork_version": "04017000",
        "genesis_validator_root": "9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1"
    }

    devnet_chain_setting = json.dumps(devnet_chain)

    runner = CliRunner()
    inputs = [
        'TREZOR',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '2', '2', '5', 'MyPasswordIs', 'MyPasswordIs', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
        '--mnemonic_password', 'TREZOR',
        '--devnet_chain_setting', devnet_chain_setting,
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_multiple_languages() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    inputs = [
        'TREZOR',
        '的 的 的 的 的 的 的 的 的 的 的 在', '1',
        '2', '2', '5', 'MyPasswordIs', 'MyPasswordIs', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--chain', 'holesky',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)


def test_existing_mnemonic_multiple_languages_argument() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    inputs = [
        'TREZOR',
        '的 的 的 的 的 的 的 的 的 的 的 在',
        '2', '2', '5', 'MyPasswordIs', 'MyPasswordIs', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--chain', 'holesky',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
        '--mnemonic_language', '简体中文',
        '--mnemonic_password', 'TREZOR',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 5

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'
    # Clean up
    clean_key_folder(my_folder_path)
