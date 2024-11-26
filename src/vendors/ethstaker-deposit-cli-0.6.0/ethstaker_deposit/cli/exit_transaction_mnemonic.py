import click
import concurrent.futures
import os
import time

from typing import Any, Sequence, Dict, Optional
from ethstaker_deposit.cli.existing_mnemonic import load_mnemonic_arguments_decorator
from ethstaker_deposit.credentials import Credential
from ethstaker_deposit.exceptions import ValidationError
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
    prompt_if_other_is_none,
)
from ethstaker_deposit.utils.constants import DEFAULT_EXIT_TRANSACTION_FOLDER_NAME
from ethstaker_deposit.utils.intl import (
    closest_match,
    load_text,
)
from ethstaker_deposit.utils.validation import (
    validate_int_range,
    validate_validator_indices,
    verify_signed_exit_json,
    validate_devnet_chain_setting,
)


def _credential_builder(kwargs: Dict[str, Any]) -> Credential:
    return Credential(**kwargs)


def _exit_exporter(kwargs: Dict[str, Any]) -> str:
    credential: Credential = kwargs.pop('credential')
    return credential.save_exit_transaction(**kwargs)


def _exit_verifier(kwargs: Dict[str, Any]) -> bool:
    credential: Credential = kwargs.pop('credential')
    kwargs['pubkey'] = credential.signing_pk.hex()
    kwargs['chain_setting'] = credential.chain_setting
    return verify_signed_exit_json(**kwargs)


FUNC_NAME = 'exit_transaction_mnemonic'


@click.command(
    help=load_text(['arg_exit_transaction_mnemonic', 'help'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: closest_match(x, ALL_CHAIN_KEYS),
        choice_prompt_func(
            lambda: load_text(['arg_exit_transaction_mnemonic_chain', 'prompt'], func=FUNC_NAME),
            ALL_CHAIN_KEYS
        ),
        prompt_if=prompt_if_other_is_none('devnet_chain_setting'),
        default=MAINNET,
    ),
    default=MAINNET,
    help=lambda: load_text(['arg_exit_transaction_mnemonic_chain', 'help'], func=FUNC_NAME),
    param_decls='--chain',
    prompt=False,  # the callback handles the prompt
)
@load_mnemonic_arguments_decorator
@jit_option(
    callback=captive_prompt_callback(
        lambda num: validate_int_range(num, 0, 2**32),
        lambda: load_text(['arg_exit_transaction_mnemonic_start_index', 'prompt'], func=FUNC_NAME),
    ),
    default=0,
    help=lambda: load_text(['arg_exit_transaction_mnemonic_start_index', 'help'], func=FUNC_NAME),
    param_decls="--validator_start_index",
    prompt=lambda: load_text(['arg_exit_transaction_mnemonic_start_index', 'prompt'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda validator_indices: validate_validator_indices(validator_indices),
        lambda: load_text(['arg_exit_transaction_mnemonic_indices', 'prompt'], func=FUNC_NAME),
    ),
    help=lambda: load_text(['arg_exit_transaction_mnemonic_indices', 'help'], func=FUNC_NAME),
    param_decls='--validator_indices',
    prompt=lambda: load_text(['arg_exit_transaction_mnemonic_indices', 'prompt'], func=FUNC_NAME),
)
@jit_option(
    default=0,
    help=lambda: load_text(['arg_exit_transaction_mnemonic_epoch', 'help'], func=FUNC_NAME),
    param_decls='--epoch',
)
@jit_option(
    default=os.getcwd(),
    help=lambda: load_text(['arg_exit_transaction_mnemonic_output_folder', 'help'], func=FUNC_NAME),
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
def exit_transaction_mnemonic(
        ctx: click.Context,
        chain: str,
        mnemonic: str,
        mnemonic_password: str,
        validator_start_index: int,
        validator_indices: Sequence[int],
        epoch: int,
        output_folder: str,
        devnet_chain_setting: Optional[BaseChainSetting],
        **kwargs: Any) -> None:

    folder = os.path.join(output_folder, DEFAULT_EXIT_TRANSACTION_FOLDER_NAME)

    # Get chain setting
    chain_setting = devnet_chain_setting if devnet_chain_setting is not None else get_chain_setting(chain)

    num_keys = len(validator_indices)
    key_indices = range(validator_start_index, validator_start_index + num_keys)

    # We are not using CredentialList because from_mnemonic assumes key generation flow
    credentials = []
    with click.progressbar(length=num_keys, label=load_text(['msg_key_creation']),  # type: ignore[var-annotated]
                           show_percent=False, show_pos=True) as bar:

        executor_kwargs = [{
            'mnemonic': mnemonic,
            'mnemonic_password': mnemonic_password,
            'index': index,
            'amount': 0,
            'chain_setting': chain_setting,
            'hex_withdrawal_address': None,
            'compounding': False,
        } for index in key_indices]

        with concurrent.futures.ProcessPoolExecutor() as executor:
            for credential in executor.map(_credential_builder, executor_kwargs):
                credentials.append(credential)
                bar.update(1)

    if not os.path.exists(folder):
        os.mkdir(folder)

    transaction_filefolders = []
    with click.progressbar(length=num_keys,  # type: ignore[var-annotated]
                           label=load_text(['msg_exit_transaction_creation']),
                           show_percent=False, show_pos=True) as bar:

        executor_kwargs = [{
            'credential': credential,
            'validator_index': validator_index,
            'epoch': epoch,
            'folder': folder,
            'timestamp': time.time(),
        } for credential, validator_index in zip(credentials, validator_indices)]

        with concurrent.futures.ProcessPoolExecutor() as executor:
            for filefolder in executor.map(_exit_exporter, executor_kwargs):
                transaction_filefolders.append(filefolder)
                bar.update(1)

    with click.progressbar(length=num_keys,  # type: ignore[var-annotated]
                           label=load_text(['msg_verify_exit_transaction']),
                           show_percent=False, show_pos=True) as bar:

        executor_kwargs = [{
            'file_folder': file,
            'credential': credential,
        } for file, credential in zip(transaction_filefolders, credentials)]

        with concurrent.futures.ProcessPoolExecutor() as executor:
            for valid_exit in executor.map(_exit_verifier, executor_kwargs):
                bar.update(1)
                if not valid_exit:
                    raise ValidationError(load_text(['err_verify_exit_transactions']))

    click.echo(load_text(['msg_creation_success']) + folder)
    if not config.non_interactive:
        click.pause(load_text(['msg_pause']))
