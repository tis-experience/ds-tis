import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisTab,
  TisTabList,
  TisTabPanel,
  TisTabs,
} from "../tabs/src/public-api";

interface TabsArgs {
  selectedTab: string;
  disabled: boolean;
  selectionMode: "follow" | "explicit";
}

const meta: Meta<TabsArgs> = {
  id: "angular-tabs",
  title: "Componentes/Tabs",
  tags: ["autodocs"],
  decorators: [moduleMetadata({
    imports: [TisTab, TisTabList, TisTabPanel, TisTabs],
  })],
  args: {
    selectedTab: "overview",
    disabled: true,
    selectionMode: "follow",
  },
  argTypes: {
    selectedTab: {
      control: "radio",
      options: ["overview", "team", "billing"],
      description: "Tab selecionada.",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita a tab Cobrança e a remove da navegação por setas.",
    },
    selectionMode: {
      control: "radio",
      options: ["follow", "explicit"],
      description: "Seleciona ao mover o foco ou exige Enter/Espaço.",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "Tabs Angular nativo com Angular Aria, roving tabindex, seleção controlável e relações ARIA.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div tisTabs class="ds-angular-tabs-stage">
        <div
          tisTabList
          aria-label="Seções do projeto"
          [selectedTab]="selectedTab"
          (selectedTabChange)="selectedTab = $event || 'overview'"
          [selectionMode]="selectionMode"
          focusMode="roving"
          [wrap]="true"
          [softDisabled]="false"
        >
          <button tisTab value="overview">Visão geral</button>
          <button tisTab value="team">Equipe</button>
          <button tisTab value="billing" [disabled]="disabled">Cobrança</button>
        </div>
        <div tisTabPanel value="overview">Resumo do projeto e atividade recente.</div>
        <div tisTabPanel value="team">Pessoas, funções e permissões do projeto.</div>
        <div tisTabPanel value="billing">Plano, faturas e forma de pagamento.</div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TabsArgs>;

export const Playground: Story = {};

export const TodasHabilitadas: Story = {
  args: { disabled: false },
};

export const AtivacaoExplicita: Story = {
  args: { selectionMode: "explicit" },
};
