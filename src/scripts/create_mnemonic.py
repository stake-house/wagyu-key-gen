import argparse
import json

from eth2deposit.key_handling.key_derivation.mnemonic import (
    get_mnemonic,
)

def create_mnemonic(word_list, language='english'):
    return get_mnemonic(language=language, words_path=args.wordlist)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("wordlist", help="Path to word list directory", type=str)
    parser.add_argument("--language", help="Language", type=str)
    args = parser.parse_args()

    mnemonic = None
    if args.language:
        mnemonic = create_mnemonic(args.wordlist, language=args.language)
    else:
        mnemonic = create_mnemonic(args.wordlist)

    print(json.dumps({
        'mnemonic': mnemonic
    }))