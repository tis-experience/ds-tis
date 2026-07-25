/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  docs: {
    defaultName: 'Documentação',
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
