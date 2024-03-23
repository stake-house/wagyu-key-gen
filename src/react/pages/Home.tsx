import { useContext, useMemo, useState } from "react";
import { styled } from "styled-components";
import { GlobalContext } from "../globalContext";
import { Button, Modal } from "@mui/material";
import NetworkPickerModal from "../modals/NetworkPickerModal";

const NetworkContainer = styled.div`
  position: fixed;
  top: 35;
  text-align: right;
  width: 100%;
`;

const Home = () => {
  const { network } = useContext(GlobalContext);
  const [wasNetworkModalOpened, setWasNetworkModalOpened] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const tabIndex = useMemo(() => showNetworkModal ? -1 : 1, [showNetworkModal]);

  const handleOpenNetworkModal = () => {
    setShowNetworkModal(true);
    setWasNetworkModalOpened(true);
  };

  const handleCloseNetworkModal = () => {
    setShowNetworkModal(false);
  };

  return (
    <div>
      <NetworkContainer>
        Select Network:{" "}
        <Button color="primary" onClick={handleOpenNetworkModal} tabIndex={tabIndex}>{network}</Button>
      </NetworkContainer>

      <NetworkPickerModal onClose={handleCloseNetworkModal} showModal={showNetworkModal} />
    </div>
  )
};

export default Home;
