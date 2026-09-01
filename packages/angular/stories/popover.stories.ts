import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisButton } from "../button/src/public-api";
import {
  TisPopover,
  TisPopoverActions,
  TisPopoverContent,
  type TisPopoverPlacement,
} from "../popover/src/public-api";

interface PopoverArgs {
  title: string;
  triggerLabel: string;
  placement: TisPopoverPlacement;
  showArrow: boolean;
}

const meta: Meta<PopoverArgs> = {
  id: "angular-popover",
  title: "Componentes/Popover",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisPopover, TisPopoverActions, TisPopoverContent, TisButton] })],
  args: {
    title: "Detalhes da ação",
    triggerLabel: "Abrir popover",
    placement: "bottom",
    showArrow: true,
  },
  argTypes: {
    placement: { control: "radio", options: ["bottom", "top", "left", "right"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Popover não modal com CDK Overlay/Portal, dismiss, flip, foco inicial e retorno de foco.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-popover-stage" style="box-sizing: border-box; min-block-size: 100vh; display: grid; place-items: start center; padding-block-start: var(--ds-space-xl);">
        <tis-popover
          #popover
          [title]="title"
          [triggerLabel]="triggerLabel"
          [placement]="placement"
          [showArrow]="showArrow"
        >
          <div tisPopoverContent>
            <p>Conteúdo breve associado ao trigger.</p>
          </div>
          <div tisPopoverActions>
            <tis-button size="sm" variant="toned" (click)="popover.close('api')">Cancelar</tis-button>
            <tis-button size="sm" variant="brand" (click)="popover.close('api')">Confirmar</tis-button>
          </div>
        </tis-popover>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<PopoverArgs>;

export const Playground: Story = {};
export const ContentSlot: Story = {
  args: {
    title: "Renomear item",
    triggerLabel: "Renomear",
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-popover-stage" style="box-sizing: border-box; min-block-size: 100vh; display: grid; place-items: start center; padding-block-start: var(--ds-space-xl);">
        <tis-popover
          #popover
          [title]="title"
          [triggerLabel]="triggerLabel"
          [placement]="placement"
          [showArrow]="showArrow"
        >
          <div tisPopoverContent>
            <p>Informe um nome curto e descritivo.</p>
            <div class="ds-field">
              <label class="ds-field__label" for="angular-popover-name">Nome</label>
              <div class="ds-input ds-input--md">
                <input class="ds-input__field" id="angular-popover-name" type="text" value="Relatório mensal">
              </div>
            </div>
          </div>
          <div tisPopoverActions>
            <tis-button size="sm" variant="toned" (click)="popover.close('api')">Cancelar</tis-button>
            <tis-button size="sm" variant="brand" (click)="popover.close('api')">Salvar</tis-button>
          </div>
        </tis-popover>
      </div>
    `,
  }),
};
export const SemSeta: Story = { args: { showArrow: false } };
