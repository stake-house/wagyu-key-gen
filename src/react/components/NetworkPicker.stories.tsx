import React, { ComponentProps } from 'react';

import { NetworkPicker as NetworkPickerComponent } from './NetworkPicker';
import { Story } from '@storybook/react';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'App/NetworkPicker',
  component: NetworkPickerComponent,
};

// export const NetworkPicker: Story = () => {
//   return <NetworkPickerComponent />
// }