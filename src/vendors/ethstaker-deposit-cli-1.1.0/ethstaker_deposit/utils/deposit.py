import json
import os

from ethstaker_deposit.utils.file_handling import (
    sensitive_opener,
)


def export_deposit_data_json(folder: str, timestamp: float, deposit_data: list[dict[str, bytes]]) -> str:
    file_folder = os.path.join(folder, 'deposit_data-%i.json' % timestamp)
    with open(file_folder, 'w', encoding='utf-8', opener=sensitive_opener) as f:
        json.dump(deposit_data, f, default=lambda x: x.hex())
    return file_folder
