import { componentWrapperDecorator, type Preview } from "@storybook/angular-vite";

import "../css/design-system.css";
import "@angular/cdk/overlay-prebuilt.css";
import "./preview.css";

const preview: Preview = {
  globalTypes: {
    mode: {
      description: "Tema do DS TIS",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    componentWrapperDecorator((story) => `
      <main>
        <h1 class="ds-sr-only">Angular component preview</h1>
        ${story}
      </main>
    `),
    (story, context) => {
      document.documentElement.dataset["mode"] = context.globals["mode"] as string;
      return story();
    },
  ],
  parameters: {
    controls: { expanded: true },
    a11y: {
      test: "error",
    },
    layout: "padded",
    options: {
      storySort: {
        order: ["Introdução", "Componentes", ["Accordion", "Badge", "Button", "Checkbox", "Combobox", "Input Text", "Menu", "Modal", "Popover", "Radio", "Select", "Tabs", "Textarea", "Toast", "Toggle", "Tooltip"]],
      },
    },
  },
};

export default preview;
