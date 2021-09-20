@ECHO OFF

SET BATDIR=%~dp0

SET TARGETPACKAGESPATH=%BATDIR%..\..\dist\packages

SET ETH2DEPOSITCLIPATH=%BATDIR%..\vendors\eth2.0-deposit-cli-1.2.0
SET ETH2REQUIREMENTSPATH=%ETH2DEPOSITCLIPATH%\requirements.txt

SET PYTHONPATH=
FOR /F "tokens=* USEBACKQ delims=;" %%F IN (`python -c "import sys;print(';'.join(sys.path))"`) DO (SET PYTHONPATH=%TARGETPACKAGESPATH%;%ETH2DEPOSITCLIPATH%;;%%F)

SET DISTBINPATH=%BATDIR%..\..\build\bin
SET DISTWORDSPATH=%BATDIR%..\..\build\word_lists
SET SRCWORDSPATH=%BATDIR%..\vendors\eth2.0-deposit-cli-1.2.0\eth2deposit\key_handling\key_derivation\word_lists

mkdir %DISTBINPATH% > nul 2> nul
mkdir %DISTWORDSPATH% > nul 2> nul
mkdir %TARGETPACKAGESPATH% > nul 2> nul

rem Getting all the requirements
python -m pip install -r %ETH2REQUIREMENTSPATH% --target %TARGETPACKAGESPATH%

rem # Bundling Python eth2deposit_proxy
pyinstaller --onefile --distpath %DISTBINPATH% -p %PYTHONPATH% %BATDIR%eth2deposit_proxy.py

rem # Adding word list
copy /Y %SRCWORDSPATH%\* %DISTWORDSPATH%
