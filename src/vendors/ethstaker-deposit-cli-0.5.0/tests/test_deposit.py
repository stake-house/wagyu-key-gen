import os
import socket
import sys

import click
from click.testing import CliRunner

from ethstaker_deposit.deposit import check_connectivity, check_python_version, cli
from tests.test_cli.helpers import clean_key_folder


def test_should_notify_user_and_exit_if_invalid_python_version(monkeypatch) -> None:
    exit_called = False

    def _mock_sys_exit(arg):
        nonlocal exit_called
        exit_called = True

    pause_called = False

    def _mock_click_pause(text):
        nonlocal pause_called
        pause_called = True

    monkeypatch.setattr(click, 'pause', _mock_click_pause)
    monkeypatch.setattr(sys, 'exit', _mock_sys_exit)
    monkeypatch.setattr(sys, 'version_info', (3, 8))

    check_python_version()

    assert exit_called is True
    assert pause_called is True


def test_should_not_exit_if_valid_python_version(monkeypatch) -> None:
    exit_called = False

    def _mock_sys_exit():
        nonlocal exit_called
        exit_called = True

    monkeypatch.setattr(sys, 'exit', _mock_sys_exit)
    monkeypatch.setattr(sys, 'version_info', (3, 9))

    check_python_version()

    assert exit_called is False


def test_should_pause_if_connected(monkeypatch) -> None:
    pause_called = False

    def _mock_click_pause(text):
        nonlocal pause_called
        pause_called = True

    def _mock_socket_getaddrinfo(url, port):
        return True

    monkeypatch.setattr(click, 'pause', _mock_click_pause)
    monkeypatch.setattr(socket, 'getaddrinfo', _mock_socket_getaddrinfo)

    check_connectivity()
    assert pause_called is True


def test_should_not_pause_if_not_connected(monkeypatch) -> None:
    pause_called = False

    def _mock_click_pause(text):
        nonlocal pause_called
        pause_called = True

    def _mock_socket_getaddrinfo(url, port):
        raise OSError()

    monkeypatch.setattr(click, 'pause', _mock_click_pause)
    monkeypatch.setattr(socket, 'getaddrinfo', _mock_socket_getaddrinfo)

    check_connectivity()
    assert pause_called is False


def test_should_check_connectivity_by_default(monkeypatch) -> None:
    connectivity_called = False

    def _mock_socket_getaddrinfo(url, port):
        nonlocal connectivity_called
        connectivity_called = True
        raise OSError()

    monkeypatch.setattr(socket, 'getaddrinfo', _mock_socket_getaddrinfo)

    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    runner = CliRunner()
    inputs = [
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '0', '0', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        'existing-mnemonic',
        '--withdrawal_address', '',
        '--folder', my_folder_path,

    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0
    assert connectivity_called is True

    clean_key_folder(my_folder_path)


def test_should_not_check_connectivity_with_ignore_connectivity(monkeypatch) -> None:
    connectivity_called = False

    def _mock_socket_getaddrinfo(url, port):
        nonlocal connectivity_called
        connectivity_called = True
        raise OSError()

    monkeypatch.setattr(socket, 'getaddrinfo', _mock_socket_getaddrinfo)
    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    runner = CliRunner()
    inputs = [
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        '0', '0', '1', 'mainnet', 'MyPasswordIs', 'MyPasswordIs', '']
    data = '\n'.join(inputs)
    arguments = [
        '--language', 'english',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--withdrawal_address', '',
        '--folder', my_folder_path,

    ]
    result = runner.invoke(cli, arguments, input=data)

    assert result.exit_code == 0
    assert connectivity_called is False

    clean_key_folder(my_folder_path)


def test_should_not_check_connectivity_with_non_interactive(monkeypatch) -> None:
    connectivity_called = False

    def _mock_socket_getaddrinfo(url, port):
        nonlocal connectivity_called
        connectivity_called = True
        raise OSError()

    monkeypatch.setattr(socket, 'getaddrinfo', _mock_socket_getaddrinfo)

    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        'existing-mnemonic',
        '--num_validators', '1',
        '--mnemonic', 'aban aban aban aban aban aban aban aban aban aban aban abou',
        '--validator_start_index', '0',
        '--chain', 'mainnet',
        '--keystore_password', 'MyPasswordIs',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0
    assert connectivity_called is False

    clean_key_folder(my_folder_path)


def test_should_not_check_connectivity_with_both_non_interactive_or_ignore_connectivity(monkeypatch) -> None:
    connectivity_called = False

    def _mock_socket_getaddrinfo(url, port):
        nonlocal connectivity_called
        connectivity_called = True
        raise OSError()

    monkeypatch.setattr(socket, 'getaddrinfo', _mock_socket_getaddrinfo)

    my_folder_path = os.path.join(os.getcwd(), 'TESTING_TEMP_FOLDER')
    clean_key_folder(my_folder_path)
    if not os.path.exists(my_folder_path):
        os.mkdir(my_folder_path)
    runner = CliRunner()
    arguments = [
        '--language', 'english',
        '--non_interactive',
        '--ignore_connectivity',
        'existing-mnemonic',
        '--num_validators', '1',
        '--mnemonic', 'aban aban aban aban aban aban aban aban aban aban aban abou',
        '--mnemonic_password', 'TREZOR',
        '--validator_start_index', '0',
        '--chain', 'mainnet',
        '--keystore_password', 'MyPasswordIs',
        '--withdrawal_address', '',
        '--folder', my_folder_path,
    ]
    result = runner.invoke(cli, arguments)

    assert result.exit_code == 0
    assert connectivity_called is False

    clean_key_folder(my_folder_path)
