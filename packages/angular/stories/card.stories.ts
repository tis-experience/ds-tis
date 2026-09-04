import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisBadge } from "../badge/src/public-api";
import { TisButton } from "../button/src/public-api";
import {
  TisCard,
  TisCardContainer,
  TisCardContent,
  TisCardDescription,
  TisCardFooter,
  TisCardHeader,
  TisCardMedia,
  TisCardTitle,
  type TisCardVariant,
} from "../card/src/public-api";

interface CardArgs {
  description: string;
  selected: boolean;
  showMedia: boolean;
  title: string;
  variant: TisCardVariant;
}

const imports = [
  TisBadge,
  TisButton,
  TisCard,
  TisCardContainer,
  TisCardContent,
  TisCardDescription,
  TisCardFooter,
  TisCardHeader,
  TisCardMedia,
  TisCardTitle,
];
const variants: readonly TisCardVariant[] = ["default", "outlined", "elevated", "interactive"];

const staticTemplate = `
  @if (variant === 'interactive') {
    <button tisCard type="button" variant="interactive" class="ds-angular-card" [selected]="selected" (click)="selected = !selected">
      <div tisCardContainer>
        <header tisCardHeader>
          <h2 tisCardTitle>{{ title }}</h2>
          <p tisCardDescription>{{ description }}</p>
        </header>
        <div tisCardContent><p>{{ selected ? 'Selecionado' : 'Selecionar card' }}</p></div>
      </div>
    </button>
  } @else {
    <article tisCard [variant]="variant" class="ds-angular-card">
      @if (showMedia) {
        <div tisCardMedia aria-hidden="true"><span class="ds-angular-card-media"></span></div>
      }
      <div tisCardContainer>
        <header tisCardHeader>
          <h2 tisCardTitle>{{ title }}</h2>
          <p tisCardDescription>{{ description }}</p>
        </header>
        <div tisCardContent>
          <p>128 licenças ativas de 150 disponíveis.</p>
          <tis-badge tone="success" variant="subtle">Saudável</tis-badge>
        </div>
        <footer tisCardFooter><tis-button size="sm" variant="ghost">Ver detalhes</tis-button></footer>
      </div>
    </article>
  }
`;

const meta: Meta<CardArgs> = {
  id: "angular-card",
  title: "Componentes/Card",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports })],
  args: {
    description: "Resumo atualizado há poucos minutos.",
    selected: false,
    showMedia: false,
    title: "Uso da organização",
    variant: "outlined",
  },
  argTypes: {
    variant: { control: "select", options: variants },
    selected: { control: "boolean" },
    showMedia: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: "Card Angular standalone por diretivas, preservando article ou button como raiz semântica e usando a anatomia pública do DS.",
      },
    },
  },
  render: (args) => ({ props: args, template: staticTemplate }),
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Playground: Story = {};

export const Variantes: Story = {
  render: () => ({
    props: { variants: ["default", "outlined", "elevated"] as const },
    template: `
      <div class="ds-angular-card-grid">
        @for (variant of variants; track variant) {
          <article tisCard [variant]="variant" class="ds-angular-card">
            <div tisCardContainer>
              <header tisCardHeader>
                <h2 tisCardTitle>{{ variant }}</h2>
                <p tisCardDescription>Card {{ variant }}.</p>
              </header>
              <div tisCardContent><p>Conteúdo relacionado apresentado como uma unidade.</p></div>
            </div>
          </article>
        }
      </div>
    `,
  }),
};

export const Interativo: Story = {
  render: () => ({
    props: { selected: false },
    template: `
      <div class="ds-angular-card-grid">
        <button tisCard type="button" variant="interactive" class="ds-angular-card" [selected]="selected" (click)="selected = !selected">
          <div tisCardContainer>
            <header tisCardHeader>
              <h2 tisCardTitle>Segurança</h2>
              <p tisCardDescription>Abrir configurações de acesso.</p>
            </header>
            <div tisCardContent><p>{{ selected ? 'Selecionado' : 'Selecionar card' }}</p></div>
          </div>
        </button>
        <p class="ds-angular-card-status" role="status">{{ selected ? 'Card selecionado.' : 'Nenhum card selecionado.' }}</p>
      </div>
    `,
  }),
};

export const ComMedia: Story = {
  args: { showMedia: true, variant: "elevated" },
};
