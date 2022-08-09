@ECHO OFF

rem Batch script to bundle the eth2deposit_proxy application and the associated required files on
rem Windows.

SET BATDIR=%~dp0

SET EDCDIR=staking-deposit-cli-2.3.0

SET TARGETPACKAGESPATH=%BATDIR%..\..\dist\packages

SET ETH2DEPOSITCLIPATH=%BATDIR%..\vendors\%EDCDIR%
SET ETH2REQUIREMENTSPATH=%ETH2DEPOSITCLIPATH%\requirements.txt

SET PYTHONPATH=
FOR /F "tokens=* USEBACKQ delims=;" %%F IN (`python -c "import sys;print(';'.join(sys.path))"`) DO (SET PYTHONPATH=%TARGETPACKAGESPATH%;%ETH2DEPOSITCLIPATH%;;%%F)

SET DISTBINPATH=%BATDIR%..\..\build\bin
SET DISTWORDSPATH=%BATDIR%..\..\build\word_lists
SET SRCWORDSPATH=%BATDIR%..\vendors\%EDCDIR%\staking_deposit\key_handling\key_derivation\word_lists
SET SRCINTLPATH=%BATDIR%..\vendors\%EDCDIR%\staking_deposit\intl

mkdir %DISTBINPATH% > nul 2> nul
mkdir %DISTWORDSPATH% > nul 2> nul
mkdir %TARGETPACKAGESPATH% > nul 2> nul

rem Getting all the requirements
python -m pip install -r %ETH2REQUIREMENTSPATH% --target %TARGETPACKAGESPATH%

rem Bundling Python eth2deposit_proxy
pyinstaller --onefile --distpath %DISTBINPATH% --add-data "%SRCINTLPATH%;staking_deposit\intl" -p %PYTHONPATH% %BATDIR%eth2deposit_proxy.py

rem Adding word list
copy /Y %SRCWORDSPATH%\* %DISTWORDSPATH%
