from typing import Dict, NamedTuple
from os import environ


DEPOSIT_CLI_VERSION = '2.0.0'


class BaseChainSetting(NamedTuple):
    NETWORK_NAME: str
    GENESIS_FORK_VERSION: bytes


MAINNET = 'mainnet'
GNOSIS = 'gnosis'
PRATER = 'prater'
KINTSUGI = 'kintsugi'
KILN = 'kiln'
GNOSIS_TESTNET = 'gnosis-testnet'
#TEST = 'test'



# Mainnet setting
MainnetSetting = BaseChainSetting(NETWORK_NAME=MAINNET, GENESIS_FORK_VERSION=bytes.fromhex('00000000'))
# Gnosis Mainnet Beacon Chain setting
GnosisSetting = BaseChainSetting(NETWORK_NAME=GNOSIS, GENESIS_FORK_VERSION=bytes.fromhex('00000064'))
# Testnet (spec v1.0.1)
PraterSetting = BaseChainSetting(NETWORK_NAME=PRATER, GENESIS_FORK_VERSION=bytes.fromhex('00001020'))
# Merge Testnet (spec v1.1.4)
KintsugiSetting = BaseChainSetting(NETWORK_NAME=KINTSUGI, GENESIS_FORK_VERSION=bytes.fromhex('60000069'))
# Merge Testnet (spec v1.1.9)
KilnSetting = BaseChainSetting(NETWORK_NAME=KILN, GENESIS_FORK_VERSION=bytes.fromhex('70000069'))
# Gnosis Beacon Chain testnet setting
GnosisTestnetSetting = BaseChainSetting(NETWORK_NAME=GNOSIS_TESTNET, GENESIS_FORK_VERSION=bytes.fromhex('00006464'))
# Gnosis Test
#TestSetting = BaseChainSetting(NETWORK_NAME=TEST, GENESIS_FORK_VERSION=bytes.fromhex(environ.get('GENESIS_FORK_VERSION', '12345678')))


ALL_CHAINS: Dict[str, BaseChainSetting] = {
    MAINNET: MainnetSetting,
    PRATER: PraterSetting,
    KINTSUGI: KintsugiSetting,
    KILN: KilnSetting,
    GNOSIS_TESTNET: GnosisTestnetSetting,
    GNOSIS: GnosisSetting,
    #TEST: TestSetting,
}


def get_chain_setting(chain_name: str = MAINNET) -> BaseChainSetting:
    return ALL_CHAINS[chain_name]
