import React, { ComponentProps } from 'react';

import Home from './Home';
import { Story } from '@storybook/react';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'App/Home',
  component: Home,
};

export const HomePage: Story = () => {
  return <Home />
}