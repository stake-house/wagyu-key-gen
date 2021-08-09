import { StepKey } from './types';

export const errors = {
	MNEMONIC_FORMAT: "Secret Recovery Phrase is not in the right format, please double check.",
	MNEMONICS_DONT_MATCH: "Secret Recovery Phrase does not match, please try again.",
	NUMBER_OF_KEYS: "Please input number of keys.",
	PASSWORD_STRENGTH: "Password must be at least 8 characters.",
	PASSWORD_MATCH: "Passwords don't match.",
	STARTING_INDEX: "Please input starting index.",
	FOLDER: "Please select a folder.",
};

export const MNEMONIC_LENGTH = 24;

export const tooltips = {
	IMPORT_MNEMONIC: "If you've already generated a Secret Recovery Phrase, you can generate more keys from it by importing it here.",
	NUMBER_OF_KEYS: "Enter how many new validator keys you'd like to generate.",
	PASSWORD: "Pick a strong password (at least 8 characters) that will be used to protect your keys.",
	STARTING_INDEX: "Each key is generated sequentially, so we need to know how many you've generated in the past in order to create some new ones for you.",
};

export const stepLabels = {
	[StepKey.MnemonicImport]: 'Import Secret Recovery Phrase',
	[StepKey.MnemonicGeneration]: 'Create Secret Recovery Phrase',
	[StepKey.KeyConfiguration]: 'Configure Keys',
	[StepKey.KeyGeneration]: 'Create Key Files',
	[StepKey.Finish]: 'Finish'
};
