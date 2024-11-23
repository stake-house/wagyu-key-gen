import os
from ethstaker_deposit.exceptions import MultiLanguageError
import pytest
import json
from typing import (
    Sequence,
)

from ethstaker_deposit.utils.constants import (
    MNEMONIC_LANG_OPTIONS,
)
from ethstaker_deposit.key_handling.key_derivation.mnemonic import (
    _index_to_word,
    _get_word_list,
    abbreviate_words,
    determine_mnemonic_language,
    get_seed,
    get_mnemonic,
    reconstruct_mnemonic,
)


WORD_LISTS_PATH = os.path.join(os.getcwd(), 'ethstaker_deposit', 'key_handling', 'key_derivation', 'word_lists')
all_languages = MNEMONIC_LANG_OPTIONS.keys()

test_vector_filefolder = os.path.join('tests', 'test_key_handling',
                                      'test_key_derivation', 'test_vectors', 'mnemonic.json')
with open(test_vector_filefolder, 'r', encoding='utf-8') as f:
    test_vectors = json.load(f)
multi_lang_mnemonic_filefolder = os.path.join('tests', 'test_key_handling',
                                              'test_key_derivation', 'test_vectors', 'multi_lang_mnemonic.json')
with open(multi_lang_mnemonic_filefolder, 'r', encoding='utf-8') as f:
    multi_lang_mnemonics = json.load(f)


@pytest.mark.parametrize(
    'language,test',
    [(language, test) for language, language_test_vectors in test_vectors.items() for test in language_test_vectors]
)
def test_bip39(language: str, test: Sequence[str]) -> None:
    test_entropy = bytes.fromhex(test[0])
    test_mnemonic = test[1]
    test_seed = bytes.fromhex(test[2])

    assert get_mnemonic(language=language, words_path=WORD_LISTS_PATH, entropy=test_entropy) == test_mnemonic
    assert get_seed(mnemonic=test_mnemonic, password='TREZOR') == test_seed


@pytest.mark.parametrize(
    'test_mnemonic',
    [(test_mnemonic[1])
     for _, language_test_vectors in test_vectors.items()
     for test_mnemonic in language_test_vectors]
)
def test_reconstruct_mnemonic(test_mnemonic: str) -> None:
    assert reconstruct_mnemonic(test_mnemonic, WORD_LISTS_PATH) is not None


@pytest.mark.parametrize(
    'test_mnemonic',
    [multi_lang_test_vectors for multi_lang_test_vectors in multi_lang_mnemonics]
)
def test_multi_lang_mnemonics(test_mnemonic: str) -> None:
    with pytest.raises(MultiLanguageError):
        reconstruct_mnemonic(test_mnemonic, WORD_LISTS_PATH)


def abbreviate_mnemonic(mnemonic: str) -> str:
    words = str.split(mnemonic)
    words = abbreviate_words(words)
    assert all([len(word) <= 4 for word in words])
    return str.join(' ', words)


@pytest.mark.parametrize(
    'test_mnemonic',
    [abbreviate_mnemonic(test_mnemonic[1])
     for _, language_test_vectors in test_vectors.items()
     for test_mnemonic in language_test_vectors]
)
def test_reconstruct_abbreviated_mnemonic(test_mnemonic: str) -> None:
    assert reconstruct_mnemonic(test_mnemonic, WORD_LISTS_PATH) is not None


@pytest.mark.parametrize(
    'language', ['english']
)
@pytest.mark.parametrize(
    'index, valid',
    [
        (0, True),
        (2047, True),
        (2048, False),
    ]
)
def test_get_word(language: str, index: int, valid: bool) -> None:
    word_list = _get_word_list(language, WORD_LISTS_PATH)
    if valid:
        _index_to_word(word_list=word_list, index=index)
    else:
        with pytest.raises(IndexError):
            _index_to_word(word_list=word_list, index=index)


@pytest.mark.parametrize(
    'mnemonic,output',
    [
        ('塞 香 廳 閉 勞 秦 可 貫 智 閣 慣 藝', ['chinese_simplified', 'chinese_traditional']),
        ('zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo when', ['english']),
    ]
)
def test_determine_mnemonic_language(mnemonic, output) -> None:
    languages = determine_mnemonic_language(mnemonic, WORD_LISTS_PATH)
    assert set(languages) == set(output)


def test_determine_mnemonic_language_error() -> None:
    try:
        determine_mnemonic_language('these are not words', WORD_LISTS_PATH)
    except ValueError as e:
        assert e
