import json
import click
import os
import sys
import time

from eth_typing import HexAddress
from eth_utils import to_canonical_address
from py_ecc.bls import G2ProofOfPossession as bls
from typing import Any, Optional

from ethstaker_deposit.key_handling.keystore import Keystore
from ethstaker_deposit.settings import (
    fake_cli_version,
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
    prompt_if_other_exists,
)
from ethstaker_deposit.utils.constants import (
    DEFAULT_PARTIAL_DEPOSIT_FOLDER_NAME,
    EXECUTION_ADDRESS_WITHDRAWAL_PREFIX,
    COMPOUNDING_WITHDRAWAL_PREFIX,
)
from ethstaker_deposit.utils.deposit import export_deposit_data_json
from ethstaker_deposit.utils.intl import (
    closest_match,
    load_text,
)
from ethstaker_deposit.utils.ssz import (
    DepositData,
    DepositMessage,
    compute_deposit_domain,
    compute_signing_root,
)
from ethstaker_deposit.utils.validation import (
    validate_deposit,
    validate_keystore_file,
    validate_deposit_amount,
    validate_withdrawal_address,
    validate_yesno,
    validate_devnet_chain_setting,
)


FUNC_NAME = 'partial_deposit'


@click.command(
    help=load_text(['arg_partial_deposit', 'help'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: closest_match(x, ALL_CHAIN_KEYS),
        choice_prompt_func(
            lambda: load_text(['arg_partial_deposit_chain', 'prompt'], func=FUNC_NAME),
            ALL_CHAIN_KEYS
        ),
        prompt_if=prompt_if_other_is_none('devnet_chain_setting'),
        default=MAINNET,
    ),
    default=MAINNET,
    help=lambda: load_text(['arg_partial_deposit_chain', 'help'], func=FUNC_NAME),
    param_decls='--chain',
    prompt=False,  # the callback handles the prompt
)
@jit_option(
    callback=captive_prompt_callback(
        lambda file: validate_keystore_file(file),
        lambda: load_text(['arg_partial_deposit_keystore', 'prompt'], func=FUNC_NAME),
        prompt_if=prompt_if_none,
    ),
    help=lambda: load_text(['arg_partial_deposit_keystore', 'help'], func=FUNC_NAME),
    param_decls='--keystore',
    prompt=False,
)
@jit_option(
    callback=captive_prompt_callback(
        lambda x: x,
        lambda: load_text(['arg_partial_deposit_keystore_password', 'prompt'], func=FUNC_NAME),
        None,
        lambda: load_text(['arg_partial_deposit_keystore_password', 'invalid'], func=FUNC_NAME),
        True,
    ),
    help=lambda: load_text(['arg_partial_deposit_keystore_password', 'help'], func=FUNC_NAME),
    hide_input=True,
    param_decls='--keystore_password',
    prompt=lambda: load_text(['arg_partial_deposit_keystore_password', 'prompt'], func=FUNC_NAME),
)
@jit_option(
    callback=captive_prompt_callback(
        lambda amount: validate_deposit_amount(amount),
        lambda: load_text(['arg_partial_deposit_amount', 'prompt'], func=FUNC_NAME),
        default="32",
        prompt_if=prompt_if_none,
    ),
    default="32",
    help=lambda: load_text(['arg_partial_deposit_amount', 'help'], func=FUNC_NAME),
    param_decls='--amount',
    prompt=False,  # the callback handles the prompt, to avoid second callback with gwei
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
    param_decls=['--withdrawal_address', '--execution_address', '--eth1_withdrawal_credentials'],
    prompt=False,  # the callback handles the prompt
)
@jit_option(
    callback=captive_prompt_callback(
        lambda value: validate_yesno(None, None, value),
        lambda: load_text(['arg_compounding', 'prompt'], func=FUNC_NAME),
        default="False",
        prompt_if=prompt_if_other_exists('withdrawal_address'),
    ),
    default=False,
    help=lambda: load_text(['arg_compounding', 'help'], func=FUNC_NAME),
    param_decls='--compounding/--regular-withdrawal',
    prompt=False,  # the callback handles the prompt
    type=bool,
    show_default=True,
)
@jit_option(
    default=os.getcwd(),
    help=lambda: load_text(['arg_partial_deposit_output_folder', 'help'], func=FUNC_NAME),
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
def partial_deposit(
        ctx: click.Context,
        chain: str,
        keystore: Keystore,
        keystore_password: str,
        amount: int,
        withdrawal_address: HexAddress,
        compounding: bool,
        output_folder: str,
        devnet_chain_setting: Optional[BaseChainSetting],
        **kwargs: Any) -> None:
    try:
        secret_bytes = keystore.decrypt(keystore_password)
    except ValueError:
        click.echo(load_text(['arg_partial_deposit_keystore_password', 'mismatch']), err=True)
        sys.exit(1)

    signing_key = int.from_bytes(secret_bytes, 'big')

    # Get chain setting
    chain_setting = devnet_chain_setting if devnet_chain_setting is not None else get_chain_setting(chain)

    if compounding:
        withdrawal_credentials = COMPOUNDING_WITHDRAWAL_PREFIX
    else:
        withdrawal_credentials = EXECUTION_ADDRESS_WITHDRAWAL_PREFIX

    withdrawal_credentials += b'\x00' * 11
    withdrawal_credentials += to_canonical_address(withdrawal_address)

    deposit_message = DepositMessage(  # type: ignore[no-untyped-call]
        pubkey=bls.SkToPk(signing_key),
        withdrawal_credentials=withdrawal_credentials,
        amount=amount
    )

    domain = compute_deposit_domain(fork_version=chain_setting.GENESIS_FORK_VERSION)

    signing_root = compute_signing_root(deposit_message, domain)
    signature = bls.Sign(signing_key, signing_root)

    signed_deposit = DepositData(  # type: ignore[no-untyped-call]
        **deposit_message.as_dict(),  # type: ignore[no-untyped-call]
        signature=signature
    )

    folder = os.path.join(output_folder, DEFAULT_PARTIAL_DEPOSIT_FOLDER_NAME)
    if not os.path.exists(folder):
        os.mkdir(folder)

    click.echo(load_text(['msg_partial_deposit_creation']))
    deposit_data = signed_deposit.as_dict()  # type: ignore[no-untyped-call]
    deposit_data.update({'deposit_message_root': deposit_message.hash_tree_root})
    deposit_data.update({'deposit_data_root': signed_deposit.hash_tree_root})
    deposit_data.update({'fork_version': chain_setting.GENESIS_FORK_VERSION})
    deposit_data.update({'network_name': chain_setting.NETWORK_NAME})
    deposit_data.update({'deposit_cli_version': fake_cli_version})
    saved_folder = export_deposit_data_json(folder, time.time(), [deposit_data])

    click.echo(load_text(['msg_verify_partial_deposit']))
    deposit_json = []
    with open(saved_folder, 'r', encoding='utf-8') as f:
        deposit_json = json.load(f)

    if (not validate_deposit(deposit_json[0])):
        click.echo(load_text(['err_verify_partial_deposit']))
        return

    click.echo(load_text(['msg_creation_success']) + saved_folder)
    if not config.non_interactive:
        click.pause(load_text(['msg_pause']))
