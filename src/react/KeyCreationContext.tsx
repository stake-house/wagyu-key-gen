import { Dispatch, SetStateAction, createContext, useState } from "react";

interface KeyCreationContextType {
  folderLocation: string;
  setFolderLocation: Dispatch<SetStateAction<string>>;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  mnemonic: string;
  setMnemonic: Dispatch<SetStateAction<string>>;
  numberOfKeys: number;
  setNumberOfKeys: Dispatch<SetStateAction<number>>;
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  withdrawalAddress: string;
  setWithdrawalAddress: Dispatch<SetStateAction<string>>;
  compounding: boolean;
  setCompounding: Dispatch<SetStateAction<boolean>>;
}

export const KeyCreationContext = createContext<KeyCreationContextType>({
  folderLocation: "",
  setFolderLocation: () => {},
  index: 0,
  setIndex: () => {},
  mnemonic: "",
  setMnemonic: () => {},
  numberOfKeys: 1,
  setNumberOfKeys: () => {},
  amount: 32,
  setAmount: () => {},
  password: "",
  setPassword: () => {},
  withdrawalAddress: "",
  setWithdrawalAddress: () => {},
  compounding: false,
  setCompounding: () => {},
});

/**
 * Context for generating a validator key for both using an existing mnemonic or a new one
 */
const KeyCreationContextWrapper = ({ children }: { children: React.ReactNode}) => {
  const [folderLocation, setFolderLocation] = useState<string>("");
  const [index, setIndex] = useState<number>(0);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [numberOfKeys, setNumberOfKeys] = useState<number>(1);
  const [amount, setAmount] = useState<number>(32);
  const [password, setPassword] = useState<string>("");
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>("");
  const [compounding, setCompounding] = useState<boolean>(false);

  return (
    <KeyCreationContext.Provider value={{
      folderLocation,
      setFolderLocation,
      index,
      setIndex,
      mnemonic,
      setMnemonic,
      numberOfKeys,
      setNumberOfKeys,
      amount,
      setAmount,
      password,
      setPassword,
      withdrawalAddress,
      setWithdrawalAddress,
      compounding,
      setCompounding,
    }}>
      {children}
    </KeyCreationContext.Provider>
  );
};

export default KeyCreationContextWrapper;
