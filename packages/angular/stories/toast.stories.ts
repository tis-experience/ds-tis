import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisButton } from "../button/src/public-api";
import {
  TisToastRegion,
  type TisToastStyle,
  type TisToastType,
} from "../toast/src/public-api";

interface ToastArgs {
  actionLabel: string;
  description: string;
  style: TisToastStyle;
  title: string;
  type: TisToastType;
}

const meta: Meta<ToastArgs> = {
  id: "angular-toast",
  title: "Componentes/Toast",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisButton, TisToastRegion] })],
  args: {
    actionLabel: "Desfazer",
    description: "A alteração foi aplicada e pode ser revertida.",
    style: "subtle",
    title: "Alterações salvas",
    type: "success",
  },
  argTypes: {
    style: { control: "radio", options: ["subtle", "solid"] },
    type: { control: "select", options: ["success", "warning", "error", "info"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Toast Angular nativo com regiões live, fila limitada, timeout pausável, action persistente e Escape contextual.",
      },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      actionCount: 0,
    },
    template: `
      <div class="ds-angular-toast-stage">
        <tis-button
          variant="outline"
          (click)="region.show({ title, description, type, style, actionLabel, duration: 0 })"
        >Mostrar Toast</tis-button>
        <p class="ds-angular-toast-status" aria-live="polite">Ações executadas: {{ actionCount }}</p>
        <tis-toast-region #region="tisToastRegion" (actioned)="actionCount = actionCount + 1" />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ToastArgs>;

export const Playground: Story = {};

export const SolidError: Story = {
  args: {
    actionLabel: "",
    description: "Revise os dados e tente novamente.",
    style: "solid",
    title: "Não foi possível salvar",
    type: "error",
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-toast-stage">
        <tis-button
          variant="outline"
          (click)="region.show({ title, description, type, style, duration: 0 })"
        >Mostrar Toast</tis-button>
        <tis-toast-region #region="tisToastRegion" />
      </div>
    `,
  }),
};

export const WithoutAction: Story = {
  args: {
    actionLabel: "",
    description: "Você pode continuar trabalhando normalmente.",
    style: "subtle",
    title: "Sincronização concluída",
    type: "info",
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-toast-stage">
        <tis-button
          variant="outline"
          (click)="region.show({ title, description, type, style, duration: 0 })"
        >Mostrar Toast</tis-button>
        <tis-toast-region #region="tisToastRegion" />
      </div>
    `,
  }),
};
