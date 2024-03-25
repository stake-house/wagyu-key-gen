import { Dispatch, SetStateAction, createContext, useState } from "react";
import { Network } from "./types";

interface GlobalContextType {
  mnemonic: string;
  setMnemonic: Dispatch<SetStateAction<string>>;
  network: Network;
  setNetwork: Dispatch<SetStateAction<Network>>;
}

export const GlobalContext = createContext<GlobalContextType>({
  mnemonic: "",
  setMnemonic: () => {},
  network: Network.MAINNET,
  setNetwork: () => {},
});

const GlobalContextWrapper = ({ children }: { children: React.ReactNode}) => {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [network, setNetwork] = useState<Network>(Network.MAINNET);

  return (
    <GlobalContext.Provider value={{ mnemonic, setMnemonic, network, setNetwork }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextWrapper;
