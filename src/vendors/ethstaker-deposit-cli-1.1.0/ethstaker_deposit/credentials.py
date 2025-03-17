import os
import click
from enum import Enum
import time
import json
import concurrent.futures
from typing import Dict, Optional, Any, Sequence

from eth_typing import Address, HexAddress
from eth_utils import to_canonical_address
from py_ecc.bls import G2ProofOfPossession as bls

from ethstaker_deposit.exceptions import ValidationError
from ethstaker_deposit.utils.exit_transaction import exit_transaction_generation, export_exit_transaction_json
from ethstaker_deposit.key_handling.key_derivation.path import mnemonic_and_path_to_key
from ethstaker_deposit.key_handling.keystore import (
    Keystore,
    Pbkdf2Keystore,
    ScryptKeystore,
)
from ethstaker_deposit.settings import (
    fake_cli_version,
    DEPOSIT_CLI_VERSION,
    BaseChainSetting,
)
from ethstaker_deposit.utils.constants import (
    BLS_WITHDRAWAL_PREFIX,
    EXECUTION_ADDRESS_WITHDRAWAL_PREFIX,
    COMPOUNDING_WITHDRAWAL_PREFIX,
    ETH2GWEI,
    MAX_DEPOSIT_AMOUNT,
    MIN_DEPOSIT_AMOUNT,
)
from ethstaker_deposit.utils.crypto import SHA256
from ethstaker_deposit.utils.deposit import export_deposit_data_json as export_deposit_data_json_util
from ethstaker_deposit.utils.intl import load_text
from ethstaker_deposit.utils.ssz import (
    compute_deposit_domain,
    compute_bls_to_execution_change_domain,
    compute_signing_root,
    BLSToExecutionChange,
    DepositData,
    DepositMessage,
    SignedBLSToExecutionChange,
)
from ethstaker_deposit.utils.file_handling import (
    sensitive_opener,
)


class WithdrawalType(Enum):
    BLS_WITHDRAWAL = 0
    EXECUTION_ADDRESS_WITHDRAWAL = 1
    COMPOUNDING_WITHDRAWAL = 2


class Credential:
    """
    A Credential object contains all of the information for a single validator and the corresponding functionality.
    Once created, it is the only object that should be required to perform any processing for a validator.
    """
    def __init__(self, *, mnemonic: str, mnemonic_password: str,
                 index: int, amount: int, chain_setting: BaseChainSetting,
                 hex_withdrawal_address: Optional[HexAddress],
                 compounding: Optional[bool] = False,
                 use_pbkdf2: Optional[bool] = False):
        # Set path as EIP-2334 format
        # https://eips.ethereum.org/EIPS/eip-2334
        purpose = '12381'
        coin_type = '3600'
        account = str(index)
        withdrawal_key_path = f'm/{purpose}/{coin_type}/{account}/0'
        self.signing_key_path = f'{withdrawal_key_path}/0'

        self.withdrawal_sk = mnemonic_and_path_to_key(
            mnemonic=mnemonic, path=withdrawal_key_path, password=mnemonic_password)
        self.signing_sk = mnemonic_and_path_to_key(
            mnemonic=mnemonic, path=self.signing_key_path, password=mnemonic_password)
        self.amount = amount
        self.chain_setting = chain_setting
        self.hex_withdrawal_address = hex_withdrawal_address
        self.compounding = compounding
        self.use_pbkdf2 = use_pbkdf2

    @property
    def signing_pk(self) -> bytes:
        return bls.SkToPk(self.signing_sk)

    @property
    def withdrawal_pk(self) -> bytes:
        return bls.SkToPk(self.withdrawal_sk)

    @property
    def withdrawal_address(self) -> Optional[Address]:
        if self.hex_withdrawal_address is None:
            return None
        return to_canonical_address(self.hex_withdrawal_address)

    @property
    def withdrawal_prefix(self) -> bytes:
        if self.withdrawal_address is not None:
            if self.compounding:
                return COMPOUNDING_WITHDRAWAL_PREFIX
            else:
                return EXECUTION_ADDRESS_WITHDRAWAL_PREFIX
        else:
            return BLS_WITHDRAWAL_PREFIX

    @property
    def withdrawal_type(self) -> WithdrawalType:
        if self.withdrawal_prefix == BLS_WITHDRAWAL_PREFIX:
            return WithdrawalType.BLS_WITHDRAWAL
        elif self.withdrawal_prefix == EXECUTION_ADDRESS_WITHDRAWAL_PREFIX:
            return WithdrawalType.EXECUTION_ADDRESS_WITHDRAWAL
        elif self.withdrawal_prefix == COMPOUNDING_WITHDRAWAL_PREFIX:
            return WithdrawalType.COMPOUNDING_WITHDRAWAL
        else:
            raise ValueError(f"Invalid withdrawal_prefix {self.withdrawal_prefix.hex()}")

    @property
    def withdrawal_credentials(self) -> bytes:
        if self.withdrawal_type == WithdrawalType.BLS_WITHDRAWAL:
            withdrawal_credentials = BLS_WITHDRAWAL_PREFIX
            withdrawal_credentials += SHA256(self.withdrawal_pk)[1:]
        elif (
            self.withdrawal_type == WithdrawalType.EXECUTION_ADDRESS_WITHDRAWAL
            and self.withdrawal_address is not None
        ):
            withdrawal_credentials = EXECUTION_ADDRESS_WITHDRAWAL_PREFIX
            withdrawal_credentials += b'\x00' * 11
            withdrawal_credentials += self.withdrawal_address
        elif (
            self.withdrawal_type == WithdrawalType.COMPOUNDING_WITHDRAWAL
            and self.withdrawal_address is not None
        ):
            withdrawal_credentials = COMPOUNDING_WITHDRAWAL_PREFIX
            withdrawal_credentials += b'\x00' * 11
            withdrawal_credentials += self.withdrawal_address
        else:
            raise ValueError(f"Invalid withdrawal_type {self.withdrawal_type}")
        return withdrawal_credentials

    @property
    def deposit_message(self) -> DepositMessage:
        if not MIN_DEPOSIT_AMOUNT <= self.amount <= MAX_DEPOSIT_AMOUNT:
            raise ValidationError(f"{self.amount / ETH2GWEI} ETH deposits are not within the bounds of this cli.")
        return DepositMessage(  # type: ignore[no-untyped-call]
            pubkey=self.signing_pk,
            withdrawal_credentials=self.withdrawal_credentials,
            amount=self.amount,
        )

    @property
    def signed_deposit(self) -> DepositData:
        domain = compute_deposit_domain(fork_version=self.chain_setting.GENESIS_FORK_VERSION)
        signing_root = compute_signing_root(self.deposit_message, domain)
        signed_deposit = DepositData(  # type: ignore[no-untyped-call]
            **self.deposit_message.as_dict(),  # type: ignore[no-untyped-call]
            signature=bls.Sign(self.signing_sk, signing_root)
        )
        return signed_deposit

    @property
    def deposit_datum_dict(self) -> Dict[str, bytes]:
        """
        Return a single deposit datum for 1 validator including all
        the information needed to verify and process the deposit.
        """
        signed_deposit_datum = self.signed_deposit
        datum_dict = signed_deposit_datum.as_dict()  # type: ignore[no-untyped-call]
        datum_dict.update({'deposit_message_root': self.deposit_message.hash_tree_root})
        datum_dict.update({'deposit_data_root': signed_deposit_datum.hash_tree_root})
        datum_dict.update({'fork_version': self.chain_setting.GENESIS_FORK_VERSION})
        datum_dict.update({'network_name': self.chain_setting.NETWORK_NAME})
        datum_dict.update({'deposit_cli_version': fake_cli_version})
        return datum_dict

    def signing_keystore(self, password: str) -> Keystore:
        secret = self.signing_sk.to_bytes(32, 'big')
        if self.use_pbkdf2:
            return Pbkdf2Keystore.encrypt(secret=secret, password=password, path=self.signing_key_path)
        else:
            return ScryptKeystore.encrypt(secret=secret, password=password, path=self.signing_key_path)

    def save_signing_keystore(self, password: str, folder: str, timestamp: float) -> str:
        keystore = self.signing_keystore(password)
        filefolder = os.path.join(folder, 'keystore-%s-%i.json' % (keystore.path.replace('/', '_'), timestamp))
        keystore.save(filefolder)
        return filefolder

    def verify_keystore(self, keystore_filefolder: str, password: str) -> bool:
        saved_keystore = Keystore.from_file(keystore_filefolder)
        secret_bytes = saved_keystore.decrypt(password)
        return self.signing_sk == int.from_bytes(secret_bytes, 'big')

    def get_bls_to_execution_change(self, validator_index: int) -> SignedBLSToExecutionChange:
        if self.withdrawal_address is None:
            raise ValueError("The withdrawal address should NOT be empty.")
        if self.chain_setting.GENESIS_VALIDATORS_ROOT is None:
            raise ValidationError("The genesis validators root should NOT be empty "
                                  "for this chain to obtain the BLS to execution change.")

        message = BLSToExecutionChange(  # type: ignore[no-untyped-call]
            validator_index=validator_index,
            from_bls_pubkey=self.withdrawal_pk,
            to_execution_address=self.withdrawal_address,
        )
        domain = compute_bls_to_execution_change_domain(
            fork_version=self.chain_setting.GENESIS_FORK_VERSION,
            genesis_validators_root=self.chain_setting.GENESIS_VALIDATORS_ROOT,
        )
        signing_root = compute_signing_root(message, domain)
        signature = bls.Sign(self.withdrawal_sk, signing_root)

        return SignedBLSToExecutionChange(  # type: ignore[no-untyped-call]
            message=message,
            signature=signature,
        )

    def get_bls_to_execution_change_dict(self, validator_index: int) -> Dict[str, bytes]:
        result_dict: Dict[str, Any] = {}
        signed_bls_to_execution_change = self.get_bls_to_execution_change(validator_index)
        message = {
            'validator_index':
                str(signed_bls_to_execution_change.message.validator_index),  # type: ignore[attr-defined]
            'from_bls_pubkey': '0x'
                + signed_bls_to_execution_change.message.from_bls_pubkey.hex(),  # type: ignore[attr-defined]
            'to_execution_address': '0x'
                + signed_bls_to_execution_change.message.to_execution_address.hex(),  # type: ignore[attr-defined]
        }
        result_dict.update({'message': message})
        result_dict.update({'signature': '0x'
                            + signed_bls_to_execution_change.signature.hex()})  # type: ignore[attr-defined]

        # metadata
        metadata: Dict[str, Any] = {
            'network_name': self.chain_setting.NETWORK_NAME,
            'genesis_validators_root': '0x' + self.chain_setting.GENESIS_VALIDATORS_ROOT.hex(),
            'deposit_cli_version': DEPOSIT_CLI_VERSION,
        }

        result_dict.update({'metadata': metadata})
        return result_dict

    def save_exit_transaction(self, validator_index: int, epoch: int, folder: str, timestamp: float) -> str:
        signing_key = self.signing_sk

        signed_voluntary_exit = exit_transaction_generation(
            chain_setting=self.chain_setting,
            signing_key=signing_key,
            validator_index=validator_index,
            epoch=epoch
        )

        return export_exit_transaction_json(folder=folder, signed_exit=signed_voluntary_exit, timestamp=timestamp)


def _credential_builder(kwargs: Dict[str, Any]) -> Credential:
    return Credential(**kwargs)


def _keystore_exporter(kwargs: Dict[str, Any]) -> str:
    credential: Credential = kwargs.pop('credential')
    return credential.save_signing_keystore(**kwargs)


def _deposit_data_builder(credential: Credential) -> Dict[str, bytes]:
    return credential.deposit_datum_dict


def _keystore_verifier(kwargs: Dict[str, Any]) -> bool:
    credential: Credential = kwargs.pop('credential')
    return credential.verify_keystore(**kwargs)


def _bls_to_execution_change_builder(kwargs: Dict[str, Any]) -> Dict[str, bytes]:
    credential: Credential = kwargs.pop('credential')
    return credential.get_bls_to_execution_change_dict(**kwargs)


class CredentialList:
    """
    A collection of multiple Credentials, one for each validator.
    """
    def __init__(self, credentials: list[Credential]):
        self.credentials = credentials

    @classmethod
    def from_mnemonic(cls,
                      *,
                      mnemonic: str,
                      mnemonic_password: str,
                      num_keys: int,
                      amounts: list[int],
                      chain_setting: BaseChainSetting,
                      start_index: int,
                      hex_withdrawal_address: Optional[HexAddress],
                      compounding: Optional[bool] = False,
                      use_pbkdf2: Optional[bool] = False) -> 'CredentialList':
        if len(amounts) != num_keys:
            raise ValueError(
                f"The number of keys ({num_keys}) doesn't equal to the corresponding deposit amounts ({len(amounts)})."
            )
        key_indices = range(start_index, start_index + num_keys)

        credentials: list[Credential] = []
        with click.progressbar(length=num_keys, label=load_text(['msg_key_creation']),  # type: ignore[var-annotated]
                               show_percent=False, show_pos=True) as bar:
            executor_kwargs = [{
                'mnemonic': mnemonic,
                'mnemonic_password': mnemonic_password,
                'index': index,
                'amount': amounts[index - start_index],
                'chain_setting': chain_setting,
                'hex_withdrawal_address': hex_withdrawal_address,
                'compounding': compounding,
                'use_pbkdf2': use_pbkdf2,
            } for index in key_indices]

            with concurrent.futures.ProcessPoolExecutor() as executor:
                for credential in executor.map(_credential_builder, executor_kwargs):
                    credentials.append(credential)
                    bar.update(1)
        return cls(credentials)

    def export_keystores(self, password: str, folder: str, timestamp: float) -> list[str]:
        filefolders: list[str] = []
        with click.progressbar(length=len(self.credentials),  # type: ignore[var-annotated]
                               label=load_text(['msg_keystore_creation']),
                               show_percent=False, show_pos=True) as bar:
            executor_kwargs = [{
                'credential': credential,
                'password': password,
                'folder': folder,
                'timestamp': timestamp,
            } for credential in self.credentials]

            with concurrent.futures.ProcessPoolExecutor() as executor:
                for filefolder in executor.map(_keystore_exporter, executor_kwargs):
                    filefolders.append(filefolder)
                    bar.update(1)
        return filefolders

    def export_deposit_data_json(self, folder: str, timestamp: float) -> str:
        deposit_data = []
        with click.progressbar(length=len(self.credentials),  # type: ignore[var-annotated]
                               label=load_text(['msg_depositdata_creation']),
                               show_percent=False, show_pos=True) as bar:

            with concurrent.futures.ProcessPoolExecutor() as executor:
                for datum_dict in executor.map(_deposit_data_builder, self.credentials):
                    deposit_data.append(datum_dict)
                    bar.update(1)

        return export_deposit_data_json_util(folder, timestamp, deposit_data)

    def verify_keystores(self, keystore_filefolders: list[str], password: str) -> bool:
        all_valid_keystores = True
        with click.progressbar(length=len(self.credentials),  # type: ignore[var-annotated]
                               label=load_text(['msg_keystore_verification']),
                               show_percent=False, show_pos=True) as bar:
            executor_kwargs = [{
                'credential': credential,
                'keystore_filefolder': fileholder,
                'password': password,
            } for credential, fileholder in zip(self.credentials, keystore_filefolders)]

            with concurrent.futures.ProcessPoolExecutor() as executor:
                for valid_keystore in executor.map(_keystore_verifier, executor_kwargs):
                    all_valid_keystores &= valid_keystore
                    bar.update(1)

        return all_valid_keystores

    def export_bls_to_execution_change_json(self, folder: str, validator_indices: Sequence[int]) -> str:
        bls_to_execution_changes = []
        with click.progressbar(length=len(self.credentials),  # type: ignore[var-annotated]
                               label=load_text(['msg_bls_to_execution_change_creation']),
                               show_percent=False, show_pos=True) as bar:

            executor_kwargs = [{
                'credential': credential,
                'validator_index': validator_indices[i],
            } for i, credential in enumerate(self.credentials)]

            with concurrent.futures.ProcessPoolExecutor() as executor:
                for bls_to_execution_change in executor.map(_bls_to_execution_change_builder, executor_kwargs):
                    bls_to_execution_changes.append(bls_to_execution_change)
                    bar.update(1)

        filefolder = os.path.join(folder, 'bls_to_execution_change-%i.json' % time.time())
        with open(filefolder, 'w', encoding='utf-8', opener=sensitive_opener) as f:
            json.dump(bls_to_execution_changes, f)
        return filefolder
