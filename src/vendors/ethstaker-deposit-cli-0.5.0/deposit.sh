#!/bin/bash

if [[ "$OSTYPE" == "linux"* ]] || [[ "$OSTYPE" == "linux-android"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo $OSTYPE
    if [[ $1 == "install" ]]; then
        echo "Installing dependencies..."
        pip3 install -r requirements.txt
        exit 1
    fi
    echo "Running deposit-cli..."
    python3 -m ethstaker_deposit "$@"

elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo $OSTYPE
    if [[ $1 == "install" ]]; then
        echo "Installing dependencies..."
        pip install -r requirements.txt
        exit 1
    fi
    echo "Running deposit-cli..."
    python -m ethstaker_deposit "$@"

else
    echo "Sorry, to run deposit-cli on" $(uname -s)", please see the trouble-shooting on https://github.com/eth-educators/ethstaker-deposit-cli"
    exit 1

fi
