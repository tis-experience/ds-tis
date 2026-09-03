import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisCheckbox, type TisCheckboxSize } from "../checkbox/src/public-api";

interface CheckboxArgs {
  checked: boolean;
  description: string;
  disabled: boolean;
  helperText: string;
  indeterminate: boolean;
  invalid: boolean;
  size: TisCheckboxSize;
}

const meta: Meta<CheckboxArgs> = {
  id: "angular-checkbox",
  title: "Componentes/Checkbox",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisCheckbox] })],
  args: {
    checked: false,
    description: "Receba um resumo das alterações feitas no projecto.",
    disabled: false,
    helperText: "Pode alterar esta preferência a qualquer momento.",
    indeterminate: false,
    invalid: false,
    size: "md",
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Checkbox standalone com input nativo, estado indeterminate e integração ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tis-checkbox
        [checked]="checked"
        [description]="description"
        [disabled]="disabled"
        [helperText]="helperText"
        [indeterminate]="indeterminate"
        [invalid]="invalid"
        [size]="size"
      >
        Receber resumo semanal
      </tis-checkbox>
    `,
  }),
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-checkbox-grid">
        <tis-checkbox>Não marcado</tis-checkbox>
        <tis-checkbox [checked]="true">Marcado</tis-checkbox>
        <tis-checkbox [indeterminate]="true">Seleção parcial</tis-checkbox>
        <tis-checkbox [disabled]="true">Desabilitado</tis-checkbox>
        <tis-checkbox [checked]="true" [disabled]="true">Marcado e desabilitado</tis-checkbox>
        <tis-checkbox [invalid]="true" errorMessage="Selecione esta opção para continuar">
          Aceitar os termos
        </tis-checkbox>
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-checkbox-grid">
        <tis-checkbox size="sm">Pequeno</tis-checkbox>
        <tis-checkbox size="md">Médio</tis-checkbox>
        <tis-checkbox size="lg">Grande</tis-checkbox>
      </div>
    `,
  }),
};

export const AngularForms: Story = {
  render: () => ({
    props: { accepted: false, submitted: false },
    template: `
      <form class="ds-angular-checkbox-form" #form="ngForm" novalidate (submit)="submitted = true; $event.preventDefault()">
        <tis-checkbox
          name="accepted"
          [(ngModel)]="accepted"
          [required]="true"
          [invalid]="submitted && !accepted"
          errorMessage="Aceite os termos para continuar"
        >
          Aceito os termos de utilização
        </tis-checkbox>
        <button class="ds-button ds-button--brand ds-button--sm" type="submit">
          <span class="ds-button__label">Continuar</span>
        </button>
        <p class="ds-angular-checkbox-status" role="status">
          Valor do formulário: {{ accepted ? 'true' : 'false' }}
        </p>
      </form>
    `,
  }),
};
