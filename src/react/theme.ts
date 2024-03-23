import { createTheme} from "@mui/material";
import { amber, blue } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: amber,
    secondary: blue,
    background: {
      default: "#303030",
    },
  },
});


export default theme;
