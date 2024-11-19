import click
import os
import sys
import time
from typing import Any, Optional

from eth_typing import HexAddress

from ethstaker_deposit.bls_to_execution_change_keystore import (
    bls_to_execution_change_keystore_generation,
    export_bls_to_execution_change_keystore_json,
)
from ethstaker_deposit.exceptions import ValidationError
from ethstaker_deposit.key_handling.keystore import Keystore
from ethstaker_deposit.utils import config
from ethstaker_deposit.utils.validation import (
    validate_withdrawal_address,
    validate_int_range,
    validate_keystore_file,
    verify_bls_to_execution_change_keystore_json,
    validate_devnet_chain_setting,
)
from ethstaker_deposit.utils.constants import (
    DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME,
)
from ethstaker_deposit.utils.click import (
    captive_prompt_callback,
    choice_prompt_func,
    jit_option,
    prompt_if_none,
    prompt_if_other_is_none,
)
from ethstaker_deposit.utils.intl import (
    closest_match,
    load_text,
)
from ethstaker_deposit.settings import (
    MAINNET,
    ALL_CHAIN_KEYS,
    get_chain_setting,
    BaseChainSetting,
)


FUNC_NAME = 'generate_bls_to_execution_change_keystore'


@click.command(
    help=load_text(['arg_generate_bls_to_execution_change', 'help'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: closest_match(x, ALL_CHAIN_KEYS),
        choice_prompt_func(
            lambda: load_text(['arg_chain', 'prompt'], func=FUNC_NAME),
            ALL_CHAIN_KEYS
        ),
        prompt_if=prompt_if_other_is_none('devnet_chain_setting'),
        default=MAINNET,
    ),
    default=MAINNET,
    help=lambda: load_text(['arg_chain', 'help'], func=FUNC_NAME),
    param_decls='--chain',
    prompt=False,  # the callback handles the prompt
)
@jit_option(
    callback=captive_prompt_callback(
        lambda file: validate_keystore_file(file),
        lambda: load_text(['arg_bls_to_execution_changes_keystore_keystore', 'prompt'], func=FUNC_NAME),
        prompt_if=prompt_if_none,
    ),
    help=lambda: load_text(['arg_bls_to_execution_changes_keystore_keystore', 'help'], func=FUNC_NAME),
    param_decls='--keystore',
    prompt=False,
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: x,
        lambda: load_text(['arg_bls_to_execution_changes_keystore_keystore_password', 'prompt'], func=FUNC_NAME),
        None,
        lambda: load_text(['arg_bls_to_execution_changes_keystore_keystore_password', 'invalid'], func=FUNC_NAME),
        True,
    ),
    help=lambda: load_text(['arg_bls_to_execution_changes_keystore_keystore_password', 'help'], func=FUNC_NAME),
    hide_input=True,
    param_decls='--keystore_password',
    prompt=lambda: load_text(['arg_bls_to_execution_changes_keystore_keystore_password', 'prompt'], func=FUNC_NAME),
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
    callback=captive_prompt_callback(
        lambda address: validate_withdrawal_address(None, None, address, True),
        lambda: load_text(['arg_withdrawal_address', 'prompt'], func=FUNC_NAME),
        lambda: load_text(['arg_withdrawal_address', 'confirm'], func=FUNC_NAME),
        lambda: load_text(['arg_withdrawal_address', 'mismatch'], func=FUNC_NAME),
        prompt_if=prompt_if_none,
    ),
    help=lambda: load_text(['arg_withdrawal_address', 'help'], func=FUNC_NAME),
    param_decls=['--withdrawal_address'],
    prompt=False,  # the callback handles the prompt
)
@jit_option(
    default=os.getcwd(),
    help=lambda: load_text(['arg_bls_to_execution_changes_keystore_output_folder', 'help'], func=FUNC_NAME),
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
def generate_bls_to_execution_change_keystore(
        ctx: click.Context,
        chain: str,
        keystore: Keystore,
        keystore_password: str,
        validator_index: int,
        withdrawal_address: HexAddress,
        output_folder: str,
        devnet_chain_setting: Optional[BaseChainSetting],
        **kwargs: Any) -> None:
    try:
        secret_bytes = keystore.decrypt(keystore_password)
    except ValueError:
        click.echo(load_text(['arg_bls_to_execution_changes_keystore_keystore_password', 'mismatch']), err=True)
        sys.exit(1)

    signing_key = int.from_bytes(secret_bytes, 'big')

    # Get chain setting
    chain_setting = devnet_chain_setting if devnet_chain_setting is not None else get_chain_setting(chain)

    signed_btec = bls_to_execution_change_keystore_generation(
        chain_setting=chain_setting,
        signing_key=signing_key,
        validator_index=validator_index,
        withdrawal_address=withdrawal_address,
    )

    folder = os.path.join(output_folder, DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME)
    if not os.path.exists(folder):
        os.mkdir(folder)

    click.echo(load_text(['msg_key_creation']))
    saved_folder = export_bls_to_execution_change_keystore_json(folder=folder,
                                                                signed_execution_change=signed_btec,
                                                                timestamp=time.time())

    click.echo(load_text(['msg_verify_btec']))
    if (not verify_bls_to_execution_change_keystore_json(saved_folder, keystore.pubkey, chain_setting)):
        raise ValidationError(load_text(['err_verify_btec']))

    click.echo(load_text(['msg_creation_success']) + saved_folder)
    if not config.non_interactive:
        click.pause(load_text(['msg_pause']))
