export enum StepKey {
  MnemonicImport,
  MnemonicGeneration,
  KeyConfiguration,
  KeyGeneration,
  Finish
}

export enum StepSequenceKey {
  MnemonicGeneration = "mnemonicgeneration",
  MnemonicImport = "mnemonicimport",
  BLSToExecutionChangeGeneration = "blstoexecutionchangegeneration",
}

export enum ReuseMnemonicAction {
  RegenerateKeys,
  GenerateBLSToExecutionChange
}

export enum Network {
  MAINNET = "Mainnet",
  GOERLI = "Goerli",
  ZHEJIANG = "Zhejiang"
}
