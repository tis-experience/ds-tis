import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisToggle, type TisToggleSize } from "../toggle/src/public-api";

interface ToggleArgs {
  checked: boolean;
  description: string;
  disabled: boolean;
  helperText: string;
  size: TisToggleSize;
}

const meta: Meta<ToggleArgs> = {
  id: "angular-toggle",
  title: "Componentes/Toggle",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisToggle] })],
  args: {
    checked: true,
    description: "Notifica sobre acessos suspeitos.",
    disabled: false,
    helperText: "A alteração é aplicada imediatamente.",
    size: "md",
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Toggle standalone com checkbox nativo, role switch e integração ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tis-toggle
        [checked]="checked"
        [description]="description"
        [disabled]="disabled"
        [helperText]="helperText"
        [size]="size"
      >
        Alertas de segurança
      </tis-toggle>
    `,
  }),
};

export default meta;
type Story = StoryObj<ToggleArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-toggle-grid">
        <tis-toggle>Desligado</tis-toggle>
        <tis-toggle [checked]="true">Ligado</tis-toggle>
        <tis-toggle [disabled]="true">Desabilitado</tis-toggle>
        <tis-toggle [checked]="true" [disabled]="true">Ligado e desabilitado</tis-toggle>
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-toggle-grid">
        <tis-toggle size="sm" [checked]="true">Pequeno</tis-toggle>
        <tis-toggle size="md" [checked]="true">Médio</tis-toggle>
        <tis-toggle size="lg" [checked]="true">Grande</tis-toggle>
      </div>
    `,
  }),
};

export const AngularForms: Story = {
  render: () => ({
    props: { enabled: true },
    template: `
      <div class="ds-angular-toggle-form">
        <tis-toggle
          name="securityAlerts"
          [(ngModel)]="enabled"
          description="Notifica sobre acessos suspeitos."
        >
          Alertas de segurança
        </tis-toggle>
        <p class="ds-angular-toggle-status" role="status">Valor do formulário: {{ enabled ? 'true' : 'false' }}</p>
      </div>
    `,
  }),
};
