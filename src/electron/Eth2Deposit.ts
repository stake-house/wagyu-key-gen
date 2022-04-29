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

import { execFile } from 'child_process';
import { promisify } from 'util';
import { constants } from 'fs';
import { access, mkdir } from 'fs/promises';
import { cwd } from 'process';

import path from "path";
import process from "process";

import { doesFileExist } from './BashUtils';

/**
 * A promise version of the execFile function from fs for CLI calls.
 */
const execFileProm = promisify(execFile);

const ETH2_DEPOSIT_DIR_NAME = "staking-deposit-cli-2.1.0";

/**
 * Paths needed to call the eth2deposit_proxy application using the Python 3 version installed on
 * the current machine.
 */
const ETH2_DEPOSIT_CLI_PATH = path.join("src", "vendors", ETH2_DEPOSIT_DIR_NAME);
const SCRIPTS_PATH = path.join("src", "scripts");
const REQUIREMENTS_PATH = path.join(ETH2_DEPOSIT_CLI_PATH, "requirements.txt");
const WORD_LIST_PATH = path.join(ETH2_DEPOSIT_CLI_PATH, "staking_deposit", "key_handling",
  "key_derivation", "word_lists");
const REQUIREMENT_PACKAGES_PATH = path.join("dist", "packages");
const ETH2DEPOSIT_PROXY_PATH = path.join(SCRIPTS_PATH, "eth2deposit_proxy.py");

/**
 * Paths needed to call the eth2deposit_proxy application using a single file application (SFE)
 * bundled with pyinstaller.
 */
const SFE_PATH = path.join("build", "bin", "eth2deposit_proxy" +
  (process.platform == "win32" ? ".exe" : ""));
const DIST_WORD_LIST_PATH = path.join(cwd(), "build", "word_lists");

/**
 * Paths needed to call the eth2deposit_proxy application from a bundled application.
 */
const BUNDLED_SFE_PATH = path.join(process.resourcesPath, "..", "build",
  "bin", "eth2deposit_proxy" + (process.platform == "win32" ? ".exe" : ""));
const BUNDLED_DIST_WORD_LIST_PATH = path.join(process.resourcesPath, "..",
  "build", "word_lists");

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

  try {
    await access(REQUIREMENT_PACKAGES_PATH, constants.F_OK);
  } catch {
    await mkdir(REQUIREMENT_PACKAGES_PATH, { recursive: true });

    const executable = PYTHON_EXE;
    const args = ["-m", "pip", "install", "-r", REQUIREMENTS_PATH, "--target",
      "REQUIREMENT_PACKAGES_PATH"];

    await execFileProm(executable, args);
  }

  return true
}

/**
 * Obtains the Python paths from the current available python executable in the environment.
 * 
 * @returns Returns a Promise<string> that includes the Python paths seperated by the system path
 *          delimiter.
 */
const getPythonPath = async (): Promise<string> => {
  const executable = PYTHON_EXE;
  const args = ["-c", `import sys;print('${PATH_DELIM}'.join(sys.path))`];

  const { stdout, stderr } = await execFileProm(executable, args);
  const pythonpath = stdout.toString();

  return `${REQUIREMENT_PACKAGES_PATH}${PATH_DELIM}${ETH2_DEPOSIT_CLI_PATH}${PATH_DELIM}${pythonpath}`;
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

  let executable:string = "";
  let args:string[] = [];
  let env = process.env;

  if (await doesFileExist(BUNDLED_SFE_PATH)) {
    executable = BUNDLED_SFE_PATH;
    args = [CREATE_MNEMONIC_SUBCOMMAND, BUNDLED_DIST_WORD_LIST_PATH, "--language", language];
  } else if (await doesFileExist(SFE_PATH)) {
    executable = SFE_PATH;
    args = [CREATE_MNEMONIC_SUBCOMMAND, DIST_WORD_LIST_PATH, "--language", language]
  } else {
    if (!await requireDepositPackages()) {
      throw new Error("Failed to generate mnemonic, don't have the required packages.");
    }
    env.PYTHONPATH = await getPythonPath();
  
    executable = PYTHON_EXE;
    args = [ETH2DEPOSIT_PROXY_PATH, CREATE_MNEMONIC_SUBCOMMAND, WORD_LIST_PATH, "--language",
      language];
  }

  const { stdout, stderr } = await execFileProm(executable, args, {env: env});
  const mnemonicResultString = stdout.toString();

  const result = JSON.parse(mnemonicResultString);
  return result.mnemonic;
}

/**
 * Generate validator keys by calling the generate_keys function from the eth2deposit_proxy
 * application.
 * 
 * @param mnemonic The mnemonic to be used as the seed for generating the keys.
 * @param index The index of the first validator's keys you wish to generate.
 * @param count The number of signing keys you want to generate.
 * @param network The network setting for the signing domain. Possible values are `mainnet`,
 *                `prater`, `kintsugi`, `kiln`.
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
    network: string,
    password: string,
    eth1_withdrawal_address: string,
    folder: string,
  ): Promise<void> => {
  
  let executable:string = "";
  let args:string[] = [];
  let env = process.env;
  
  if (await doesFileExist(BUNDLED_SFE_PATH)) {
    executable = BUNDLED_SFE_PATH;
    args = [GENERATE_KEYS_SUBCOMMAND];
    if ( eth1_withdrawal_address != "" ) {
      args = args.concat(["--eth1_withdrawal_address", eth1_withdrawal_address]);
    }
    
    args = args.concat([BUNDLED_DIST_WORD_LIST_PATH, mnemonic, index.toString(), count.toString(),
      folder, network.toLowerCase(), password]);
  } else if (await doesFileExist(SFE_PATH)) {
    executable = SFE_PATH;
    args = [GENERATE_KEYS_SUBCOMMAND];
    if ( eth1_withdrawal_address != "" ) {
      args = args.concat(["--eth1_withdrawal_address", eth1_withdrawal_address]);
    }
    
    args = args.concat([DIST_WORD_LIST_PATH, mnemonic, index.toString(), count.toString(), folder,
      network.toLowerCase(), password]);
  } else {
    if(!await requireDepositPackages()) {
      throw new Error("Failed to generate mnemonic, don't have the required packages.");
    }
    env.PYTHONPATH = await getPythonPath();

    executable = PYTHON_EXE;
    args = [ETH2DEPOSIT_PROXY_PATH, GENERATE_KEYS_SUBCOMMAND];
    if ( eth1_withdrawal_address != "" ) {
      args = args.concat(["--eth1_withdrawal_address", eth1_withdrawal_address]);
    }

    args = args.concat([WORD_LIST_PATH, mnemonic, index.toString(), count.toString(), folder,
      network.toLowerCase(), password]);
  }
  
  await execFileProm(executable, args, {env: env});
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

  let executable:string = "";
  let args:string[] = [];
  let env = process.env;

  if (await doesFileExist(BUNDLED_SFE_PATH)) {
    executable = BUNDLED_SFE_PATH;
    args = [VALIDATE_MNEMONIC_SUBCOMMAND, BUNDLED_DIST_WORD_LIST_PATH, mnemonic];
  } else if (await doesFileExist(SFE_PATH)) {
    executable = SFE_PATH;
    args = [VALIDATE_MNEMONIC_SUBCOMMAND, DIST_WORD_LIST_PATH, mnemonic];
  } else {
    if(!await requireDepositPackages()) {
      throw new Error("Failed to generate mnemonic, don't have the required packages.");
    }
    env.PYTHONPATH = await getPythonPath();

    executable = PYTHON_EXE;
    args = [ETH2DEPOSIT_PROXY_PATH, VALIDATE_MNEMONIC_SUBCOMMAND, WORD_LIST_PATH, mnemonic];
  }

  await execFileProm(executable, args, {env: env});
}

export {
  createMnemonic,
  generateKeys,
  validateMnemonic
};