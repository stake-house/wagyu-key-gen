from typing import Dict, NamedTuple, Optional
from eth_utils import decode_hex

from ethstaker_deposit import __version__

DEPOSIT_CLI_VERSION = __version__

# We are faking the deposit_cli_version to pass the current Launchpad version test
# See https://github.com/eth-educators/ethstaker-deposit-cli/issues/216
version_elements = DEPOSIT_CLI_VERSION.split('.')
version_elements[0] = str(int(version_elements[0]) + 10)
fake_cli_version = '.'.join(version_elements)


class BaseChainSetting(NamedTuple):
    NETWORK_NAME: str
    GENESIS_FORK_VERSION: bytes
    EXIT_FORK_VERSION: bytes  # capella fork version for voluntary exits (EIP-7044)
    GENESIS_VALIDATORS_ROOT: Optional[bytes] = None

    def __str__(self) -> str:
        gvr_value = self.GENESIS_VALIDATORS_ROOT.hex() if self.GENESIS_VALIDATORS_ROOT is not None else 'None'
        return (f'Network {self.NETWORK_NAME}\n'
                f'  - Genesis fork version: {self.GENESIS_FORK_VERSION.hex()}\n'
                f'  - Exit fork version: {self.EXIT_FORK_VERSION.hex()}\n'
                f'  - Genesis validators root: {gvr_value}')


MAINNET = 'mainnet'
SEPOLIA = 'sepolia'
HOLESKY = 'holesky'
MEKONG = 'mekong'
EPHEMERY = 'ephemery'

# Mainnet setting
MainnetSetting = BaseChainSetting(
    NETWORK_NAME=MAINNET,
    GENESIS_FORK_VERSION=bytes.fromhex('00000000'),
    EXIT_FORK_VERSION=bytes.fromhex('03000000'),
    GENESIS_VALIDATORS_ROOT=bytes.fromhex('4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95'))
# Sepolia setting
SepoliaSetting = BaseChainSetting(
    NETWORK_NAME=SEPOLIA,
    GENESIS_FORK_VERSION=bytes.fromhex('90000069'),
    EXIT_FORK_VERSION=bytes.fromhex('90000072'),
    GENESIS_VALIDATORS_ROOT=bytes.fromhex('d8ea171f3c94aea21ebc42a1ed61052acf3f9209c00e4efbaaddac09ed9b8078'))
# Holesky setting
HoleskySetting = BaseChainSetting(
    NETWORK_NAME=HOLESKY,
    GENESIS_FORK_VERSION=bytes.fromhex('01017000'),
    EXIT_FORK_VERSION=bytes.fromhex('04017000'),
    GENESIS_VALIDATORS_ROOT=bytes.fromhex('9143aa7c615a7f7115e2b6aac319c03529df8242ae705fba9df39b79c59fa8b1'))
# Mekong setting
MekongSetting = BaseChainSetting(
    NETWORK_NAME=MEKONG,
    GENESIS_FORK_VERSION=bytes.fromhex('10637624'),
    EXIT_FORK_VERSION=bytes.fromhex('40637624'),
    GENESIS_VALIDATORS_ROOT=bytes.fromhex('9838240bca889c52818d7502179b393a828f61f15119d9027827c36caeb67db7'))
# Ephemery setting
# From https://github.com/ephemery-testnet/ephemery-genesis/blob/master/values.env
EphemerySetting = BaseChainSetting(
    NETWORK_NAME=EPHEMERY,
    EXIT_FORK_VERSION=bytes.fromhex('4000101b'),
    GENESIS_FORK_VERSION=bytes.fromhex('1000101b'),
    # There is no builtin GENESIS_VALIDATORS_ROOT since the root changes with each reset.
    # You can manually obtain the GENESIS_VALIDATORS_ROOT with each reset on
    # https://github.com/ephemery-testnet/ephemery-genesis/releases
    GENESIS_VALIDATORS_ROOT=None)


ALL_CHAINS: Dict[str, BaseChainSetting] = {
    MAINNET: MainnetSetting,
    SEPOLIA: SepoliaSetting,
    HOLESKY: HoleskySetting,
    MEKONG: MekongSetting,
    EPHEMERY: EphemerySetting,
}

ALL_CHAIN_KEYS: tuple[str, ...] = tuple(ALL_CHAINS.keys())


def get_chain_setting(chain_name: str = MAINNET) -> BaseChainSetting:
    return ALL_CHAINS[chain_name]


def get_devnet_chain_setting(network_name: str,
                             genesis_fork_version: str,
                             exit_fork_version: str,
                             genesis_validator_root: Optional[str]) -> BaseChainSetting:
    return BaseChainSetting(
        NETWORK_NAME=network_name,
        GENESIS_FORK_VERSION=decode_hex(genesis_fork_version),
        EXIT_FORK_VERSION=decode_hex(exit_fork_version),
        GENESIS_VALIDATORS_ROOT=decode_hex(genesis_validator_root) if genesis_validator_root is not None else None,
    )
