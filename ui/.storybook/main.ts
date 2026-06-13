import type { StorybookConfig } from '@storybook/svelte-vite';
import type { InlineConfig, Plugin } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.svelte'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-svelte-csf'],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
  viteFinal(config: InlineConfig) {
    return {
      ...config,
      plugins: (config.plugins ?? []).map((plugin) => {
        if (plugin && 'name' in plugin && plugin.name === 'storybook:svelte-docgen-plugin') {
          const p = plugin as Plugin & { transform?: (code: string, id: string) => unknown };
          return {
            ...p,
            transform(code: string, id: string) {
              if (id.includes('.stories.svelte')) return null;
              return p.transform?.call(this, code, id);
            },
          };
        }
        return plugin;
      }),
    };
  },
};
export default config;
