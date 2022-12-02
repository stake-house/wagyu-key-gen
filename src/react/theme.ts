import { createTheme } from "@material-ui/core";
import { amber, blue } from "@material-ui/core/colors";
import { Pink, Primary } from "./colors";



const theme = createTheme({
  palette: {
    type: "light",
    primary: Primary,
    secondary: blue,
    background: {
      paper: Pink,
      default: Pink
    }
  },
  typography: {
    h1: {
      fontSize: "36px"
    }
  }
});


export default theme;