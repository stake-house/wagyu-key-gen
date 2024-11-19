import pytest

from ethstaker_deposit.credentials import CredentialList
from ethstaker_deposit.settings import MainnetSetting


def test_from_mnemonic() -> None:
    with pytest.raises(ValueError):
        CredentialList.from_mnemonic(
            mnemonic="",
            mnemonic_password="",
            num_keys=1,
            amounts=[32, 32],
            chain_setting=MainnetSetting,
            start_index=1,
            hex_withdrawal_address=None,
            compounding=False,
        )
