import { BrowserRouter } from 'react-router-dom';
import React from 'react';

export const withProviders = (storyFn: any) => {
  return <BrowserRouter>{storyFn()}</BrowserRouter>;
};