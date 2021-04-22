import { executeCommandSync, executeCommandSyncReturnStdout } from "./ExecuteCommand";
import { execSync } from 'child_process';
import { mkdir, existsSync } from 'fs';

const ETH2_DEPOSIT_CLI_PATH = "src/vendors/eth2.0-deposit-cli-1.2.0"

const REQUIREMENTS_PATH = ETH2_DEPOSIT_CLI_PATH + "/requirements.txt"
const WORD_LIST_PATH = ETH2_DEPOSIT_CLI_PATH + "/eth2deposit/key_handling/key_derivation/word_lists"

const REQUIREMENT_PACKAGES_PATH = "dist/packages"

const CREATE_MNEMONIC_PATH = "src/scripts/create_mnemonic.py";

const requireDepositPackages = (): boolean => {

  if (!existsSync(REQUIREMENT_PACKAGES_PATH)) {
    mkdir(REQUIREMENT_PACKAGES_PATH, { recursive: true }, (err) => {
      if (err) throw err;
    });

    return executeCommandSync("python3 -m pip install -r " +
      REQUIREMENTS_PATH + " --target " + REQUIREMENT_PACKAGES_PATH) == 0;
  } else {
      return true;
  }
}

const createMnemonic = (language: string): string => {
  if(!requireDepositPackages()) {
    return '';
  }

  const pythonpath = executeCommandSync("python3 -c \"import sys;print(':'.join(sys.path))\"");

  const expythonpath = REQUIREMENT_PACKAGES_PATH + ":" + ETH2_DEPOSIT_CLI_PATH + ":" + pythonpath;

  const env = process.env;
  env.PYTHONPATH = expythonpath;

  const cmd = "python3 " + CREATE_MNEMONIC_PATH + " " + WORD_LIST_PATH + " --language " + language;

  try {
    const result = JSON.parse(execSync(cmd, {env: env}).toString())
    return result.mnemonic;
  } 
  catch (error) {
    // TODO: more robust error handling
    error.status;
    error.message;
    error.stderr;
    error.stdout;
    console.log(error.message);
    return error.status;
  }


}

export {
  createMnemonic
};