import { GlobalStyles } from '../../src/globalStyles';
import React from 'react';

export const withGlobalStyles = (storyFn: any) => {
  return (
    <>
      <GlobalStyles />
      {storyFn()}
    </>
  );
};