import { Typography } from "@mui/material";

declare var VERSION: string;
declare var COMMITHASH: string;

/**
 * Footer to display the version and commit hash
 */
const VersionFooter = () => (
  <div className="tw-fixed tw-bottom-9 tw-w-full">
    <Typography className="tw-text-gray tw-text-center tw-text-xxs">Version: {VERSION} - Commit Hash: {COMMITHASH}</Typography>
  </div>
);

export default VersionFooter;
