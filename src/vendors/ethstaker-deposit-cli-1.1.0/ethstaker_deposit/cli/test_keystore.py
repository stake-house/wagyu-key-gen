import click
import sys
from typing import Any

from ethstaker_deposit.key_handling.keystore import Keystore
from ethstaker_deposit.utils import config
from ethstaker_deposit.utils.click import (
    captive_prompt_callback,
    jit_option,
    prompt_if_none,
)
from ethstaker_deposit.utils.intl import (
    load_text,
)
from ethstaker_deposit.utils.validation import validate_keystore_file


FUNC_NAME = 'test_keystore'


@click.command(
    help=load_text(['arg_test_keystore', 'help'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda file: validate_keystore_file(file),
        lambda: load_text(['arg_test_keystore_keystore', 'prompt'], func=FUNC_NAME),
        prompt_if=prompt_if_none,
    ),
    help=lambda: load_text(['arg_test_keystore_keystore', 'help'], func=FUNC_NAME),
    param_decls='--keystore',
    prompt=False,
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: x,
        lambda: load_text(['arg_test_keystore_keystore_password', 'prompt'], func=FUNC_NAME),
        None,
        lambda: load_text(['arg_test_keystore_keystore_password', 'invalid'], func=FUNC_NAME),
        True,
    ),
    help=lambda: load_text(['arg_test_keystore_keystore_password', 'help'], func=FUNC_NAME),
    hide_input=True,
    param_decls='--keystore_password',
    prompt=lambda: load_text(['arg_test_keystore_keystore_password', 'prompt'], func=FUNC_NAME),
)
@click.pass_context
def test_keystore(
        ctx: click.Context,
        keystore: Keystore,
        keystore_password: str,
        **kwargs: Any) -> None:
    click.echo(load_text(['msg_verify_keystore_file']))

    try:
        keystore.decrypt(keystore_password)
    except ValueError:
        click.echo(load_text(['arg_test_keystore_keystore_password', 'mismatch']), err=True)
        sys.exit(1)

    click.echo(load_text(['msg_verification_success']))
    if not config.non_interactive:
        click.pause(load_text(['msg_pause']))
