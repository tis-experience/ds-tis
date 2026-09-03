import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisButton } from "../button/src/public-api";
import {
  TisModal,
  TisModalBody,
  TisModalFooter,
  TisModalInitialFocus,
  type TisModalSize,
} from "../modal/src/public-api";

interface ModalArgs {
  closeLabel: string;
  description: string;
  size: TisModalSize;
  title: string;
}

const imports = [TisButton, TisModal, TisModalBody, TisModalFooter, TisModalInitialFocus];

const meta: Meta<ModalArgs> = {
  id: "angular-modal",
  title: "Componentes/Modal",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports })],
  args: {
    closeLabel: "Fechar modal",
    description: "Confira os dados antes de aplicar esta atualização reversível.",
    size: "md",
    title: "Revisar alterações",
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Modal standalone com CDK Overlay/Portal/A11y, focus trap, Escape, backdrop e retorno de foco.",
      },
    },
  },
  render: (args) => ({
    props: { ...args, modalOpen: false },
    template: `
      <div class="ds-angular-modal-stage">
        <tis-button variant="outline" (click)="modalOpen = true">Abrir modal</tis-button>
        <tis-modal
          #modal
          [title]="title"
          [description]="description"
          [closeLabel]="closeLabel"
          [size]="size"
          [(open)]="modalOpen"
        >
          <div tisModalBody>
            <p>Esta ação mantém o contexto da página e pode ser cancelada.</p>
          </div>
          <div tisModalFooter>
            <tis-button variant="outline" (click)="modal.close('api')">Cancelar</tis-button>
            <tis-button tisModalInitialFocus variant="brand" (click)="modal.close('api')">
              Aplicar alterações
            </tis-button>
          </div>
        </tis-modal>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ModalArgs>;

export const Playground: Story = {};

export const Tamanhos: Story = {
  render: (args) => ({
    props: {
      ...args,
      lgOpen: false,
      mdOpen: false,
      smOpen: false,
    },
    template: `
      <div class="ds-angular-modal-stage ds-angular-modal-stage--sizes">
        <tis-button variant="outline" (click)="smOpen = true">Abrir modal sm</tis-button>
        <tis-button variant="outline" (click)="mdOpen = true">Abrir modal md</tis-button>
        <tis-button variant="outline" (click)="lgOpen = true">Abrir modal lg</tis-button>

        <tis-modal #smModal title="Modal sm" description="Conteúdo breve." size="sm" [(open)]="smOpen">
          <div tisModalBody><p>Use para mensagens e decisões curtas.</p></div>
          <div tisModalFooter><tis-button (click)="smModal.close('api')">Continuar</tis-button></div>
        </tis-modal>

        <tis-modal #mdModal title="Modal md" description="Tamanho padrão." size="md" [(open)]="mdOpen">
          <div tisModalBody><p>Use para edições simples e formulários curtos.</p></div>
          <div tisModalFooter><tis-button (click)="mdModal.close('api')">Continuar</tis-button></div>
        </tis-modal>

        <tis-modal #lgModal title="Modal lg" description="Conteúdo com mais espaço." size="lg" [(open)]="lgOpen">
          <div tisModalBody><p>Use quando os componentes internos precisam de mais largura.</p></div>
          <div tisModalFooter><tis-button (click)="lgModal.close('api')">Continuar</tis-button></div>
        </tis-modal>
      </div>
    `,
  }),
};

export const CorpoCustomizado: Story = {
  args: {
    description: "Informe os dados necessários para enviar o convite.",
    title: "Convidar pessoa",
  },
  render: (args) => ({
    props: { ...args, modalOpen: false },
    template: `
      <div class="ds-angular-modal-stage">
        <tis-button variant="outline" (click)="modalOpen = true">Convidar pessoa</tis-button>
        <tis-modal
          #modal
          [title]="title"
          [description]="description"
          [closeLabel]="closeLabel"
          [size]="size"
          [(open)]="modalOpen"
        >
          <div tisModalBody>
            <div class="ds-field">
              <label class="ds-field__label" for="angular-modal-email">E-mail</label>
              <div class="ds-input ds-input--md">
                <input
                  tisModalInitialFocus
                  class="ds-input__field"
                  id="angular-modal-email"
                  type="email"
                  placeholder="nome@empresa.com"
                >
              </div>
              <p class="ds-field__helper">Enviaremos um convite para este endereço.</p>
            </div>
          </div>
          <div tisModalFooter>
            <tis-button variant="outline" (click)="modal.close('api')">Cancelar</tis-button>
            <tis-button variant="brand" (click)="modal.close('api')">Enviar convite</tis-button>
          </div>
        </tis-modal>
      </div>
    `,
  }),
};
