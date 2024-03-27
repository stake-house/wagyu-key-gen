import { Dispatch, SetStateAction, createContext, useState } from "react";

interface BTECContextType {
  btecCredentials: string;
  setBTECCredentials: Dispatch<SetStateAction<string>>;
  btecIndices: string;
  setBTECIndices: Dispatch<SetStateAction<string>>;
  folderLocation: string;
  setFolderLocation: Dispatch<SetStateAction<string>>;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  mnemonic: string;
  setMnemonic: Dispatch<SetStateAction<string>>;
  withdrawalAddress: string;
  setWithdrawalAddress: Dispatch<SetStateAction<string>>;
}

export const BTECContext = createContext<BTECContextType>({
  btecCredentials: "",
  setBTECCredentials: () => {},
  btecIndices: "",
  setBTECIndices: () => {},
  folderLocation: "",
  setFolderLocation: () => {},
  index: 0,
  setIndex: () => {},
  mnemonic: "",
  setMnemonic: () => {},
  withdrawalAddress: "",
  setWithdrawalAddress: () => {},
});

/**
 * Context for making the withdrawal credentials change
 */
const BTECContextWrapper = ({ children }: { children: React.ReactNode}) => {
  const [btecIndices, setBTECIndices] = useState<string>("");
  const [btecCredentials, setBTECCredentials] = useState<string>("");
  const [folderLocation, setFolderLocation] = useState<string>("");
  const [index, setIndex] = useState<number>(0);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>("");

  return (
    <BTECContext.Provider value={{
      btecCredentials,
      setBTECCredentials,
      btecIndices,
      setBTECIndices,
      folderLocation,
      setFolderLocation,
      index,
      setIndex,
      mnemonic,
      setMnemonic,
      withdrawalAddress,
      setWithdrawalAddress,
    }}>
      {children}
    </BTECContext.Provider>
  );
};

export default BTECContextWrapper;
