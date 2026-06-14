import type { StorybookConfig } from '@storybook/svelte-vite';
import { readFileSync } from 'node:fs';
import { compile } from 'svelte/compiler';

const svelteEsbuildPlugin = {
  name: 'svelte-for-esbuild',
  setup(build: {
    onLoad: (
      filter: object,
      cb: (args: { path: string }) => Promise<{ contents: string; loader: string }>,
    ) => void;
  }) {
    build.onLoad({ filter: /\.svelte$/ }, async (args) => {
      const source = readFileSync(args.path, 'utf8');
      const { js } = compile(source, { filename: args.path, generate: 'client' });
      return { contents: js.code, loader: 'js' };
    });
  },
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.svelte'],
  addons: ['@storybook/addon-docs', '@storybook/addon-svelte-csf'],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
  async viteFinal(config) {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          plugins: [...(config.optimizeDeps?.esbuildOptions?.plugins ?? []), svelteEsbuildPlugin],
        },
      },
    };
  },
};
export default config;
