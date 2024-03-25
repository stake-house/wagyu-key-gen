export const cleanMnemonic = (mnemonic: String): string => {
  const punctuationRemoved = mnemonic.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
  const singleSpace = punctuationRemoved.replace(/\s\s+/g, " ");
  const trimedMnemonic = singleSpace.trim();

  return trimedMnemonic;
};
