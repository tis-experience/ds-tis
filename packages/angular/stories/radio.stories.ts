import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisRadioGroup, TisRadioOption, type TisRadioSize } from "../radio/src/public-api";

interface RadioArgs {
  disabledValue: string;
  invalid: boolean;
  size: TisRadioSize;
  value: string | null;
}

const meta: Meta<RadioArgs> = {
  id: "angular-radio",
  title: "Componentes/Radio",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisRadioGroup, TisRadioOption] })],
  args: {
    disabledValue: "",
    invalid: false,
    size: "md",
    value: "email",
  },
  argTypes: {
    disabledValue: { control: "radio", options: ["", "email", "sms"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    value: { control: "radio", options: [null, "email", "sms"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Radio Group standalone com fieldset e inputs nativos, seleção exclusiva e integração ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tis-radio-group
        legend="Preferência de contato"
        name="contact"
        [invalid]="invalid"
        [size]="size"
        [value]="value"
        errorMessage="Escolha uma opção válida."
      >
        <tis-radio-option value="email" [disabled]="disabledValue === 'email'" description="Resposta em até um dia útil.">
          E-mail
        </tis-radio-option>
        <tis-radio-option value="sms" [disabled]="disabledValue === 'sms'">SMS</tis-radio-option>
      </tis-radio-group>
    `,
  }),
};

export default meta;
type Story = StoryObj<RadioArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-radio-grid">
        <tis-radio-group legend="Estado padrão" value="email">
          <tis-radio-option value="email">E-mail</tis-radio-option>
          <tis-radio-option value="sms" [disabled]="true">SMS desabilitado</tis-radio-option>
        </tis-radio-group>
        <tis-radio-group legend="Estado inválido" [invalid]="true" errorMessage="Escolha uma opção para continuar.">
          <tis-radio-option value="email">E-mail</tis-radio-option>
          <tis-radio-option value="sms">SMS</tis-radio-option>
        </tis-radio-group>
        <tis-radio-group legend="Grupo desabilitado" value="email" [disabled]="true">
          <tis-radio-option value="email">E-mail</tis-radio-option>
          <tis-radio-option value="sms">SMS</tis-radio-option>
        </tis-radio-group>
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-radio-grid">
        <tis-radio-group legend="Pequeno" size="sm" value="one"><tis-radio-option value="one">Opção</tis-radio-option></tis-radio-group>
        <tis-radio-group legend="Médio" size="md" value="one"><tis-radio-option value="one">Opção</tis-radio-option></tis-radio-group>
        <tis-radio-group legend="Grande" size="lg" value="one"><tis-radio-option value="one">Opção</tis-radio-option></tis-radio-group>
      </div>
    `,
  }),
};

export const AngularForms: Story = {
  render: () => ({
    props: { channel: null, submitted: false },
    template: `
      <form class="ds-angular-radio-form" #form="ngForm" novalidate (submit)="submitted = true; $event.preventDefault()">
        <tis-radio-group
          legend="Canal de notificação"
          name="channel"
          [(ngModel)]="channel"
          [required]="true"
          [invalid]="submitted && !channel"
          errorMessage="Escolha um canal para continuar."
        >
          <tis-radio-option value="email" description="Resposta em até um dia útil.">E-mail</tis-radio-option>
          <tis-radio-option value="sms">SMS</tis-radio-option>
        </tis-radio-group>
        <button class="ds-button ds-button--brand ds-button--sm" type="submit">
          <span class="ds-button__label">Continuar</span>
        </button>
        <p class="ds-angular-radio-status" role="status">Valor do formulário: {{ channel || 'nenhum' }}</p>
      </form>
    `,
  }),
};
