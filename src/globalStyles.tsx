import { Background, White } from './react/colors';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html {
    overflow: hidden;
    height: 100%;
  }

  body {
    margin: 0;
    font-family: 'Roboto', sans-serif;
    color: ${White};
    height: 100%;
    overflow: auto;
    font-weight: 300;
    font-size: 16px;
    background: ${Background};
  }

  a {
    text-decoration: none;
  }
`;