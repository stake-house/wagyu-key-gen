import { Dispatch, SetStateAction, createContext, useState } from "react";

interface BTECContextType {
  mnemonic: string;
  setMnemonic: Dispatch<SetStateAction<string>>;
}

export const BTECContext = createContext<BTECContextType>({
  mnemonic: "",
  setMnemonic: () => {},
});

const BTECContextWrapper = ({ children }: { children: React.ReactNode}) => {
  const [mnemonic, setMnemonic] = useState<string>("");

  return (
    <BTECContext.Provider value={{ mnemonic, setMnemonic }}>
      {children}
    </BTECContext.Provider>
  );
};

export default BTECContextWrapper;
