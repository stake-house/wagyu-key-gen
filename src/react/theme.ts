import { createMuiTheme } from "@material-ui/core";
import { amber, blue, red } from "@material-ui/core/colors";



const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: amber,
    secondary: blue,
  },
  typography: {
    h1: {
      fontSize: "36px"
    }
  }
});


export default theme;