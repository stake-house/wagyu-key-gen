# Local Development Instructions

To install the `ethstaker-deposit-cli`, follow these steps:

## Prerequisites

Ensure you have the following software installed on your system:

- **Git**: Version control system to clone the repository. [Download Git](https://git-scm.com/downloads)
- **Python 3.9+**: The programming language required to run the tool. [Download Python](https://www.python.org/downloads/)
- **pip**: Package installer for Python, which is included with Python 3.9+.

On Windows, you'll need:
- **Git for Windows**: Version control system to clone the repository. Configure it to associate `.sh` files with `bash`. [Download GfW](https://git-scm.com/download/win)
- **Windows Terminal**: Optional but recommended command line console. Configure GfW to install a Git Bash profile. [Download Windows Terminal](https://apps.microsoft.com/detail/9n0dx20hk701)
- **Python 3.9+**: The programming language required to run the tool. [Download Python](https://apps.microsoft.com/detail/9ncvdn91xzqp)
- **Visual Studio C++**: The compiler required to build some of the dependencies of the tool. [Download VS C++](https://visualstudio.microsoft.com/vs/features/cplusplus/)

## Local Development Steps

1. **Clone the Repository**

    ```sh
    git clone https://github.com/eth-educators/ethstaker-deposit-cli.git
    ```

2. **Navigate to the Project Directory**

    ```sh
    cd ethstaker-deposit-cli
    ```

3. **Setup virtualenv (optional)**

    Install `venv` if not already installed, e.g. for Debian/Ubuntu:

    ```sh
    sudo apt update && sudo apt install python3-venv
    ```

    Create a new [virtual environment](https://docs.python.org/3/library/venv.html):

    ```sh
    python3 -m venv .venv
    source .venv/bin/activate
    ```

4. **Install Dependencies**

    ```sh
    pip3 install -r requirements.txt
    ```

5. **Run the CLI**

    You can now run the CLI tool using the following command:

    ```sh
    python3 -m ethstaker_deposit [OPTIONS] COMMAND [ARGS]
    ```

6. **Use pre-commit for PRs**

    Install `pre-commit` if not already installed, e.g. for Debian/Ubuntu:

    ```sh
    sudo apt update && sudo apt install pre-commit
    ```

    Enable it for your `git commit` workflow:
    ```sh
    pre-commit install
    ```

**To execute tests, you will need to install the test dependencies**:
```sh
python3 -m pip install -r requirements.txt -r requirements_test.txt
python3 -m pytest tests
```
