import click
import socket
import sys
from multiprocessing import freeze_support

from ethstaker_deposit.cli.existing_mnemonic import existing_mnemonic
from ethstaker_deposit.cli.exit_transaction_keystore import exit_transaction_keystore
from ethstaker_deposit.cli.exit_transaction_mnemonic import exit_transaction_mnemonic
from ethstaker_deposit.cli.generate_bls_to_execution_change import generate_bls_to_execution_change
from ethstaker_deposit.cli.generate_bls_to_execution_change_keystore import generate_bls_to_execution_change_keystore
from ethstaker_deposit.cli.new_mnemonic import new_mnemonic
from ethstaker_deposit.cli.partial_deposit import partial_deposit
from ethstaker_deposit.cli.test_keystore import test_keystore
from ethstaker_deposit.exceptions import MultiLanguageError, ValidationError
from ethstaker_deposit.utils.click import (
    captive_prompt_callback,
    choice_prompt_func,
    jit_option,
    deactivate_prompts_callback
)
from ethstaker_deposit.utils import config
from ethstaker_deposit.utils.constants import INTL_LANG_OPTIONS
from ethstaker_deposit.utils.intl import (
    get_first_options,
    fuzzy_reverse_dict_lookup,
    load_text,
)
from ethstaker_deposit.settings import (
    DEPOSIT_CLI_VERSION,
)


def check_python_version() -> None:
    '''
    Checks that the python version running is sufficient and exits if not.
    '''
    if sys.version_info < (3, 9):
        click.pause(load_text(['err_python_version']))
        sys.exit(78)


def check_connectivity() -> None:
    '''
    Checks if there is an internet connection and warns the user if so.
    '''
    if '--help' in sys.argv:
        return None
    try:
        socket.setdefaulttimeout(2)
        socket.getaddrinfo('icann.org', 80)
        click.pause(load_text(['connectivity_warning']))
    except OSError:
        return None


# Define commands available to the user and their order
commands = [
    new_mnemonic,
    existing_mnemonic,
    generate_bls_to_execution_change,
    generate_bls_to_execution_change_keystore,
    exit_transaction_keystore,
    exit_transaction_mnemonic,
    partial_deposit,
    test_keystore,
]


class SortedGroup(click.Group):

    def list_commands(self, ctx: click.Context) -> list[str]:
        return [x.name for x in commands]


@click.group(cls=SortedGroup)
@click.pass_context
@jit_option(
    '--language',
    callback=captive_prompt_callback(
        lambda language: fuzzy_reverse_dict_lookup(language, INTL_LANG_OPTIONS),
        choice_prompt_func(lambda: 'Please choose your language', get_first_options(INTL_LANG_OPTIONS)),
        default='English',
    ),
    default='English',
    help='The language you wish to use the CLI in.',
    prompt=choice_prompt_func(lambda: 'Please choose your language', get_first_options(INTL_LANG_OPTIONS))(),
    type=str,
)
@click.option(
    '--non_interactive',
    callback=deactivate_prompts_callback(["language"]),
    default=False,
    is_flag=True,
    help=(
        'Disables interactive prompts. Warning: With this flag, there will be no confirmation step(s) to verify the '
        'input value(s). This will also ignore the connectivity check. Please use it carefully.'
    ),
    hidden=False,
)
@click.option(
    '--ignore_connectivity',
    default=False,
    is_flag=True,
    help=(
        'Disables internet connectivity check. Warning: It is strongly recommended not to use this tool with internet '
        'access. Ignoring this check can further the risk of theft and compromise of your generated key material.'
    ),
    hidden=False,
)
@click.version_option(version=DEPOSIT_CLI_VERSION)
def cli(ctx: click.Context, language: str, non_interactive: bool, ignore_connectivity: bool) -> None:
    if not ignore_connectivity and not non_interactive:
        check_connectivity()
    config.language = language
    config.non_interactive = non_interactive  # Remove interactive commands


for command in commands:
    cli.add_command(command)


def run() -> None:
    freeze_support()  # Needed when running under Windows in a frozen bundle
    check_python_version()

    try:
        cli()
    except (MultiLanguageError, ValueError, ValidationError) as e:
        click.echo(f"\nError: {e}\n", err=True)
        sys.exit(1)


if __name__ == '__main__':
    run()
