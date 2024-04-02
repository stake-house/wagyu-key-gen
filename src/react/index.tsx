import * as ReactDOM from "react-dom";
import 'typeface-roboto';

import App from "./App";
import './index.css';

// We find our app DOM element as before
const app = document.getElementById("app");

// Finally, we render our top-level component to the actual DOM.
ReactDOM.render(<App />, app);
