import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisButton } from "../button/src/public-api";
import { TisDivider, type TisDividerOrientation } from "../divider/src/public-api";

interface DividerArgs {
  decorative: boolean;
  orientation: TisDividerOrientation;
}

const imports = [TisButton, TisDivider];

const meta: Meta<DividerArgs> = {
  id: "angular-divider",
  title: "Componentes/Divider",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports })],
  args: {
    decorative: false,
    orientation: "horizontal",
  },
  argTypes: {
    decorative: { control: "boolean" },
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Diretiva Angular standalone aplicada a hr nativo, com orientação explícita e opção decorativa.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      @if (orientation === 'vertical') {
        <div class="ds-angular-divider-toolbar">
          <span>Anterior</span>
          <hr tisDivider orientation="vertical" [decorative]="decorative">
          <span>Próximo</span>
        </div>
      } @else {
        <div class="ds-angular-divider-stack">
          <span>Conteúdo acima</span>
          <hr tisDivider [decorative]="decorative">
          <span>Conteúdo abaixo</span>
        </div>
      }
    `,
  }),
};

export default meta;
type Story = StoryObj<DividerArgs>;

export const Playground: Story = {};

export const SecoesDeConteudo: Story = {
  render: () => ({
    template: `
      <section class="ds-angular-divider-stack" aria-labelledby="divider-section-title">
        <div>
          <h2 id="divider-section-title">Preferências</h2>
          <p>Defina como as atualizações serão apresentadas.</p>
        </div>
        <hr tisDivider>
        <div>
          <h2>Privacidade</h2>
          <p>Controle quem pode ver as informações do perfil.</p>
        </div>
      </section>
    `,
  }),
};

export const Toolbar: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-divider-toolbar" role="toolbar" aria-label="Edição de texto">
        <tis-button size="sm" variant="ghost">Recortar</tis-button>
        <tis-button size="sm" variant="ghost">Copiar</tis-button>
        <hr tisDivider orientation="vertical" [decorative]="true">
        <tis-button size="sm" variant="ghost">Desfazer</tis-button>
      </div>
    `,
  }),
};
