import inspect
import difflib
from functools import reduce
import json
from typing import (
    Any,
    Dict,
    Iterable,
    Mapping,
    Sequence,
)
import os

from ethstaker_deposit.utils import config
from ethstaker_deposit.utils.constants import (
    INTL_CONTENT_PATH,
)
from ethstaker_deposit.utils.file_handling import (
    resource_path,
)
from ethstaker_deposit.exceptions import ValidationError


def _get_from_dict(dataDict: Dict[str, Any], mapList: Iterable[str]) -> str:
    '''
    Iterate nested dictionaries
    '''
    try:
        ans = reduce(dict.get, mapList, dataDict)
        if not isinstance(ans, str):
            raise ValidationError('Incomplete')
        return ans
    except TypeError:
        raise KeyError('%s not in internationalisation json file.' % mapList)
    except ValidationError:
        raise KeyError('The provided params (%s) were incomplete.' % mapList)


def load_text(params: list[str], file_path: str = '', func: str = '', lang: str = '') -> str:
    '''
    Determine and return the appropriate internationalisation text for a given set of `params`.
    '''
    if file_path == '':
        # Auto-detect file-path based on call stack
        file_path = inspect.stack()[1].filename
        if file_path[-4:] == '.pyc':
            file_path = file_path[:-4] + '.json'  # replace .pyc with .json
        elif file_path[-3:] == '.py':
            file_path = file_path[:-3] + '.json'  # replace .py with .json
        else:
            raise KeyError("Wrong file_path %s", file_path)

    if func == '':
        # Auto-detect function based on call stack
        func = inspect.stack()[1].function

    if lang == '':
        lang = config.language

    # Determine path to json text
    file_path_list = os.path.normpath(file_path).split(os.path.sep)

    # Find the relative path to the internationalization file from the project directory
    last_occurrence = len(file_path_list) - file_path_list[::-1].index('ethstaker_deposit')
    rel_path_list = file_path_list[last_occurrence:]

    json_path = resource_path(os.path.join(INTL_CONTENT_PATH, lang, *rel_path_list))

    try:
        # browse json until text is found
        with open(json_path, encoding='utf-8') as f:
            text_dict = json.load(f)
            return _get_from_dict(text_dict, [func] + params)
    except (KeyError, FileNotFoundError):
        # If text not found in lang, try return English version
        if lang == 'en':
            raise KeyError('%s not in %s file' % ([func] + params, json_path))
        return load_text(params, file_path, func, 'en')


def get_first_options(options: Mapping[str, Sequence[str]]) -> list[str]:
    '''
    Returns the first `option` in the values of the `options` dict.
    '''
    return list(map(lambda x: x[0], options.values()))


def closest_match(text: str, options: Iterable[str]) -> str:
    '''
    Finds the closest match to `text` in the `options_list`
    '''
    match = difflib.get_close_matches(text, options, n=1, cutoff=0.6)
    if len(match) == 0:
        raise ValidationError('%s is not a valid language option' % text)
    return match[0]


def fuzzy_reverse_dict_lookup(text: str, options: Mapping[str, Sequence[str]]) -> str:
    '''
    Returns the closest match to `text` out of the `options`
    :param text: The test string that needs to be found
    :param options: A dict with keys (the value that will be returned)
                    and values a list of the options to be matched against
    '''
    reverse_lookup_dict = {value: key for key, values in options.items() for value in values}
    match = closest_match(text, reverse_lookup_dict.keys())
    return reverse_lookup_dict[match]
