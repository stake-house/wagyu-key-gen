import { executeCommandSync } from "./ExecuteCommand";
import { execSync } from 'child_process';
import { mkdir, existsSync, access, constants } from 'fs';
import { Network } from '../types'
import { cwd } from 'process';
import { doesFileExist } from "./BashUtils";

const ETH2_DEPOSIT_CLI_PATH = "src/vendors/eth2.0-deposit-cli-1.2.0";
const SCRIPTS_PATH = "src/scripts";

const REQUIREMENTS_PATH = ETH2_DEPOSIT_CLI_PATH + "/requirements.txt";
const WORD_LIST_PATH = ETH2_DEPOSIT_CLI_PATH + "/eth2deposit/key_handling/key_derivation/word_lists";

const REQUIREMENT_PACKAGES_PATH = "dist/packages";

const ETH2DEPOSIT_PROXY_PATH =  SCRIPTS_PATH + "/eth2deposit_proxy.py";

// Path used when testing locally unbundled, calling python SFE
const SFE_PATH = "build/bin/eth2deposit_proxy";
const DIST_WORD_LIST_PATH = cwd() + "/build/word_lists";

// Path used when run as an executable clickable bundle, calling python SFE
const BUNDLED_SFE_PATH = process.resourcesPath + "/../build/bin/eth2deposit_proxy";
const BUNDLED_DIST_WORD_LIST_PATH = process.resourcesPath + "/../build/word_lists";

const CREATE_MNEMONIC_SUBCOMMAND = "create_mnemonic";
const GENERATE_KEYS_SUBCOMMAND = "generate_keys";

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

const createMnemonic = (language: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      let cmd = "";
      let env = process.env;
    
      const escapedLanguage = escapeArgument(language);
    
      if (doesFileExist(BUNDLED_SFE_PATH)) {
        cmd = BUNDLED_SFE_PATH + " " + CREATE_MNEMONIC_SUBCOMMAND + " " + BUNDLED_DIST_WORD_LIST_PATH + " --language " + escapedLanguage;
        console.log('Calling bundled SFE for create mnemonic with cmd: ' + cmd);
      } else if (doesFileExist(SFE_PATH)) {
          cmd = SFE_PATH + " " + CREATE_MNEMONIC_SUBCOMMAND + " " + DIST_WORD_LIST_PATH + " --language " + escapedLanguage;
          console.log('Calling unbundled SFE for create mnemonic with cmd: ' + cmd);
      } else {
        if (!requireDepositPackages()) {
          reject("Failed to generate mnemonic, don't have the required packages.");
        }
      
        const pythonpath = executeCommandSync("python3 -c \"import sys;print(':'.join(sys.path))\"");
      
        const expythonpath = REQUIREMENT_PACKAGES_PATH + ":" + ETH2_DEPOSIT_CLI_PATH + ":" + pythonpath;
      
        env.PYTHONPATH = expythonpath;
      
        cmd = "python3 " + ETH2DEPOSIT_PROXY_PATH + " " + CREATE_MNEMONIC_SUBCOMMAND + " " + WORD_LIST_PATH + " --language " + escapedLanguage;
      }
    
      try {
        const mnemonicResult = execSync(cmd, {env: env});
        const mnemonicResultString = mnemonicResult.toString();
  
        const result = JSON.parse(mnemonicResultString);
        resolve(result.mnemonic);
      } 
      catch (error) {
        // TODO: more robust error handling
        error.status;
        error.message;
        error.stderr;
        error.stdout;
        console.log(error.message);
        
        reject(error.message);
      }
    }, 1000)
  });
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

  let cmd = "";
  let env = process.env;

  let withdrawalAddress: string = "";
  if (eth1_withdrawal_address != "") {
    withdrawalAddress = `--eth1_withdrawal_address ${eth1_withdrawal_address}`;
  }
  
  const escapedPassword = escapeArgument(password);
  const escapedMnemonic = escapeArgument(mnemonic);
  
  if (doesFileExist(BUNDLED_SFE_PATH)) {
    cmd = `${BUNDLED_SFE_PATH} ${GENERATE_KEYS_SUBCOMMAND} ${withdrawalAddress}${escapedMnemonic} ${index} ${count} ${folder} ${network.toLowerCase()} ${escapedPassword}`;
    console.log('Calling bundled SFE for generate keys');
  } else if (doesFileExist(SFE_PATH)) {
    cmd = `${SFE_PATH} ${GENERATE_KEYS_SUBCOMMAND} ${withdrawalAddress}${escapedMnemonic} ${index} ${count} ${folder} ${network.toLowerCase()} ${escapedPassword}`;
    console.log('Calling SFE for generate keys');
  } else {
    if(!requireDepositPackages()) {
      return false;
    }
  
    const pythonpath = executeCommandSync("python3 -c \"import sys;print(':'.join(sys.path))\"");

    const expythonpath = REQUIREMENT_PACKAGES_PATH + ":" + ETH2_DEPOSIT_CLI_PATH + ":" + pythonpath;
    
    env.PYTHONPATH = expythonpath;

    cmd = `python3 ${ETH2DEPOSIT_PROXY_PATH} ${GENERATE_KEYS_SUBCOMMAND} ${withdrawalAddress}${escapedMnemonic} ${index} ${count} ${folder} ${network.toLowerCase()} ${escapedPassword}`;
  }
  
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