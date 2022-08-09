#!/usr/bin/env bash

# Bash script to bundle the eth2deposit_proxy application and the associated required files on
# Linux and macOS.

if [ -f ~/.bash_aliases ]; then
    shopt -s expand_aliases
    source ~/.bash_aliases
fi

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

EDCDIR=staking-deposit-cli-2.3.0

TARGETPACKAGESPATH=$SCRIPTPATH/../../dist/packages
ETH2DEPOSITCLIPATH=$SCRIPTPATH/../vendors/$EDCDIR
ETH2REQUIREMENTSPATH=$ETH2DEPOSITCLIPATH/requirements.txt

PYTHONPATH=$TARGETPACKAGESPATH:$ETH2DEPOSITCLIPATH:$(python3 -c "import sys;print(':'.join(sys.path))")
DISTBINPATH=$SCRIPTPATH/../../build/bin
DISTWORDSPATH=$SCRIPTPATH/../../build/word_lists
SRCWORDSPATH=$SCRIPTPATH/../vendors/$EDCDIR/staking_deposit/key_handling/key_derivation/word_lists
SRCINTLPATH=$SCRIPTPATH/../vendors/$EDCDIR/staking_deposit/intl

mkdir -p $DISTBINPATH
mkdir -p $DISTWORDSPATH
mkdir -p $TARGETPACKAGESPATH

# Getting all the requirements
python3 -m pip install -r $ETH2REQUIREMENTSPATH --target $TARGETPACKAGESPATH

# Bundling Python eth2deposit_proxy
PYTHONPATH=$PYTHONPATH pyinstaller \
    --onefile \
    --distpath $DISTBINPATH \
    --add-data "$SRCINTLPATH:staking_deposit/intl" \
    -p $PYTHONPATH \
    $SCRIPTPATH/eth2deposit_proxy.py

# Adding word list
cp $SRCWORDSPATH/* $DISTWORDSPATH
