import { Button, Tooltip } from "@mui/material";
import { ReuseMnemonicAction } from "../types";
import WagyuModal from "./WagyuModal";

interface ReuseMnemonicActionModalParams {
  onClose: () => void;
  onSubmit: (action: ReuseMnemonicAction) => void;
  showModal: boolean;
}

const ReuseMnemonicActionModal = ({ onClose, onSubmit, showModal}: ReuseMnemonicActionModalParams) => {
  return (
    <WagyuModal
      className="tw-w-[560px] tw-h-[260px]"
      open={showModal}
      onClose={onClose}
    >
      <div className="tw-flex tw-flex-col tw-h-full tw-my-7">
        <div className="tw-text-2xl">How would you like to use your existing secret recovery phrase?</div>

        <div className="tw-grow" />

        <div className="tw-flex tw-flex-col tw-gap-2 tw-align-middle">
          <div>
            <Button variant="contained" color="primary" onClick={() => onSubmit(ReuseMnemonicAction.RegenerateKeys)}>
              Generate existing or new validator keys
            </Button>
          </div>
          <div>
            <Tooltip title="If you initially created your validator keys without adding a withdrawal address, you can generate this BLS to execution change to add one once.">
              <Button variant="contained" color="primary" onClick={() => onSubmit(ReuseMnemonicAction.GenerateBLSToExecutionChange)}>
                Generate your BLS to execution change<br />(Add a withdrawal address)
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </WagyuModal>
  )
};

export default ReuseMnemonicActionModal;
