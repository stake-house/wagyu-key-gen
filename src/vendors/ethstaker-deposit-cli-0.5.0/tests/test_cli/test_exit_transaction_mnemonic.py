import asyncio
import os
import pytest
import json

from click.testing import CliRunner

from ethstaker_deposit.deposit import cli
from ethstaker_deposit.utils.constants import DEFAULT_EXIT_TRANSACTION_FOLDER_NAME

from tests.test_cli.helpers import clean_exit_transaction_folder, read_json_file, verify_file_permission


def test_exit_transaction_mnemonic() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_exit_transaction_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-mnemonic',
        '--output_folder', my_folder_path,
        '--chain', 'mainnet',
        '--mnemonic', 'aban aban aban aban aban aban aban aban aban aban aban abou',
        '--validator_start_index', '0',
        '--validator_indices', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    exit_transaction_folder_path = os.path.join(my_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    _, _, exit_transaction_files = next(os.walk(exit_transaction_folder_path))

    assert len(set(exit_transaction_files)) == 1

    json_data = read_json_file(exit_transaction_folder_path, exit_transaction_files[0])

    # Verify file content
    assert json_data['message']['epoch'] == '1234'
    assert json_data['message']['validator_index'] == '1'
    assert json_data['signature']

    # Verify file permissions
    verify_file_permission(os, folder_path=exit_transaction_folder_path, files=exit_transaction_files)

    # Clean up
    clean_exit_transaction_folder(my_folder_path)


@pytest.mark.asyncio
async def test_exit_transaction_mnemonic_multiple() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_exit_transaction_folder(my_folder_path)
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
        'exit-transaction-mnemonic',
        '--output_folder', my_folder_path,
        '--chain', 'mainnet',
        '--mnemonic', '"aban aban aban aban aban aban aban aban aban aban aban abou"',
        '--validator_start_index', '0',
        '--validator_indices', '0,1,2,3',
        '--epoch', '1234',
    ]
    proc = await asyncio.create_subprocess_shell(
        ' '.join(cmd_args),
    )
    await proc.wait()

    assert proc.returncode == 0

    # Check files
    exit_transaction_folder_path = os.path.join(my_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    _, _, exit_transaction_files = next(os.walk(exit_transaction_folder_path))

    assert len(set(exit_transaction_files)) == 4

    # Verify file content
    exit_transaction_files.sort()
    for index in [0, 1, 2, 3]:
        json_data = read_json_file(exit_transaction_folder_path, exit_transaction_files[index])
        assert json_data['message']['epoch'] == '1234'
        assert json_data['message']['validator_index'] == str(index)
        assert json_data['signature']

    # Verify file permissions
    verify_file_permission(os, folder_path=exit_transaction_folder_path, files=exit_transaction_files)

    # Clean up
    clean_exit_transaction_folder(my_folder_path)


@pytest.mark.parametrize(
    'chain, mnemonic, start_index, indices, epoch, assertion',
    [
        ('asdf', "aban aban aban aban aban aban aban aban aban aban aban abou", 0, 0, 0, 1),
        ('holesky', "this is not valid", 0, 0, 0, 1),
        # 2 exit code due to thrown ValidationError
        ('holesky', "aban aban aban aban aban aban aban aban aban aban aban abou", "a", 0, 0, 2),
        ('holesky', "aban aban aban aban aban aban aban aban aban aban aban abou", 0, "b", 0, 1),
        # 2 exit code due to thrown ValidationError
        ('holesky', "aban aban aban aban aban aban aban aban aban aban aban abou", 0, 0, "c", 2),
    ]
)
def test_exit_mnemonic_invalid_params(chain, mnemonic, start_index, indices, epoch, assertion) -> None:
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_exit_transaction_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)

    runner = CliRunner()
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-mnemonic',
        '--output_folder', my_folder_path,
        '--chain', chain,
        '--mnemonic', mnemonic,
        '--validator_start_index', start_index,
        '--validator_indices', indices,
        '--epoch', epoch,
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == assertion


def test_exit_transaction_mnemonic_custom_network() -> None:
    # Prepare folder
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_exit_transaction_folder(my_folder_path)
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
    inputs = []
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'exit-transaction-mnemonic',
        '--output_folder', my_folder_path,
        '--devnet_chain_setting', devnet_chain_setting,
        '--mnemonic', 'aban aban aban aban aban aban aban aban aban aban aban abou',
        '--validator_start_index', '0',
        '--validator_indices', '1',
        '--epoch', '1234',
    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0

    # Check files
    exit_transaction_folder_path = os.path.join(my_folder_path, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    _, _, exit_transaction_files = next(os.walk(exit_transaction_folder_path))

    assert len(set(exit_transaction_files)) == 1

    json_data = read_json_file(exit_transaction_folder_path, exit_transaction_files[0])

    # Verify file content
    assert json_data['message']['epoch'] == '1234'
    assert json_data['message']['validator_index'] == '1'
    assert json_data['signature']

    # Verify file permissions
    verify_file_permission(os, folder_path=exit_transaction_folder_path, files=exit_transaction_files)

    # Clean up
    clean_exit_transaction_folder(my_folder_path)
