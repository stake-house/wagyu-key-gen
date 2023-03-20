import { StepKey } from './types';

export const errors = {
	MNEMONIC_FORMAT: "Invalid format. Your Secret Recovery Phrase should be a 24 word list.",
	MNEMONICS_DONT_MATCH: "The Secret Recovery Phrase you entered does not match what was given to you. Please try again.",
	NUMBER_OF_KEYS: "Please input a number between 1 and 1000.",
	ADDRESS_FORMAT_ERROR: "Please enter a valid Ethereum address.",
	WITHDRAW_ADDRESS_REQUIRED: "Please enter an Ethereum address.",
	PASSWORD_STRENGTH: "Password must be at least 8 characters.",
	PASSWORD_MATCH: "Passwords don't match.",
	STARTING_INDEX: "Please input start index.",
	INDICES: "Please input indices.",
	INDICES_FORMAT: "Please input indices with digits only.",
	INDICES_LENGTH: "The amount of indices must match the amount of BLS credentials",
	BLS_CREDENTIALS: "Please input BLS credentials.",
	BLS_CREDENTIALS_FORMAT: "Please enter valid BLS credentials.",
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
	BTEC_WITHDRAW_ADDRESS: "An Ethereum address for withdrawal. There is where your validator balance and rewards will go.",
	OFFLINE: "You want to avoid exposing your Secret Recovery Phrase to any system that can send it online and compromise your security. Booting from a live OS that does not connect to any network on a USB drive is an easy way to achieve that. You can copy the resulting files on USB drives. You might want to avoid storing your Secret Recovery Phrase electronically.",
	BTEC_START_INDEX: "The index position for the keys to start generating withdrawal credentials. If you only created 1 validator key using this Secret Recovery Phrase, this is likely going to be 0. If you created many validator keys, this could be a higher value from where you want to start in the list of validators derived from your Secret Recovery Phrase.",
	BTEC_INDICES: "A list of the chosen validator index number(s) as identified on the beacon chain. You can find your validator indice on beaconcha.in website on your validator page. It will be at the top of that page the form of a title like Validator XXXXX, where XXXXX is going to be your indice.",
	BLS_CREDENTIALS: "A list of the old BLS withdrawal credentials of the given validator(s). You can find your validator BLS withdrawal credentials on beaconcha.in website on your validator page. It will be in the Deposits tab and it should start with 0x00.",
};

export const stepLabels = {
	[StepKey.MnemonicImport]: 'Import Secret Recovery Phrase',
	[StepKey.MnemonicGeneration]: 'Create Secret Recovery Phrase',
	[StepKey.KeyConfiguration]: 'Configure Validator Keys',
	[StepKey.KeyGeneration]: 'Create Validator Key Files',
	[StepKey.Finish]: 'Finish',
	[StepKey.BTECConfiguration]: 'Configure Withdrawal Address',
  [StepKey.BTECGeneration]: 'Create Crendentials Change',
  [StepKey.FinishBTEC]: 'Finish'
};
