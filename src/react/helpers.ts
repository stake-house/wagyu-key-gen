/**
 * Helper function to clean the mnemonic of invalid characters and extraneous spacing
 * @param mnemonic the mnemonic to clean
 * @returns the cleaned mnemonic
 */
export const cleanMnemonic = (mnemonic: String): string => {
  const punctuationRemoved = mnemonic.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
  const singleSpace = punctuationRemoved.replace(/\s\s+/g, " ");
  const trimedMnemonic = singleSpace.trim();

  return trimedMnemonic;
};
