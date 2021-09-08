#!/usr/bin/env bash

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

PYTHONPATH=$SCRIPTPATH/../../dist/packages:$SCRIPTPATH/../vendors/eth2.0-deposit-cli-1.2.0:$(python3 -c "import sys;print(':'.join(sys.path))")
DISTBIN=$SCRIPTPATH/../../dist/bin

mkdir -p $DISTBIN

PYTHONPATH=$PYTHONPATH pyinstaller --onefile --distpath $DISTBIN -p $PYTHONPATH $SCRIPTPATH/eth2deposit_proxy.py