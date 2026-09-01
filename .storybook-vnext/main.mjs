/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  framework: '@storybook/react-vite',
  stories: ['../packages/react/src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  docs: {
    defaultName: 'Documentação',
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
