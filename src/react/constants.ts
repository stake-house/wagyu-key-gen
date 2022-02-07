import { StepKey } from './types';

export const errors = {
	MNEMONIC_FORMAT: "Invalid format. Your Secret Recovery Phrase should be a 24 word list.",
	MNEMONICS_DONT_MATCH: "The Secret Recovery Phrase you entered does not match what was given to you. Please try again.",
	NUMBER_OF_KEYS: "Please input a number between 1 and 1000.",
	ADDRESS_FORMAT_ERROR: "Please enter a valid Ethereum address.",
	PASSWORD_STRENGTH: "Password must be at least 8 characters.",
	PASSWORD_MATCH: "Passwords don't match.",
	STARTING_INDEX: "Please input starting index.",
	FOLDER: "Please select a folder.",
	FOLDER_DOES_NOT_EXISTS: "Folder does not exist. Select an existing folder.",
	FOLDER_IS_NOT_WRITABLE: "Cannot write in this folder. Select a folder in which you have write permission.",
};

export const MNEMONIC_LENGTH = 24;

export const tooltips = {
	IMPORT_MNEMONIC: "If you've already created a Secret Recovery Phrase, you can create more keys from it by importing it here.",
	NUMBER_OF_KEYS: "Enter how many new validator keys you'd like to create.",
	PASSWORD: "Pick a strong password (at least 8 characters) that will be used to protect your keys.",
	STARTING_INDEX: "Each key is created sequentially, so we need to know how many you've created with this Secret Recovery Phrase in the past in order to create some new ones for you.",
	ETH1_WITHDRAW_ADDRESS: "An optional Ethereum address for the withdrawal credentials.",
};

export const stepLabels = {
	[StepKey.MnemonicImport]: 'Import Secret Recovery Phrase',
	[StepKey.MnemonicGeneration]: 'Create Secret Recovery Phrase',
	[StepKey.KeyConfiguration]: 'Configure Validator Keys',
	[StepKey.KeyGeneration]: 'Create Validator Key Files',
	[StepKey.Finish]: 'Finish'
};
