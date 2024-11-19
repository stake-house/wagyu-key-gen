#!/usr/bin/env bash

# Bash script to bundle the stakingdeposit_proxy application and the associated required files on
# Linux and macOS.

if [ -f ~/.bash_aliases ]; then
    shopt -s expand_aliases
    source ~/.bash_aliases
fi

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

EDCDIR=ethstaker-deposit-cli-0.5.0

TARGETPACKAGESPATH=$SCRIPTPATH/../../dist/packages
ETH2DEPOSITCLIPATH=$SCRIPTPATH/../vendors/$EDCDIR
ETH2REQUIREMENTSPATH=$ETH2DEPOSITCLIPATH/requirements.txt

PYTHONPATH=$TARGETPACKAGESPATH:$ETH2DEPOSITCLIPATH:$(python3 -c "import sys;print(':'.join(sys.path))")
DISTBINPATH=$SCRIPTPATH/../../build/bin
DISTWORDSPATH=$SCRIPTPATH/../../build/word_lists
SRCWORDSPATH=$SCRIPTPATH/../vendors/$EDCDIR/ethstaker_deposit/key_handling/key_derivation/word_lists
SRCINTLPATH=$SCRIPTPATH/../vendors/$EDCDIR/ethstaker_deposit/intl

mkdir -p $DISTBINPATH
mkdir -p $DISTWORDSPATH
mkdir -p $TARGETPACKAGESPATH

# Getting all the requirements
python3 -m pip install -r $ETH2REQUIREMENTSPATH --target $TARGETPACKAGESPATH

# Getting packages metadata
PYECCDATA=$(python3 -c "from PyInstaller.utils.hooks import copy_metadata;print(':'.join(copy_metadata('py_ecc')[0]))")
SSZDATA=$(python3 -c "from PyInstaller.utils.hooks import copy_metadata;print(':'.join(copy_metadata('ssz')[0]))")

# Bundling Python stakingdeposit_proxy
PYTHONPATH=$PYTHONPATH pyinstaller \
    --onefile \
    --distpath $DISTBINPATH \
    --add-data "$SRCINTLPATH:ethstaker_deposit/intl" \
    --add-data "$PYECCDATA" \
    --add-data "$SSZDATA" \
    -p $PYTHONPATH \
    $SCRIPTPATH/stakingdeposit_proxy.py

# Adding word list
cp $SRCWORDSPATH/* $DISTWORDSPATH
