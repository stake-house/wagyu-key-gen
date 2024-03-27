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
  typography: {
    h1: {
      fontSize: "2.25rem"
    }
  }
});


export default theme;
