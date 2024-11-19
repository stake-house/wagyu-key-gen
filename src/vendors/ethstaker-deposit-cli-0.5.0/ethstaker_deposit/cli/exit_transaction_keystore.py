import click
import os
import sys
import time
from typing import Any, Optional

from ethstaker_deposit.exceptions import ValidationError
from ethstaker_deposit.utils.exit_transaction import exit_transaction_generation, export_exit_transaction_json
from ethstaker_deposit.key_handling.keystore import Keystore
from ethstaker_deposit.settings import (
    MAINNET,
    ALL_CHAIN_KEYS,
    get_chain_setting,
    BaseChainSetting,
)
from ethstaker_deposit.utils import config
from ethstaker_deposit.utils.click import (
    captive_prompt_callback,
    choice_prompt_func,
    jit_option,
    prompt_if_none,
    prompt_if_other_is_none,
)
from ethstaker_deposit.utils.constants import DEFAULT_EXIT_TRANSACTION_FOLDER_NAME
from ethstaker_deposit.utils.intl import (
    closest_match,
    load_text,
)
from ethstaker_deposit.utils.validation import (
    validate_int_range,
    validate_keystore_file,
    verify_signed_exit_json,
    validate_devnet_chain_setting,
)


FUNC_NAME = 'exit_transaction_keystore'


@click.command(
    help=load_text(['arg_exit_transaction_keystore', 'help'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: closest_match(x, ALL_CHAIN_KEYS),
        choice_prompt_func(
            lambda: load_text(['arg_exit_transaction_keystore_chain', 'prompt'], func=FUNC_NAME),
            ALL_CHAIN_KEYS
        ),
        prompt_if=prompt_if_other_is_none('devnet_chain_setting'),
        default=MAINNET,
    ),
    default=MAINNET,
    help=lambda: load_text(['arg_exit_transaction_keystore_chain', 'help'], func=FUNC_NAME),
    param_decls='--chain',
    prompt=False,  # the callback handles the prompt
)
@jit_option(
    callback=captive_prompt_callback(
        lambda file: validate_keystore_file(file),
        lambda: load_text(['arg_exit_transaction_keystore_keystore', 'prompt'], func=FUNC_NAME),
        prompt_if=prompt_if_none,
    ),
    help=lambda: load_text(['arg_exit_transaction_keystore_keystore', 'help'], func=FUNC_NAME),
    param_decls='--keystore',
    prompt=False,
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: x,
        lambda: load_text(['arg_exit_transaction_keystore_keystore_password', 'prompt'], func=FUNC_NAME),
        None,
        lambda: load_text(['arg_exit_transaction_keystore_keystore_password', 'invalid'], func=FUNC_NAME),
        True,
    ),
    help=lambda: load_text(['arg_exit_transaction_keystore_keystore_password', 'help'], func=FUNC_NAME),
    hide_input=True,
    param_decls='--keystore_password',
    prompt=lambda: load_text(['arg_exit_transaction_keystore_keystore_password', 'prompt'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda num: validate_int_range(num, 0, 2**32),
        lambda: load_text(['arg_validator_index', 'prompt'], func=FUNC_NAME),
    ),
    help=lambda: load_text(['arg_validator_index', 'help'], func=FUNC_NAME),
    param_decls='--validator_index',
    prompt=lambda: load_text(['arg_validator_index', 'prompt'], func=FUNC_NAME),
)
@jit_option(
    default=0,
    help=lambda: load_text(['arg_exit_transaction_keystore_epoch', 'help'], func=FUNC_NAME),
    param_decls='--epoch',
)
@jit_option(
    default=os.getcwd(),
    help=lambda: load_text(['arg_exit_transaction_keystore_output_folder', 'help'], func=FUNC_NAME),
    param_decls='--output_folder',
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
)
@jit_option(
    callback=validate_devnet_chain_setting,
    default=None,
    help=lambda: load_text(['arg_devnet_chain_setting', 'help'], func=FUNC_NAME),
    param_decls='--devnet_chain_setting',
    is_eager=True,
)
@click.pass_context
def exit_transaction_keystore(
        ctx: click.Context,
        chain: str,
        keystore: Keystore,
        keystore_password: str,
        validator_index: int,
        epoch: int,
        output_folder: str,
        devnet_chain_setting: Optional[BaseChainSetting],
        **kwargs: Any) -> None:
    try:
        secret_bytes = keystore.decrypt(keystore_password)
    except ValueError:
        click.echo(load_text(['arg_exit_transaction_keystore_keystore_password', 'mismatch']), err=True)
        sys.exit(1)

    signing_key = int.from_bytes(secret_bytes, 'big')

    # Get chain setting
    chain_setting = devnet_chain_setting if devnet_chain_setting is not None else get_chain_setting(chain)

    signed_exit = exit_transaction_generation(
        chain_setting=chain_setting,
        signing_key=signing_key,
        validator_index=validator_index,
        epoch=epoch,
    )

    folder = os.path.join(output_folder, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)
    if not os.path.exists(folder):
        os.mkdir(folder)

    click.echo(load_text(['msg_exit_transaction_creation']))
    saved_folder = export_exit_transaction_json(folder=folder, signed_exit=signed_exit, timestamp=time.time())

    click.echo(load_text(['msg_verify_exit_transaction']))
    if (not verify_signed_exit_json(saved_folder, keystore.pubkey, chain_setting)):
        raise ValidationError(load_text(['err_verify_exit_transaction']))

    click.echo(load_text(['msg_creation_success']) + saved_folder)
    if not config.non_interactive:
        click.pause(load_text(['msg_pause']))
