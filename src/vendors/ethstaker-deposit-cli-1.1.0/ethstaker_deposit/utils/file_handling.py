import os
import sys
from typing import Any, Union


def resource_path(relative_path: str) -> str:
    """
    Get the absolute path to a resource in a manner friendly to PyInstaller.
    PyInstaller creates a temp folder and stores path in _MEIPASS which this function swaps
    into a resource path so it is available both when building binaries and running natively.
    """
    try:
        base_path = sys._MEIPASS  # type: ignore
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)


def sensitive_opener(path: Union[str, bytes, 'os.PathLike[Any]'], flags: int) -> int:
    """
    Opener to be used with the open built-in function to correctly assign permissions to sensitive
    files when created and written to for the first time.
    """
    if os.name == 'posix':
        return os.open(path, flags | os.O_EXCL, 0o400)
    else:
        return os.open(path, flags)
