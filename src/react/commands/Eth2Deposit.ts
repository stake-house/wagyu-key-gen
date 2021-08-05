import { executeCommandSync } from "./ExecuteCommand";
import { execSync } from 'child_process';
import { mkdir, existsSync } from 'fs';
import { Network } from '../types'

const ETH2_DEPOSIT_CLI_PATH = "src/vendors/eth2.0-deposit-cli-1.2.0";
const SCRIPTS_PATH = "src/scripts";

const REQUIREMENTS_PATH = ETH2_DEPOSIT_CLI_PATH + "/requirements.txt";
const WORD_LIST_PATH = ETH2_DEPOSIT_CLI_PATH + "/eth2deposit/key_handling/key_derivation/word_lists";

const REQUIREMENT_PACKAGES_PATH = "dist/packages";

const CREATE_MNEMONIC_PATH = SCRIPTS_PATH + "/create_mnemonic.py";
const GENERATE_KEYS_PATH =  SCRIPTS_PATH + "/generate_keys.py";

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

const escapeArgument = (argument: string): string => {
  if (argument === '') return '\'\'';
  if (!/[^%+,-./:=@_0-9A-Za-z]/.test(argument)) return argument;
  return '\'' + argument.replace(/'/g, '\'"\'') + '\'';
}

const generateKeys = (
    mnemonic: string,
    index: number,
    count: number,
    network: Network,
    password: string,
    eth1_withdrawal_address: string,
    folder: string,
  ): boolean => {
  if(!requireDepositPackages()) {
    return false;
  }

  const pythonpath = executeCommandSync("python3 -c \"import sys;print(':'.join(sys.path))\"");

  const expythonpath = REQUIREMENT_PACKAGES_PATH + ":" + ETH2_DEPOSIT_CLI_PATH + ":" + pythonpath;
  
  const env = process.env;
  env.PYTHONPATH = expythonpath;

  var withdrawalAddress: string = "";
  if (eth1_withdrawal_address != "") {
    withdrawalAddress = `--eth1_withdrawal_address ${eth1_withdrawal_address}`;
  }
  
  const escapedPassword = escapeArgument(password);
  const escapedMnemonic = escapeArgument(mnemonic);

  const cmd = `python3 ${GENERATE_KEYS_PATH} ${withdrawalAddress}${escapedMnemonic} ${index} ${count} ${folder} ${network.toLowerCase()} ${escapedPassword}`;
  
  try {
    execSync(cmd, {env: env});
    return true;
  } 
  catch (error) {
    // TODO: more robust error handling
    error.status;
    error.message;
    error.stderr;
    error.stdout;
    console.log(error.message);
    return false;
  }
}

export {
  createMnemonic,
  generateKeys
};