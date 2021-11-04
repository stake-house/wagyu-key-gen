// Eth2Deposit.ts
/**
 * This Eth2Deposit module exposes the different functions exported by the eth2deposit_proxy
 * application to be used easily with our typescript code.
 *
 * The eth2deposit_proxy application can be called in 3 different ways:
 * 1. From a bundled application, when we do release with electron-builder. This bundled
 *    application will always include a single file application (SFE) version of eth2deposit_proxy.
 * 2. Using a single file application (SFE) bundled with pyinstaller in an environment where the
 *    running application is not bundled.
 * 3. Using the Python 3 version installed on the current machine and the version available
 *    in the current environment.
 * 
 * When we want to call the eth2deposit_proxy application, it will detect which way can be called
 * in order and use the first one available.
 * 
 * @module
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, existsSync } from 'fs';
import { Network } from '../types'
import { cwd } from 'process';
import { doesFileExist } from "./BashUtils";

import path from "path";
import process from "process";

/**
 * A promise version of the exec function from fs to call the eth2deposit_proxy application.
 */
const execProm = promisify(exec);

const ETH2_DEPOSIT_DIR_NAME = "eth2.0-deposit-cli-1.2.0";

/**
 * Paths needed to call the eth2deposit_proxy application using the Python 3 version installed on
 * the current machine.
 */
const ETH2_DEPOSIT_CLI_PATH = path.join("src", "vendors", ETH2_DEPOSIT_DIR_NAME);
const SCRIPTS_PATH = path.join("src", "scripts");
const REQUIREMENTS_PATH = path.join(ETH2_DEPOSIT_CLI_PATH, "requirements.txt");
const WORD_LIST_PATH = path.join(ETH2_DEPOSIT_CLI_PATH, "eth2deposit", "key_handling", "key_derivation", "word_lists");
const REQUIREMENT_PACKAGES_PATH = path.join("dist", "packages");
const ETH2DEPOSIT_PROXY_PATH = path.join(SCRIPTS_PATH, "eth2deposit_proxy.py");

/**
 * Paths needed to call the eth2deposit_proxy application using a single file application (SFE)
 * bundled with pyinstaller.
 */
const SFE_PATH = path.join("build", "bin", "eth2deposit_proxy" + (process.platform == "win32" ? ".exe" : ""));
const DIST_WORD_LIST_PATH = path.join(cwd(), "build", "word_lists");

/**
 * Paths needed to call the eth2deposit_proxy application from a bundled application.
 */
const BUNDLED_SFE_PATH = path.join(process.resourcesPath, "..", "build", "bin",
  "eth2deposit_proxy" + (process.platform == "win32" ? ".exe" : ""));
const BUNDLED_DIST_WORD_LIST_PATH = path.join(process.resourcesPath, "..", "build", "word_lists");

const CREATE_MNEMONIC_SUBCOMMAND = "create_mnemonic";
const GENERATE_KEYS_SUBCOMMAND = "generate_keys";
const VALIDATE_MNEMONIC_SUBCOMMAND = "validate_mnemonic";

const PYTHON_EXE = (process.platform == "win32" ? "python" : "python3");
const PATH_DELIM = (process.platform == "win32" ? ";" : ":");

/**
 * Install the required Python packages needed to call the eth2deposit_proxy application using the
 * Python 3 version installed on the current machine.
 * 
 * @returns Returns a Promise<boolean> that includes a true value if the required Python packages
 *          are present or have been installed correctly.
 */
const requireDepositPackages = async (): Promise<boolean> => {

  if (!existsSync(REQUIREMENT_PACKAGES_PATH)) {
    mkdir(REQUIREMENT_PACKAGES_PATH, { recursive: true }, (err) => {
      if (err) throw err;
    });

    await execProm(PYTHON_EXE + " -m pip install -r " + REQUIREMENTS_PATH + " --target " +
      REQUIREMENT_PACKAGES_PATH);
  }
  return true
}

/**
 * Create a new mnemonic by calling the create_mnemonic function from the eth2deposit_proxy
 * application.
 * 
 * @param language The mnemonic language. Possible values are `chinese_simplified`,
 *                 `chinese_traditional`, `czech`, `english`, `italian`, `korean`, `portuguese` or
 *                 `spanish`.
 * 
 * @returns Returns a Promise<string> that includes the mnemonic.
 */
const createMnemonic = async (language: string): Promise<string> => {

  let cmd = "";
  let env = process.env;

  const escapedLanguage = escapeArgument(language);

  if (doesFileExist(BUNDLED_SFE_PATH)) {
    cmd = BUNDLED_SFE_PATH + " " + CREATE_MNEMONIC_SUBCOMMAND + " " + escapeArgument(BUNDLED_DIST_WORD_LIST_PATH) + " --language " + escapedLanguage;
    console.log('Calling bundled SFE for create mnemonic with cmd: ' + cmd);
  } else if (doesFileExist(SFE_PATH)) {
      cmd = SFE_PATH + " " + CREATE_MNEMONIC_SUBCOMMAND + " " + escapeArgument(DIST_WORD_LIST_PATH) + " --language " + escapedLanguage;
      console.log('Calling unbundled SFE for create mnemonic with cmd: ' + cmd);
  } else {
    if (!await requireDepositPackages()) {
      throw new Error("Failed to generate mnemonic, don't have the required packages.");
    }
  
    const { stdout, stderr } = await execProm(PYTHON_EXE + " -c \"import sys;print('" + PATH_DELIM + "'.join(sys.path))\"");
    const pythonpath = stdout.toString();
  
    const expythonpath = REQUIREMENT_PACKAGES_PATH + PATH_DELIM + ETH2_DEPOSIT_CLI_PATH + PATH_DELIM + pythonpath;
  
    env.PYTHONPATH = expythonpath;
  
    cmd = PYTHON_EXE + " " + ETH2DEPOSIT_PROXY_PATH + " " + CREATE_MNEMONIC_SUBCOMMAND + " " + escapeArgument(WORD_LIST_PATH) + " --language " + escapedLanguage;
  }

  const { stdout, stderr } = await execProm(cmd, {env: env});
  const mnemonicResultString = stdout.toString();

  const result = JSON.parse(mnemonicResultString);
  return result.mnemonic;
  
}

/**
 * Escape an argument to be used with a CLI call. Replace characters that are potentially breaking
 * the call or put quotes around them.
 * 
 * @param argument The argument to escape.
 * 
 * @returns An escaped argument string that can be safely used in a CLI call.
 */
const escapeArgument = (argument: string): string => {
  if (process.platform == "win32") {
    // TODO: Harden and test escaping argument for Windows
    if (/[ "]/.test(argument)) {
      return '"' + argument.replace('"', '"""') + '"';
    }
    return argument;
  } else {
    if (argument === '') return '\'\'';
    if (!/[^%+,-./:=@_0-9A-Za-z]/.test(argument)) return argument;
    return '\'' + argument.replace(/'/g, '\'"\'') + '\'';
  }
}

/**
 * Generate validator keys by calling the generate_keys function from the eth2deposit_proxy
 * application.
 * 
 * @param mnemonic The mnemonic to be used as the seed for generating the keys.
 * @param index The index of the first validator's keys you wish to generate.
 * @param count The number of signing keys you want to generate.
 * @param network The network setting for the signing domain. Possible values are `mainnet`,
 *                `prater` or `pyrmont`.
 * @param password The password that will protect the resulting keystore(s).
 * @param eth1_withdrawal_address If this field is not empty and valid, the given Eth1 address will
 *                                be used to create the withdrawal credentials. Otherwise, it will
 *                                generate withdrawal credentials with the mnemonic-derived
 *                                withdrawal public key in [EIP-2334 format](https://eips.ethereum.org/EIPS/eip-2334#eth2-specific-parameters).
 * @param folder The folder path for the resulting keystore(s) and deposit(s) files.
 * 
 * @returns Returns a Promise<void> that will resolve when the generation is done.
 */
const generateKeys = async (
    mnemonic: string,
    index: number,
    count: number,
    network: Network,
    password: string,
    eth1_withdrawal_address: string,
    folder: string,
  ): Promise<void> => {
  let cmd = "";
  let env = process.env;

  let withdrawalAddress: string = "";
  if (eth1_withdrawal_address != "") {
    withdrawalAddress = `--eth1_withdrawal_address ${eth1_withdrawal_address}`;
  }
  
  const escapedPassword = escapeArgument(password);
  const escapedMnemonic = escapeArgument(mnemonic);
  const escapedFolder = escapeArgument(folder);
  
  if (doesFileExist(BUNDLED_SFE_PATH)) {
    cmd = `${BUNDLED_SFE_PATH} ${GENERATE_KEYS_SUBCOMMAND} ${withdrawalAddress}${escapeArgument(BUNDLED_DIST_WORD_LIST_PATH)} ${escapedMnemonic} ${index} ${count} ${escapedFolder} ${network.toLowerCase()} ${escapedPassword}`;
    console.log('Calling bundled SFE for generate keys');
  } else if (doesFileExist(SFE_PATH)) {
    cmd = `${SFE_PATH} ${GENERATE_KEYS_SUBCOMMAND} ${withdrawalAddress}${escapeArgument(DIST_WORD_LIST_PATH)} ${escapedMnemonic} ${index} ${count} ${escapedFolder} ${network.toLowerCase()} ${escapedPassword}`;
    console.log('Calling SFE for generate keys');
  } else {
    if(!await requireDepositPackages()) {
      throw new Error("Failed to generate mnemonic, don't have the required packages.");
    }
  
    const { stdout, stderr } = await execProm(PYTHON_EXE + " -c \"import sys;print('" + PATH_DELIM + "'.join(sys.path))\"");
    const pythonpath = stdout.toString();

    const expythonpath = REQUIREMENT_PACKAGES_PATH + PATH_DELIM + ETH2_DEPOSIT_CLI_PATH + PATH_DELIM + pythonpath;
    
    env.PYTHONPATH = expythonpath;

    cmd = `${PYTHON_EXE} ${ETH2DEPOSIT_PROXY_PATH} ${GENERATE_KEYS_SUBCOMMAND} ${withdrawalAddress}${escapeArgument(WORD_LIST_PATH)} ${escapedMnemonic} ${index} ${count} ${escapedFolder} ${network.toLowerCase()} ${escapedPassword}`;
  }
  
  await execProm(cmd, {env: env});
}

/**
 * Validate a mnemonic using the eth2-deposit-cli logic by calling the validate_mnemonic function
 * from the eth2deposit_proxy application.
 * 
 * @param mnemonic The mnemonic to be validated.
 * 
 * @returns Returns a Promise<void> that will resolve when the validation is done.
 */
const validateMnemonic = async (
  mnemonic: string,
): Promise<void> => {
  let cmd = "";
  let env = process.env;

  const escapedMnemonic = escapeArgument(mnemonic);

  if (doesFileExist(BUNDLED_SFE_PATH)) {
    cmd = `${BUNDLED_SFE_PATH} ${VALIDATE_MNEMONIC_SUBCOMMAND} ${escapeArgument(BUNDLED_DIST_WORD_LIST_PATH)} ${escapedMnemonic}`;
    console.log('Calling bundled SFE for generate keys');
  } else if (doesFileExist(SFE_PATH)) {
    cmd = `${SFE_PATH} ${VALIDATE_MNEMONIC_SUBCOMMAND} ${escapeArgument(DIST_WORD_LIST_PATH)} ${escapedMnemonic}`;
    console.log('Calling SFE for generate keys');
  } else {
    if(!await requireDepositPackages()) {
      throw new Error("Failed to generate mnemonic, don't have the required packages.");
    }

    const { stdout, stderr } = await execProm(PYTHON_EXE + " -c \"import sys;print('" + PATH_DELIM + "'.join(sys.path))\"");
    const pythonpath = stdout.toString();

    const expythonpath = REQUIREMENT_PACKAGES_PATH + PATH_DELIM + ETH2_DEPOSIT_CLI_PATH + PATH_DELIM + pythonpath;
    
    env.PYTHONPATH = expythonpath;

    cmd = `${PYTHON_EXE} ${ETH2DEPOSIT_PROXY_PATH} ${VALIDATE_MNEMONIC_SUBCOMMAND} ${escapeArgument(WORD_LIST_PATH)} ${escapedMnemonic}`;
  }

  await execProm(cmd, {env: env});
}

export {
  createMnemonic,
  generateKeys,
  validateMnemonic
};