import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisAccordion,
  TisAccordionChevron,
  TisAccordionItem,
  TisAccordionPanel,
  TisAccordionTitle,
  TisAccordionTrigger,
} from "../accordion/src/public-api";

interface AccordionArgs {
  multiple: boolean;
  disabled: boolean;
}

const meta: Meta<AccordionArgs> = {
  id: "angular-accordion",
  title: "Componentes/Accordion",
  tags: ["autodocs"],
  decorators: [moduleMetadata({
    imports: [
      TisAccordion,
      TisAccordionChevron,
      TisAccordionItem,
      TisAccordionPanel,
      TisAccordionTitle,
      TisAccordionTrigger,
    ],
  })],
  args: { multiple: false, disabled: true },
  parameters: {
    docs: {
      description: {
        component: "Accordion Angular nativo com Angular Aria, single/multiple, roving focus e relações ARIA.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div tisAccordion [multiExpandable]="multiple" [softDisabled]="false" [wrap]="true">
        <div tisAccordionItem>
          <button tisAccordionTrigger [panel]="first.ariaPanel" [expanded]="true">
            <span tisAccordionTitle>Facturação</span>
            <svg tisAccordionChevron viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div tisAccordionPanel #first="tisAccordionPanel">
            <p>Consulte facturas, dados fiscais e métodos de pagamento.</p>
          </div>
        </div>
        <div tisAccordionItem>
          <button tisAccordionTrigger [panel]="second.ariaPanel">
            <span tisAccordionTitle>Segurança</span>
            <svg tisAccordionChevron viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div tisAccordionPanel #second="tisAccordionPanel">
            <p>Configure autenticação e sessões activas.</p>
          </div>
        </div>
        <div tisAccordionItem>
          <button tisAccordionTrigger [panel]="third.ariaPanel" [disabled]="disabled">
            <span tisAccordionTitle>Configuração bloqueada</span>
            <svg tisAccordionChevron viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div tisAccordionPanel #third="tisAccordionPanel">
            <p>Este conteúdo não está disponível.</p>
          </div>
        </div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<AccordionArgs>;

export const Playground: Story = {};
export const Multiple: Story = { args: { multiple: true, disabled: false } };
