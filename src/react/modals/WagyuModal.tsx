import { Modal, ModalProps } from "@mui/material";
import React from "react";

interface WagyuModalParams {
  children: React.ReactNode;
}

/**
 * Wrapper for modal usages to keep consistent styling.
 */
const WagyuModal = ({ children, className, onClose, open}: WagyuModalParams & ModalProps) => (
  <Modal onClose={onClose} open={open}>
    <div className={`tw-flex tw-flex-col tw-bg-backgroundLight tw-rounded-3xl tw-text-center tw-m-auto tw-mt-[150px] ${className || ""}`}>
      {children}
    </div>
  </Modal>
);

export default WagyuModal;
