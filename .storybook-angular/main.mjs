/** @type { import('@storybook/angular-vite').StorybookConfig } */
const config = {
  stories: ["../packages/angular/stories/**/*.stories.ts"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/angular-vite",
    options: {
      compodoc: false,
      tsconfig: ".storybook-angular/tsconfig.json",
    },
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
