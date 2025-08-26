export enum StepKey {
  MnemonicImport,
  MnemonicGeneration,
  KeyConfiguration,
  KeyGeneration,
  Finish,
  BTECConfiguration,
  BTECGeneration,
  FinishBTEC
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
  HOODI = "Hoodi",
  GNOSIS = "Gnosis",
  CHIADO = "Chiado",
  HOLESKY = "Holesky",
}

export interface NetworkConfig {
  multiplier: number;
}

export const NetworkConfig: Record<Network, NetworkConfig> = {
  [Network.MAINNET]: {
    multiplier: 1,
  },
  [Network.HOLESKY]: {
    multiplier: 1,
  },
  [Network.HOODI]: {
    multiplier: 1,
  },
  [Network.GNOSIS]: {
    multiplier: 32,
  },
  [Network.CHIADO]: {
    multiplier: 32,
  },
};