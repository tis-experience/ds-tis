import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisButton,
  TisButtonIconStart,
  type TisButtonSize,
  type TisButtonVariant,
} from "../button/src/public-api";

interface ButtonArgs {
  label: string;
  variant: TisButtonVariant;
  size: TisButtonSize;
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
  showIcon: boolean;
}

const meta: Meta<ButtonArgs> = {
  id: "angular-button",
  title: "Componentes/Button",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisButton, TisButtonIconStart] })],
  args: {
    label: "Guardar alterações",
    variant: "brand",
    size: "md",
    disabled: false,
    loading: false,
    fullWidth: false,
    showIcon: true,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["brand", "toned", "outline", "ghost", "success", "danger"],
    },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Button Angular standalone com `<button>` nativo, classes públicas do DS e content projection.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tis-button
        [variant]="variant"
        [size]="size"
        [disabled]="disabled"
        [loading]="loading"
        [fullWidth]="fullWidth"
      >
        @if (showIcon) {
          <svg tisButtonIconStart viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
        }
        {{ label }}
      </tis-button>
    `,
  }),
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="sb-angular-row">
        <tis-button variant="brand">Default</tis-button>
        <tis-button variant="outline" [disabled]="true">Disabled</tis-button>
        <tis-button variant="brand" [loading]="true">A guardar</tis-button>
      </div>
    `,
  }),
};
