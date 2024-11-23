import os
import json

from click.testing import CliRunner

from ethstaker_deposit.deposit import cli
from ethstaker_deposit.utils.constants import DEFAULT_BLS_TO_EXECUTION_CHANGES_FOLDER_NAME
from .helpers import (
    clean_btec_folder,
    prepare_testing_folder,
    verify_file_permission,
)


def test_existing_mnemonic_bls_withdrawal() -> None:
    # Prepare folder
    my_folder_path = prepare_testing_folder(os)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change',
        '--bls_to_execution_changes_folder', my_folder_path,
        '--chain', 'mainnet',
        '--mnemonic', 'sister protect peanut hill ready work profit fit wish want small inflict flip member tail between sick setup bright duck morning sell paper worry',  # noqa: E501
        '--bls_withdrawal_credentials_list', '0x00bd0b5a34de5fb17df08410b5e615dda87caf4fb72d0aac91ce5e52fc6aa8de',
        '--validator_start_index', '0',
        '--validator_indices', '1',
        '--withdrawal_address', '0x3434343434343434343434343434343434343434',
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    # Check files
    bls_to_execution_changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_FOLDER_NAME)
    _, _, btec_files = next(os.walk(bls_to_execution_changes_folder_path))

    # TODO verify file content
    assert len(set(btec_files)) == 1

    # Verify file permissions
    verify_file_permission(os, folder_path=bls_to_execution_changes_folder_path, files=btec_files)

    # Clean up
    clean_btec_folder(my_folder_path)


def test_existing_mnemonic_bls_withdrawal_interactive() -> None:
    # Prepare folder
    my_folder_path = prepare_testing_folder(os)

    runner = CliRunner()
    inputs = [
        'mainnet',  # network/chain
        'sister protect peanut hill ready work profit fit wish want small inflict flip member tail between sick setup bright duck morning sell paper worry',  # noqa: E501
        '0',  # validator_start_index
        '1',  # validator_index
        '0x00bd0b5a34de5fb17df08410b5e615dda87caf4fb72d0aac91ce5e52fc6aa8de',
        '0x3434343434343434343434343434343434343434',
        '0x3434343434343434343434343434343434343434',

    ]
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'generate-bls-to-execution-change',
        '--bls_to_execution_changes_folder', my_folder_path,
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    # Check files
    bls_to_execution_changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_FOLDER_NAME)
    _, _, btec_files = next(os.walk(bls_to_execution_changes_folder_path))

    # TODO verify file content
    assert len(set(btec_files)) == 1

    # Verify file permissions
    verify_file_permission(os, folder_path=bls_to_execution_changes_folder_path, files=btec_files)

    # Clean up
    clean_btec_folder(my_folder_path)


def test_existing_mnemonic_bls_withdrawal_multiple() -> None:
    # Prepare folder
    my_folder_path = prepare_testing_folder(os)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change',
        '--bls_to_execution_changes_folder', my_folder_path,
        '--chain', 'mainnet',
        '--mnemonic', 'sister protect peanut hill ready work profit fit wish want small inflict flip member tail between sick setup bright duck morning sell paper worry',  # noqa: E501
        '--bls_withdrawal_credentials_list', '0x00bd0b5a34de5fb17df08410b5e615dda87caf4fb72d0aac91ce5e52fc6aa8de, 0x00a75d83f169fa6923f3dd78386d9608fab710d8f7fcf71ba9985893675d5382',  # noqa: E501
        '--validator_start_index', '0',
        '--validator_indices', '1,2',
        '--withdrawal_address', '0x3434343434343434343434343434343434343434',
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    # Check files
    bls_to_execution_changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_FOLDER_NAME)
    _, _, btec_files = next(os.walk(bls_to_execution_changes_folder_path))

    # TODO verify file content
    assert len(set(btec_files)) == 1

    # Verify file permissions
    verify_file_permission(os, folder_path=bls_to_execution_changes_folder_path, files=btec_files)

    # Clean up
    clean_btec_folder(my_folder_path)


def test_bls_change_custom_testnet() -> None:
    # Prepare folder
    my_folder_path = prepare_testing_folder(os)

    devnet_chain = {
        "network_name": "holeskycopy",
        "genesis_fork_version": "01017000",
        "exit_fork_version": "04017000",
        "genesis_validator_root": "9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1"
    }

    devnet_chain_setting = json.dumps(devnet_chain)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'generate-bls-to-execution-change',
        '--bls_to_execution_changes_folder', my_folder_path,
        '--devnet_chain_setting', devnet_chain_setting,
        '--mnemonic', 'sister protect peanut hill ready work profit fit wish want small inflict flip member tail between sick setup bright duck morning sell paper worry',  # noqa: E501
        '--bls_withdrawal_credentials_list', '0x00bd0b5a34de5fb17df08410b5e615dda87caf4fb72d0aac91ce5e52fc6aa8de',
        '--validator_start_index', '0',
        '--validator_indices', '1',
        '--withdrawal_address', '0x3434343434343434343434343434343434343434',
    ]
    result = runner.invoke(cli, arguments, input=data)
    assert result.exit_code == 0

    # Check files
    bls_to_execution_changes_folder_path = os.path.join(my_folder_path, DEFAULT_BLS_TO_EXECUTION_CHANGES_FOLDER_NAME)
    _, _, btec_files = next(os.walk(bls_to_execution_changes_folder_path))

    # TODO verify file content
    assert len(set(btec_files)) == 1

    # Verify file permissions
    verify_file_permission(os, folder_path=bls_to_execution_changes_folder_path, files=btec_files)

    # Clean up
    clean_btec_folder(my_folder_path)
