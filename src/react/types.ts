export enum StepKey {
  MnemonicImport,
  MnemonicGeneration,
  KeyConfiguration,
  KeyGeneration,
  Finish,
  BTECConfiguration,
  BTECGeneration,
  FinishBTEC,
  ExitTransactionConfiguration,
  ExitTransactionGeneration,
  ExitTransactionMnemonicConfiguration,
  ExitTransactionMnemonicGeneration,
  FinishExitTransaction
}

export enum StepSequenceKey {
  MnemonicGeneration = "mnemonicgeneration",
  MnemonicImport = "mnemonicimport",
  BLSToExecutionChangeGeneration = "blstoexecutionchangegeneration",
  PreSignExitTransactionGeneration = "presignexittransactiongeneration",
  PreSignExitTransactionGenerationMnemonic = "presignexittransactiongenerationmnemonic"
}

export enum ReuseMnemonicAction {
  RegenerateKeys,
  GenerateBLSToExecutionChange,
  GenerateExitTransaction,
}

export enum Network {
  MAINNET = "Mainnet",
  GOERLI = "Goerli",
  ZHEJIANG = "Zhejiang"
}

export interface Keystore {
  publicKey: string;
  shortenedPub: string;
  index: string;
  validatorIndex: string;
  fileName: string;
  fullPath: string;
  password: string;
  validPassword: boolean;
}
