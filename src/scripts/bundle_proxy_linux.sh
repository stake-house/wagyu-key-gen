#!/usr/bin/env bash

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

TARGETPACKAGESPATH=$SCRIPTPATH/../../dist/packages
ETH2DEPOSITCLIPATH=$SCRIPTPATH/../vendors/eth2.0-deposit-cli-1.2.0
ETH2REQUIREMENTSPATH=$ETH2DEPOSITCLIPATH/requirements.txt

PYTHONPATH=$TARGETPACKAGESPATH:$ETH2DEPOSITCLIPATH:$(python3 -c "import sys;print(':'.join(sys.path))")
DISTBINPATH=$SCRIPTPATH/../../dist/bin
DISTWORDSPATH=$SCRIPTPATH/../../dist/word_lists
SRCWORDSPATH=$SCRIPTPATH/../vendors/eth2.0-deposit-cli-1.2.0/eth2deposit/key_handling/key_derivation/word_lists

mkdir -p $DISTBINPATH
mkdir -p $DISTWORDSPATH
mkdir -p $TARGETPACKAGESPATH

# Getting all the requirements
python3 -m pip install -r $ETH2REQUIREMENTSPATH --target $TARGETPACKAGESPATH

# Bundling Python eth2deposit_proxy
PYTHONPATH=$PYTHONPATH pyinstaller --onefile --distpath $DISTBINPATH -p $PYTHONPATH $SCRIPTPATH/eth2deposit_proxy.py

# Adding word list
cp $SRCWORDSPATH/* $DISTWORDSPATH
