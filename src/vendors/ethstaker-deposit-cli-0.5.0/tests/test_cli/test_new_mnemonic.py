import asyncio
import json
import os
import sys

import pytest
import inspect
from decimal import Decimal
from click.testing import CliRunner

from eth_utils import decode_hex

from ethstaker_deposit.cli import new_mnemonic
from ethstaker_deposit.deposit import cli
from ethstaker_deposit.key_handling.key_derivation.mnemonic import abbreviate_words
from ethstaker_deposit.utils.constants import (
    BLS_WITHDRAWAL_PREFIX,
    DEFAULT_VALIDATOR_KEYS_FOLDER_NAME,
    EXECUTION_ADDRESS_WITHDRAWAL_PREFIX,
    COMPOUNDING_WITHDRAWAL_PREFIX,
    MIN_ACTIVATION_AMOUNT,
    ETH2GWEI,
)
from ethstaker_deposit.utils.intl import load_text
from .helpers import clean_key_folder, get_permissions, get_uuid


@pytest.fixture(autouse=True)
def check_async(request):
    if inspect.iscoroutinefunction(request.node.obj):
        os.environ['IS_ASYNC_TEST'] = '1'
    else:
        os.environ['IS_ASYNC_TEST'] = '0'


def test_new_mnemonic_bls_withdrawal(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    inputs = ['english', 'english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--ignore_connectivity',
        'new-mnemonic',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_new_mnemonic_withdrawal_address(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = ['english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address, '',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
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
        amount = deposit['amount']
        assert amount == MIN_ACTIVATION_AMOUNT

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_new_mnemonic_compounding_validators(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = ['english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address,
              'yes', '',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_new_mnemonic_compounding_custom_amount(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    custom_amount = 1050

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = ['english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address,
              'yes', str(custom_amount),
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_new_mnemonic_compounding_custom_amount_decimal(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    custom_amount = Decimal('1120.25')

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = ['english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', withdrawal_address, withdrawal_address,
              'yes', str(custom_amount),
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
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
        assert amount == int(custom_amount * ETH2GWEI)

    all_uuid = [
        get_uuid(validator_keys_folder_path + '/' + key_file)
        for key_file in key_files
        if key_file.startswith('keystore')
    ]
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_new_mnemonic_withdrawal_address_bad_checksum(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()

    # NOTE: final 'A' needed to be an 'a'
    wrong_withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705FA'
    correct_withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'

    inputs = ['english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs',
              wrong_withdrawal_address, correct_withdrawal_address, correct_withdrawal_address, '',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_new_mnemonic_withdrawal_address_parameter(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [withdrawal_address, 'english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
        '--withdrawal_address', withdrawal_address,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


# Alternative parameter "--eth1_withdrawal_address" for setting withdrawal credentials
def test_new_mnemonic_eth1_withdrawal_address_param(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [withdrawal_address, 'english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
        '--eth1_withdrawal_address', withdrawal_address,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


# Alternative parameter "--execution_address" for setting withdrawal credentials
def test_new_mnemonic_execution_address_param(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    withdrawal_address = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    inputs = [withdrawal_address, 'english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'new-mnemonic',
        '--folder', my_folder_path,
        '--execution_address', withdrawal_address,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)


def test_pbkdf2_new_mnemonic(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

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

    inputs = ['english', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        'new-mnemonic',
        '--withdrawal_address', '',
        '--folder', pbkdf2_folder_path,
        '--pbkdf2',
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    arguments = [
        '--language', 'english',
        'new-mnemonic',
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


@pytest.mark.skipif(sys.version_info[:2] == (3, 9), reason=(
    "asyncio subprocess is broken in different ways on 3.9 with https://github.com/python/cpython/issues/88050"))
@pytest.mark.asyncio
async def test_script_bls_withdrawal() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
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
        'new-mnemonic',
        '--num_validators', '5',
        '--mnemonic_language', 'english',
        '--chain', 'mainnet',
        '--keystore_password', 'MyPasswordIs',
        '--withdrawal_address', '""',
        '--folder', my_folder_path,
    ]
    proc = await asyncio.create_subprocess_shell(
        ' '.join(cmd_args),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
    )

    seed_phrase = ''
    encoded_phrase = b''
    parsing = False
    mnemonic_json_file = os.path.join(os.getcwd(), 'ethstaker_deposit/../ethstaker_deposit/cli/', 'new_mnemonic.json')
    msg_mnemonic_clipboard_warning = load_text(['msg_mnemonic_clipboard_warning'], mnemonic_json_file, 'new_mnemonic')
    async for out in proc.stdout:
        output = out.decode('utf-8').rstrip()
        if output.startswith(load_text(['msg_mnemonic_presentation'], mnemonic_json_file, 'new_mnemonic')):
            parsing = True
        elif output.startswith(load_text(['msg_mnemonic_retype_prompt'], mnemonic_json_file, 'new_mnemonic')):
            proc.stdin.write(encoded_phrase)
            proc.stdin.write(b'\n')
        elif output.startswith(load_text(['msg_confirm_clipboard_clearing'], mnemonic_json_file, 'new_mnemonic')):
            proc.stdin.write(b'\n')
        elif parsing:
            if (
                not output.startswith('********************')
                and not output.startswith(msg_mnemonic_clipboard_warning)
            ):
                seed_phrase += output
                if len(seed_phrase) > 0:
                    encoded_phrase = seed_phrase.encode()
                    parsing = False

    assert len(seed_phrase) > 0

    await proc.wait()

    # Check files
    validator_keys_folder_path = os.path.join(my_folder_path, DEFAULT_VALIDATOR_KEYS_FOLDER_NAME)
    _, _, key_files = next(os.walk(validator_keys_folder_path))

    deposit_file = [key_file for key_file in key_files if key_file.startswith('deposit_data')][0]
    with open(validator_keys_folder_path + '/' + deposit_file, 'r', encoding='utf-8') as f:
        deposits_dict = json.load(f)
    for deposit in deposits_dict:
        withdrawal_credentials = bytes.fromhex(deposit['withdrawal_credentials'])
        print('withdrawal_credentials', withdrawal_credentials)
        assert withdrawal_credentials[:1] == BLS_WITHDRAWAL_PREFIX

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


@pytest.mark.skipif(sys.version_info[:2] == (3, 9), reason=(
    "asyncio subprocess is broken in different ways on 3.9 with https://github.com/python/cpython/issues/88050"))
@pytest.mark.asyncio
async def test_script_abbreviated_mnemonic() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
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
        'new-mnemonic',
        '--num_validators', '5',
        '--mnemonic_language', 'english',
        '--chain', 'mainnet',
        '--keystore_password', 'MyPasswordIs',
        '--withdrawal_address', '""',
        '--folder', my_folder_path,
    ]
    proc = await asyncio.create_subprocess_shell(
        ' '.join(cmd_args),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
    )

    seed_phrase = ''
    encoded_phrase = b''
    parsing = False
    mnemonic_json_file = os.path.join(os.getcwd(), 'ethstaker_deposit/../ethstaker_deposit/cli/', 'new_mnemonic.json')
    msg_mnemonic_clipboard_warning = load_text(['msg_mnemonic_clipboard_warning'], mnemonic_json_file, 'new_mnemonic')
    async for out in proc.stdout:
        output = out.decode('utf-8').rstrip()
        if output.startswith(load_text(['msg_mnemonic_presentation'], mnemonic_json_file, 'new_mnemonic')):
            parsing = True
        elif output.startswith(load_text(['msg_mnemonic_retype_prompt'], mnemonic_json_file, 'new_mnemonic')):
            proc.stdin.write(encoded_phrase)
            proc.stdin.write(b'\n')
        elif output.startswith(load_text(['msg_confirm_clipboard_clearing'], mnemonic_json_file, 'new_mnemonic')):
            proc.stdin.write(b'\n')
        elif parsing:
            if (
                not output.startswith('********************')
                and not output.startswith(msg_mnemonic_clipboard_warning)
            ):
                seed_phrase += output
                if len(seed_phrase) > 0:
                    abbreviated_mnemonic = ' '.join(abbreviate_words(seed_phrase.split(' ')))
                    encoded_phrase = abbreviated_mnemonic.encode()
                    parsing = False

    assert len(seed_phrase) > 0

    await proc.wait()

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


def test_new_mnemonic_custom_testnet(monkeypatch) -> None:
    # monkeypatch get_mnemonic
    def mock_get_mnemonic(language, words_path, entropy=None) -> str:
        return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

    monkeypatch.setattr(new_mnemonic, "get_mnemonic", mock_get_mnemonic)

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
    inputs = ['english', 'english', '1', 'MyPasswordIs', 'MyPasswordIs',
              'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', '']
    data = '\n'.join(inputs)
    arguments = [
        '--ignore_connectivity',
        'new-mnemonic',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
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
    assert len(set(all_uuid)) == 1

    # Verify file permissions
    if os.name == 'posix':
        for file_name in key_files:
            assert get_permissions(validator_keys_folder_path, file_name) == '0o400'

    # Clean up
    clean_key_folder(my_folder_path)
