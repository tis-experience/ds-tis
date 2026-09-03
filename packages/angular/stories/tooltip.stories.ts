import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisTooltip,
  TisTooltipTrigger,
  type TisTooltipPlacement,
} from "../tooltip/src/public-api";

interface TooltipArgs {
  content: string;
  placement: TisTooltipPlacement;
  showArrow: boolean;
}

const meta: Meta<TooltipArgs> = {
  id: "angular-tooltip",
  title: "Componentes/Tooltip",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisTooltip, TisTooltipTrigger] })],
  args: {
    content: "Editar documento",
    placement: "top",
    showArrow: true,
  },
  argTypes: {
    placement: { control: "radio", options: ["top", "right", "bottom", "left"] },
    showArrow: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: "Tooltip Angular nativo com CDK Overlay, hover/focus, delays, Escape, flip e aria-describedby.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-tooltip-stage">
        <tis-tooltip
          [content]="content"
          [placement]="placement"
          [showArrow]="showArrow"
        >
          <button
            tisTooltipTrigger
            class="ds-button ds-button--outline ds-button--sm"
            type="button"
          >Editar</button>
        </tis-tooltip>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Playground: Story = {};
export const Abaixo: Story = { args: { placement: "bottom" } };
export const SemSeta: Story = { args: { showArrow: false } };
