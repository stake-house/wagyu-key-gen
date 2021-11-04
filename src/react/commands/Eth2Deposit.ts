import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, existsSync } from 'fs';
import { Network } from '../types'
import { cwd } from 'process';
import { doesFileExist } from "./BashUtils";

import path from "path";
import process from "process";

const execProm = promisify(exec);

const ETH2_DEPOSIT_DIR_NAME = "eth2.0-deposit-cli-1.2.0";

const ETH2_DEPOSIT_CLI_PATH = path.join("src", "vendors", ETH2_DEPOSIT_DIR_NAME);
const SCRIPTS_PATH = path.join("src", "scripts");

const REQUIREMENTS_PATH = path.join(ETH2_DEPOSIT_CLI_PATH, "requirements.txt");
const WORD_LIST_PATH = path.join(ETH2_DEPOSIT_CLI_PATH, "eth2deposit", "key_handling", "key_derivation", "word_lists");

const REQUIREMENT_PACKAGES_PATH = path.join("dist", "packages");

const ETH2DEPOSIT_PROXY_PATH = path.join(SCRIPTS_PATH, "eth2deposit_proxy.py");

// Path used when testing locally unbundled, calling python SFE
const SFE_PATH = path.join("build", "bin", "eth2deposit_proxy" + (process.platform == "win32" ? ".exe" : ""));
const DIST_WORD_LIST_PATH = path.join(cwd(), "build", "word_lists");

// Path used when run as an executable clickable bundle, calling python SFE
const BUNDLED_SFE_PATH = path.join(process.resourcesPath, "..", "build", "bin",
  "eth2deposit_proxy" + (process.platform == "win32" ? ".exe" : ""));
const BUNDLED_DIST_WORD_LIST_PATH = path.join(process.resourcesPath, "..", "build", "word_lists");

const CREATE_MNEMONIC_SUBCOMMAND = "create_mnemonic";
const GENERATE_KEYS_SUBCOMMAND = "generate_keys";
const VALIDATE_MNEMONIC_SUBCOMMAND = "validate_mnemonic";

const PYTHON_EXE = (process.platform == "win32" ? "python" : "python3");
const PATH_DELIM = (process.platform == "win32" ? ";" : ":");

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
    if(!requireDepositPackages()) {
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