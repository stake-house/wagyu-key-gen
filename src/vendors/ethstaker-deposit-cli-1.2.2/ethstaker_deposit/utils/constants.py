import os
from typing import (
    Dict,
)


ZERO_BYTES32 = b'\x00' * 32

# Execution-spec constants taken from https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/beacon-chain.md
DOMAIN_DEPOSIT = bytes.fromhex('03000000')
DOMAIN_VOLUNTARY_EXIT = bytes.fromhex('04000000')
DOMAIN_BLS_TO_EXECUTION_CHANGE = bytes.fromhex('0A000000')
DOMAIN_BLS_TO_EXECUTION_CHANGE_KEYSTORE = bytes.fromhex('0F000000')
BLS_WITHDRAWAL_PREFIX = bytes.fromhex('00')
EXECUTION_ADDRESS_WITHDRAWAL_PREFIX = bytes.fromhex('01')
COMPOUNDING_WITHDRAWAL_PREFIX = bytes.fromhex('02')

ETH2GWEI = 10 ** 9
DEFAULT_ACTIVATION_AMOUNT = 2 ** 5
MAX_DEPOSIT_AMOUNT = 2 ** 11 * ETH2GWEI

# File/folder constants
WORD_LISTS_PATH = os.path.join('ethstaker_deposit', 'key_handling', 'key_derivation', 'word_lists')
DEFAULT_VALIDATOR_KEYS_FOLDER_NAME = 'validator_keys'
DEFAULT_BLS_TO_EXECUTION_CHANGES_FOLDER_NAME = 'bls_to_execution_changes'
DEFAULT_BLS_TO_EXECUTION_CHANGES_KEYSTORE_FOLDER_NAME = 'bls_to_execution_changes_keystore'
DEFAULT_EXIT_TRANSACTION_FOLDER_NAME = 'exit_transactions'
DEFAULT_PARTIAL_DEPOSIT_FOLDER_NAME = 'partial_deposits'

# Internationalisation constants
INTL_CONTENT_PATH = os.path.join('ethstaker_deposit', 'intl')

CONTEXT_REQUIRING_PROMPTS = [
    "amount",
]


def _add_index_to_options(d: Dict[str, list[str]]) -> Dict[str, list[str]]:
    '''
    Adds the (1 indexed) index (in the dict) to the first element of value list.
    eg. {'en': ['English', 'en']} -> {'en': ['1. English', '1', 'English', 'en']}
    Requires dicts to be ordered (Python > 3.6)
    '''
    keys = list(d.keys())  # Force copy dictionary keys top prevent iteration over changing dict
    for i, key in enumerate(keys):
        d.update({key: ['%s. %s' % (i + 1, d[key][0]), str(i + 1)] + d[key]})
    return d


INTL_LANG_OPTIONS = _add_index_to_options({
    'ar': ['\u202bالعربية\u202c', 'ar', 'Arabic'],
    'el': ['ελληνικά', 'el', 'Greek'],
    'en': ['English', 'en'],
    'fr': ['Français', 'Francais', 'fr', 'French'],
    'id': ['Bahasa melayu', 'Melayu', 'id', 'Malay'],
    'it': ['Italiano', 'it', 'Italian'],
    'ja': ['日本語', 'ja', 'Japanese'],
    'ko': ['한국어', '조선말', '韓國語', 'ko', 'Korean'],
    'pt-BR': ['Português do Brasil', 'Brasil', 'pt-BR', 'Brazilian Portuguese'],
    'ro': ['român', 'limba română', 'ro', 'Romanian'],
    'tr': ['Türkçe', 'tr', 'Turkish'],
    'zh-CN': ['简体中文', 'zh-CN', 'zh', 'Chinese'],
})
MNEMONIC_LANG_OPTIONS = _add_index_to_options({
    'chinese_simplified': ['简体中文', 'zh', 'zh-CN', 'Chinese Simplified'],
    'chinese_traditional': ['繁體中文', 'zh-tw', 'Chinese Traditional'],
    'czech': ['čeština', 'český jazyk', 'cs', 'Czech'],
    'english': ['English', 'en'],
    'french': ['Français', 'Francais', 'fr', 'French'],
    'italian': ['Italiano', 'it', 'Italian'],
    'japanese': ['日本語', 'ja', 'Japanese'],
    'korean': ['한국어', '조선말', '韓國語', 'ko', 'Korean'],
    # Portuguese mnemonics are in both pt & pt-BR
    'portuguese': ['Português', 'Português do Brasil', 'pt', 'pt-BR', 'Portuguese'],
    'spanish': ['Español', 'es', 'Spanish'],
})

# Sundry constants
UNICODE_CONTROL_CHARS = list(range(0x00, 0x20)) + list(range(0x7F, 0xA0))
