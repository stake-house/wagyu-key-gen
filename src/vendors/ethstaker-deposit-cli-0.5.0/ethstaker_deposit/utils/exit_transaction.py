import json
import os
from typing import Any, Dict
from py_ecc.bls import G2ProofOfPossession as bls

from ethstaker_deposit.settings import BaseChainSetting
from ethstaker_deposit.utils.ssz import (
    SignedVoluntaryExit,
    VoluntaryExit,
    compute_signing_root,
    compute_voluntary_exit_domain,
)
from ethstaker_deposit.utils.file_handling import (
    sensitive_opener,
)


def exit_transaction_generation(
        chain_setting: BaseChainSetting,
        signing_key: int,
        validator_index: int,
        epoch: int) -> SignedVoluntaryExit:
    message = VoluntaryExit(  # type: ignore[no-untyped-call]
        epoch=epoch,
        validator_index=validator_index
    )

    domain = compute_voluntary_exit_domain(
        fork_version=chain_setting.EXIT_FORK_VERSION,
        genesis_validators_root=chain_setting.GENESIS_VALIDATORS_ROOT
    )

    signing_root = compute_signing_root(message, domain)
    signature = bls.Sign(signing_key, signing_root)

    signed_exit = SignedVoluntaryExit(  # type: ignore[no-untyped-call]
        message=message,
        signature=signature,
    )

    return signed_exit


def export_exit_transaction_json(folder: str, signed_exit: SignedVoluntaryExit, timestamp: float) -> str:
    signed_exit_json: Dict[str, Any] = {}
    message = {
        'epoch': str(signed_exit.message.epoch),  # type: ignore[attr-defined]
        'validator_index': str(signed_exit.message.validator_index),  # type: ignore[attr-defined]
    }
    signed_exit_json.update({'message': message})
    signed_exit_json.update({'signature': '0x' + signed_exit.signature.hex()})  # type: ignore[attr-defined]

    filefolder = os.path.join(
        folder,
        'signed_exit_transaction-%s-%i.json' % (
            signed_exit.message.validator_index,  # type: ignore[attr-defined]
            timestamp,
        )
    )

    with open(filefolder, 'w', encoding='utf-8', opener=sensitive_opener) as f:
        json.dump(signed_exit_json, f)
    return filefolder
