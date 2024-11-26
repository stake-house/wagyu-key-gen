import subprocess
import os
import sys
import shutil
import click


def clear_terminal() -> None:
    # Do not clear if running unit tests as stdout can be used to determine state
    if "PYTEST_CURRENT_TEST" in os.environ:
        return

    # We bundle libtinfo via pyinstaller, which messes with the system tput.
    # Remove LD_LIBRARY_PATH just for subprocess.run()
    if sys.platform == 'linux':
        clean_env = os.environ.copy()
        clean_env.pop('LD_LIBRARY_PATH', None)
    elif sys.platform == 'darwin':
        clean_env = os.environ.copy()

    if sys.platform == 'win32':
        # Special-case for asyncio pytest on Windows
        if os.getenv("IS_ASYNC_TEST") == "1":
            click.clear()
        elif shutil.which('clear'):
            subprocess.run(['clear'])
        else:
            subprocess.run('cls', shell=True)
    elif sys.platform == 'linux' or sys.platform == 'darwin':
        if shutil.which('clear'):
            subprocess.run(['clear'], env=clean_env)
        else:
            click.clear()
        if shutil.which('tput'):
            subprocess.run(['tput', 'reset'], env=clean_env)
        if shutil.which('reset'):
            subprocess.run(['reset'], env=clean_env)
    else:
        click.clear()
