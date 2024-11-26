from decimal import Decimal, InvalidOperation
import click
import json
import re
import sys
import concurrent.futures
from typing import Any, Dict, Sequence, Optional

from click.types import BoolParamType
from click.exceptions import BadParameter

from eth_typing import (
    BLSPubkey,
    BLSSignature,
    HexAddress,
)
from eth_utils import is_hex_address, is_checksum_address, to_normalized_address, decode_hex
from py_ecc.bls import G2ProofOfPossession as bls

from ethstaker_deposit.exceptions import ValidationError
from ethstaker_deposit.key_handling.keystore import Keystore
from ethstaker_deposit.utils.intl import load_text
from ethstaker_deposit.utils.ssz import (
    BLSToExecutionChange,
    BLSToExecutionChangeKeystore,
    DepositData,
    DepositMessage,
    SignedBLSToExecutionChangeKeystore,
    SignedVoluntaryExit,
    VoluntaryExit,
    compute_bls_to_execution_change_domain,
    compute_bls_to_execution_change_keystore_domain,
    compute_deposit_domain,
    compute_signing_root,
    compute_voluntary_exit_domain,
)
from ethstaker_deposit.credentials import (
    Credential,
)
from ethstaker_deposit.utils.constants import (
    BLS_WITHDRAWAL_PREFIX,
    COMPOUNDING_WITHDRAWAL_PREFIX,
    ETH2GWEI,
    EXECUTION_ADDRESS_WITHDRAWAL_PREFIX,
    MIN_DEPOSIT_AMOUNT,
    MAX_DEPOSIT_AMOUNT,
)
from ethstaker_deposit.utils.crypto import SHA256
from ethstaker_deposit.settings import BaseChainSetting, get_devnet_chain_setting


#
# Deposit
#


def verify_deposit_data_json(filefolder: str, credentials: Sequence[Credential]) -> bool:
    """
    Validate every deposit found in the deposit-data JSON file folder.
    """
    all_valid_deposits = True
    deposit_json = []
    with open(filefolder, 'r', encoding='utf-8') as f:
        deposit_json = json.load(f)

    with click.progressbar(length=len(deposit_json),  # type: ignore[var-annotated]
                           label=load_text(['msg_deposit_verification']),
                           show_percent=False, show_pos=True) as bar:

        with concurrent.futures.ProcessPoolExecutor() as executor:
            for valid_deposit in executor.map(validate_deposit, deposit_json, credentials):
                all_valid_deposits &= valid_deposit
                bar.update(1)

    return all_valid_deposits


def validate_deposit(deposit_data_dict: Dict[str, Any], credential: Credential = None) -> bool:
    '''
    Checks whether a deposit is valid based on the staking deposit rules.
    https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md#deposits
    '''
    pubkey = BLSPubkey(bytes.fromhex(deposit_data_dict['pubkey']))
    withdrawal_credentials = bytes.fromhex(deposit_data_dict['withdrawal_credentials'])
    amount = deposit_data_dict['amount']
    signature = BLSSignature(bytes.fromhex(deposit_data_dict['signature']))
    deposit_message_root = bytes.fromhex(deposit_data_dict['deposit_data_root'])
    fork_version = bytes.fromhex(deposit_data_dict['fork_version'])

    # Verify pubkey
    if len(pubkey) != 48:
        return False
    if credential and pubkey != credential.signing_pk:
        return False

    # Verify withdrawal credential
    if len(withdrawal_credentials) != 32:
        return False
    if withdrawal_credentials[:1] == BLS_WITHDRAWAL_PREFIX:
        if credential and withdrawal_credentials[:1] != credential.withdrawal_prefix:
            return False
        if withdrawal_credentials[1:] != SHA256(credential.withdrawal_pk)[1:]:
            return False
    elif (
        withdrawal_credentials[:1] == EXECUTION_ADDRESS_WITHDRAWAL_PREFIX
        or withdrawal_credentials[:1] == COMPOUNDING_WITHDRAWAL_PREFIX
    ):
        if credential and withdrawal_credentials[:1] != credential.withdrawal_prefix:
            return False
        if withdrawal_credentials[1:12] != b'\x00' * 11:
            return False
        if credential and credential.withdrawal_address is None:
            return False
        if credential and withdrawal_credentials[12:] != credential.withdrawal_address:
            return False
    else:
        return False

    # Verify deposit amount
    if not MIN_DEPOSIT_AMOUNT <= amount <= MAX_DEPOSIT_AMOUNT:
        return False

    # Verify deposit signature && pubkey
    deposit_message = DepositMessage(  # type: ignore[no-untyped-call]
        pubkey=pubkey,
        withdrawal_credentials=withdrawal_credentials,
        amount=amount
    )

    domain = compute_deposit_domain(fork_version)
    signing_root = compute_signing_root(deposit_message, domain)
    if not bls.Verify(pubkey, signing_root, signature):
        return False

    # Verify Deposit Root
    signed_deposit = DepositData(  # type: ignore[no-untyped-call]
        pubkey=pubkey,
        withdrawal_credentials=withdrawal_credentials,
        amount=amount,
        signature=signature,
    )
    return signed_deposit.hash_tree_root == deposit_message_root


def validate_password_strength(password: str) -> str:
    if len(password) < 12:
        raise ValidationError(load_text(['msg_password_length']))

    encoding = sys.stdin.encoding.lower()
    if encoding != 'utf-8' and not password.isascii():
        if sys.platform == 'win32':
            raise ValidationError(load_text(['msg_password_utf8_win32']))
        else:
            raise ValidationError(load_text(['msg_password_utf8']))

    return password


def validate_int_range(num: Any, low: int, high: int) -> int:
    '''
    Verifies that `num` is an `int` and low <= num < high
    '''
    try:
        num_int = int(num)  # Try cast to int
        if num_int != float(num):  # Check num is not float
            raise ValidationError('Num is float')
        if not (low <= num_int < high):  # Check num in range
            raise ValidationError('Num is not in range')
        return num_int
    except (ValueError, ValidationError):
        raise ValidationError(load_text(['err_not_positive_integer']))


def validate_withdrawal_address(cts: click.Context, param: Any, address: str, require: bool = False) -> HexAddress:
    if address in ("", None):
        if require:
            raise ValidationError(load_text(['err_missing_address']))
        return None
    if not is_hex_address(address):
        raise ValidationError(load_text(['err_invalid_ECDSA_hex_addr']))
    if not is_checksum_address(address):
        raise ValidationError(load_text(['err_invalid_ECDSA_hex_addr_checksum']))

    normalized_address = to_normalized_address(address)
    click.echo('\n%s\n' % load_text(['msg_ECDSA_hex_addr_withdrawal']))
    return normalized_address


def validate_yesno(ctx: click.Context, param: Any, value: str) -> bool:
    '''
    Verifies that a value is part of the bool values accepted by click. The string values “1”, “true”,
    “t”, “yes”, “y”, and “on” convert to True. “0”, “false”, “f”, “no”, “n”, and “off” convert to False.
    '''
    try:
        param = BoolParamType()
        return param.convert(value, param, ctx)
    except BadParameter:
        raise ValidationError(load_text(['err_invalid_bool_value']))


def validate_deposit_amount(amount: str) -> int:
    '''
    Verifies that `amount` is a valid gwei denomination and 1 ether <= amount <= MAX_DEPOSIT_AMOUNT gwei
    Amount is expected to be in ether and the returned value will be converted to gwei and represented as an int
    '''
    try:
        decimal_ether = Decimal(amount)
        amount_gwei = decimal_ether * Decimal(ETH2GWEI)

        if amount_gwei % 1 != 0:
            raise ValidationError(load_text(['err_not_gwei_denomination']))

        if amount_gwei < 1 * ETH2GWEI:
            raise ValidationError(load_text(['err_min_deposit']))

        if amount_gwei > MAX_DEPOSIT_AMOUNT:
            raise ValidationError(load_text(['err_max_deposit']))

        return int(amount_gwei)
    except InvalidOperation:
        raise ValidationError(load_text(['err_invalid_amount']))


#
# BLSToExecutionChange
#

def _bls_to_execution_change_validator(kwargs: Dict[str, Any]) -> bool:
    return validate_bls_to_execution_change(**kwargs)


def verify_bls_to_execution_change_json(filefolder: str,
                                        credentials: Sequence[Credential],
                                        *,
                                        input_validator_indices: Sequence[int],
                                        input_withdrawal_address: str,
                                        chain_setting: BaseChainSetting) -> bool:
    """
    Validate every BLSToExecutionChange found in the bls_to_execution_change JSON file folder.
    """
    btec_json = []
    with open(filefolder, 'r', encoding='utf-8') as f:
        btec_json = json.load(f)

    all_valid_bls_changes = True
    with click.progressbar(length=len(btec_json),  # type: ignore[var-annotated]
                           label=load_text(['msg_bls_to_execution_change_verification']),
                           show_percent=False, show_pos=True) as bar:

        executor_kwargs = [{
            'btec_dict': btec,
            'credential': credential,
            'input_validator_index': input_validator_index,
            'input_withdrawal_address': input_withdrawal_address,
            'chain_setting': chain_setting,
        } for btec, credential, input_validator_index in zip(btec_json, credentials, input_validator_indices)]

        with concurrent.futures.ProcessPoolExecutor() as executor:
            for valid_bls_change in executor.map(_bls_to_execution_change_validator, executor_kwargs):
                all_valid_bls_changes &= valid_bls_change
                bar.update(1)

    return all_valid_bls_changes


def validate_bls_to_execution_change(btec_dict: Dict[str, Any],
                                     credential: Credential,
                                     *,
                                     input_validator_index: int,
                                     input_withdrawal_address: str,
                                     chain_setting: BaseChainSetting) -> bool:
    validator_index = int(btec_dict['message']['validator_index'])
    from_bls_pubkey = BLSPubkey(decode_hex(btec_dict['message']['from_bls_pubkey']))
    to_execution_address = decode_hex(btec_dict['message']['to_execution_address'])
    signature = BLSSignature(decode_hex(btec_dict['signature']))
    genesis_validators_root = decode_hex(btec_dict['metadata']['genesis_validators_root'])

    if validator_index != input_validator_index:
        return False
    if from_bls_pubkey != credential.withdrawal_pk:
        return False
    if (
        to_execution_address != credential.withdrawal_address
        or to_execution_address != decode_hex(input_withdrawal_address)
    ):
        return False
    if genesis_validators_root != chain_setting.GENESIS_VALIDATORS_ROOT:
        return False

    message = BLSToExecutionChange(  # type: ignore[no-untyped-call]
        validator_index=validator_index,
        from_bls_pubkey=from_bls_pubkey,
        to_execution_address=to_execution_address,
    )
    domain = compute_bls_to_execution_change_domain(
        fork_version=chain_setting.GENESIS_FORK_VERSION,
        genesis_validators_root=genesis_validators_root,
    )
    signing_root = compute_signing_root(message, domain)

    if not bls.Verify(BLSPubkey(credential.withdrawal_pk), signing_root, signature):
        return False

    return True


def normalize_bls_withdrawal_credentials_to_bytes(bls_withdrawal_credentials: str) -> bytes:
    if bls_withdrawal_credentials.startswith('0x'):
        bls_withdrawal_credentials = bls_withdrawal_credentials[2:]

    try:
        bls_withdrawal_credentials_bytes = bytes.fromhex(bls_withdrawal_credentials)
    except Exception:
        raise ValidationError(load_text(['err_incorrect_hex_form']) + '\n')
    return bls_withdrawal_credentials_bytes


def is_execution_address_withdrawal_credentials(withdrawal_credentials: bytes) -> bool:
    return (
        len(withdrawal_credentials) == 32
        and withdrawal_credentials[:1] == EXECUTION_ADDRESS_WITHDRAWAL_PREFIX
        and withdrawal_credentials[1:12] == b'\x00' * 11
    )


def validate_bls_withdrawal_credentials(bls_withdrawal_credentials: str) -> bytes:
    bls_withdrawal_credentials_bytes = normalize_bls_withdrawal_credentials_to_bytes(bls_withdrawal_credentials)

    if is_execution_address_withdrawal_credentials(bls_withdrawal_credentials_bytes):
        raise ValidationError(load_text(['err_is_already_01_form']) + '\n')

    try:
        if len(bls_withdrawal_credentials_bytes) != 32:
            raise ValidationError('Length is not 32')
        if bls_withdrawal_credentials_bytes[:1] != BLS_WITHDRAWAL_PREFIX:
            raise ValidationError('Prefix is wrong')
    except (ValueError, ValidationError):
        raise ValidationError(load_text(['err_not_bls_form']) + '\n')

    return bls_withdrawal_credentials_bytes


def normalize_input_list(input: str) -> Sequence[str]:
    try:
        input = input.strip('[({})]')
        input = re.sub(' +', ' ', input)
        result = re.split(r'; |, | |,|;', input)
    except Exception:
        raise ValidationError(load_text(['err_incorrect_list']) + '\n')
    return result


def validate_bls_withdrawal_credentials_list(input_bls_withdrawal_credentials_list: str) -> Sequence[bytes]:
    bls_withdrawal_credentials_list = normalize_input_list(input_bls_withdrawal_credentials_list)
    return [validate_bls_withdrawal_credentials(cred) for cred in bls_withdrawal_credentials_list]


def validate_validator_indices(input_validator_indices: str) -> Sequence[int]:
    normalized_list = normalize_input_list(input_validator_indices)
    return [validate_int_range(index, 0, 2**32) for index in normalized_list]


def validate_bls_withdrawal_credentials_matching(bls_withdrawal_credentials: bytes, credential: Credential) -> None:
    if bls_withdrawal_credentials[1:] != SHA256(credential.withdrawal_pk)[1:]:
        raise ValidationError(load_text(['err_not_matching']) + '\n')


#
# Exit Message Validation
#


def validate_keystore_file(file_path: str) -> Keystore:
    try:
        saved_keystore = Keystore.from_file(file_path)
    except FileNotFoundError:
        # Required as captive_prompt_callback does not utilize click type argument for validation
        raise ValidationError(load_text(['err_file_not_found']) + '\n')
    except Exception:
        raise ValidationError(load_text(['err_invalid_keystore_file']) + '\n')
    return saved_keystore


def verify_signed_exit_json(file_folder: str, pubkey: str, chain_setting: BaseChainSetting) -> bool:
    with open(file_folder, 'r', encoding='utf-8') as f:
        deposit_json: SignedVoluntaryExit = json.load(f)
        signature = deposit_json["signature"]
        message = deposit_json["message"]
        return validate_signed_exit(message["validator_index"], message["epoch"], signature, pubkey, chain_setting)


def validate_signed_exit(validator_index: str,
                         epoch: str,
                         signature: str,
                         pubkey: str,
                         chain_setting: BaseChainSetting) -> bool:
    bls_pubkey = BLSPubkey(bytes.fromhex(pubkey))
    bls_signature = BLSSignature(decode_hex(signature))
    message = VoluntaryExit(  # type: ignore[no-untyped-call]
        epoch=int(epoch),
        validator_index=int(validator_index)
    )

    domain = compute_voluntary_exit_domain(
        fork_version=chain_setting.EXIT_FORK_VERSION,
        genesis_validators_root=chain_setting.GENESIS_VALIDATORS_ROOT
    )

    signing_root = compute_signing_root(message, domain)
    return bls.Verify(bls_pubkey, signing_root, bls_signature)


#
# BLS to Execution Change Keystore Validation
#


def verify_bls_to_execution_change_keystore_json(file_folder: str,
                                                 pubkey: str,
                                                 chain_setting: BaseChainSetting) -> bool:
    with open(file_folder, 'r', encoding='utf-8') as f:
        deposit_json: SignedBLSToExecutionChangeKeystore = json.load(f)
        signature = deposit_json["signature"]
        message = deposit_json["message"]
        return validate_bls_to_execution_change_keystore(message["validator_index"],
                                                         message["to_execution_address"],
                                                         signature,
                                                         pubkey,
                                                         chain_setting)


def validate_bls_to_execution_change_keystore(validator_index: str,
                                              to_execution_address: str,
                                              signature: str,
                                              pubkey: str,
                                              chain_setting: BaseChainSetting) -> bool:
    bls_pubkey = BLSPubkey(bytes.fromhex(pubkey))
    bls_signature = BLSSignature(decode_hex(signature))
    message = BLSToExecutionChangeKeystore(  # type: ignore[no-untyped-call]
        to_execution_address=decode_hex(to_execution_address),
        validator_index=int(validator_index)
    )

    domain = compute_bls_to_execution_change_keystore_domain(
        fork_version=chain_setting.GENESIS_FORK_VERSION,
        genesis_validators_root=chain_setting.GENESIS_VALIDATORS_ROOT
    )

    signing_root = compute_signing_root(message, domain)
    return bls.Verify(bls_pubkey, signing_root, bls_signature)


#
# Devnet Chain Setting Validation
#

def validate_devnet_chain_setting(ctx: click.Context, param: Any, value: Optional[str]) -> Optional[BaseChainSetting]:
    if value is None:
        return None

    # Trimming to protect against unnecessaryly large JSON payload, see https://docs.python.org/3/library/json.html
    trimmed_value = value[:400]

    if validate_devnet_chain_setting_json(trimmed_value):
        click.echo('\n%s\n' % load_text(['arg_devnet_chain_setting_warning']))
        devnet_chain_setting_dict = json.loads(trimmed_value)
        chain_setting = get_devnet_chain_setting(
            network_name=devnet_chain_setting_dict['network_name'],
            genesis_fork_version=devnet_chain_setting_dict['genesis_fork_version'],
            exit_fork_version=devnet_chain_setting_dict['exit_fork_version'],
            genesis_validator_root=devnet_chain_setting_dict.get('genesis_validator_root', None),
        )
        click.echo(str(chain_setting) + '\n')
        return chain_setting
    else:
        raise ValidationError(load_text(['err_invalid_devnet_chain_setting']) + '\n')


def validate_devnet_chain_setting_json(json_value: str) -> bool:
    try:
        devnet_chain_setting_dict = json.loads(json_value)

        if not isinstance(devnet_chain_setting_dict, dict):
            raise ValidationError(load_text(['err_devnet_chain_setting_not_object']) + '\n')

        required_keys = ('network_name', 'genesis_fork_version', 'exit_fork_version')

        all_keys = all(key in devnet_chain_setting_dict for key in required_keys)

        if not all_keys:
            raise ValidationError(load_text(['err_devnet_chain_setting_missing_keys']) + '\n')

        if len(devnet_chain_setting_dict) not in (3, 4):
            raise ValidationError(load_text(['err_devnet_chain_setting_key_length']) + '\n')

        if len(devnet_chain_setting_dict) == 4 and 'genesis_validator_root' not in devnet_chain_setting_dict:
            raise ValidationError(load_text(['err_devnet_chain_setting_invalid_fourth_key']) + '\n')

        return True
    except json.JSONDecodeError:
        raise ValidationError(load_text(['err_devnet_chain_setting_invalid_json']) + '\n')

        return False
