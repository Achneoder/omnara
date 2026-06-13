import type { Preview } from '@storybook/svelte';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FAF8F3' },
        { name: 'dark', value: '#0F0E0B' },
      ],
    },
  },
};
export default preview;
