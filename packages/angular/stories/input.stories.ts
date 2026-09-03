import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisInput,
  TisInputIconEnd,
  TisInputIconStart,
  type TisInputSize,
  type TisInputType,
} from "../input/src/public-api";

interface InputArgs {
  disabled: boolean;
  helperText: string;
  invalid: boolean;
  label: string;
  readonly: boolean;
  required: boolean;
  showLeadingIcon: boolean;
  showTrailingIcon: boolean;
  size: TisInputSize;
  type: TisInputType;
  value: string;
}

const leadingIcon = `
  <svg tisInputIconStart viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M4 21a8 8 0 0 1 16 0"></path>
  </svg>
`;

const trailingIcon = `
  <svg tisInputIconEnd viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
`;

const meta: Meta<InputArgs> = {
  id: "angular-input",
  title: "Componentes/Input Text",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisInput, TisInputIconEnd, TisInputIconStart] })],
  args: {
    disabled: false,
    helperText: "Use seu e-mail corporativo.",
    invalid: false,
    label: "E-mail",
    readonly: false,
    required: true,
    showLeadingIcon: true,
    showTrailingIcon: false,
    size: "md",
    type: "email",
    value: "",
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    type: { control: "select", options: ["text", "email", "password", "search", "tel", "url", "number"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Input Text standalone com elemento nativo, Form Field completo e integração ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-input-stage">
        <tis-input
          [(value)]="value"
          [disabled]="disabled"
          [helperText]="helperText"
          [invalid]="invalid"
          [label]="label"
          [readonly]="readonly"
          [required]="required"
          [size]="size"
          [type]="type"
          placeholder="nome@empresa.com"
          autocomplete="email"
          errorMessage="Digite um e-mail válido."
        >
          ${args.showLeadingIcon ? leadingIcon : ""}
          ${args.showTrailingIcon ? trailingIcon : ""}
        </tis-input>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-input-grid">
        <tis-input label="Padrão" placeholder="nome@empresa.com" />
        <tis-input label="Preenchido" value="usuario@empresa.com" />
        <tis-input label="Erro" value="email-inválido" [invalid]="true" errorMessage="Digite um e-mail válido." />
        <tis-input label="Desabilitado" value="indisponível@empresa.com" [disabled]="true" />
        <tis-input label="Somente leitura" value="consulta@empresa.com" [readonly]="true" />
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-input-grid">
        <tis-input label="Pequeno" size="sm" placeholder="sm" />
        <tis-input label="Médio" size="md" placeholder="md" />
        <tis-input label="Grande" size="lg" placeholder="lg" />
      </div>
    `,
  }),
};

export const ComIcones: Story = {
  args: { showLeadingIcon: true, showTrailingIcon: true },
};

export const AngularForms: Story = {
  render: () => ({
    props: { email: "", submitted: false },
    template: `
      <form class="ds-angular-input-form" novalidate (submit)="submitted = true; $event.preventDefault()">
        <tis-input
          name="email"
          [(ngModel)]="email"
          label="E-mail"
          type="email"
          autocomplete="email"
          helperText="Use seu e-mail corporativo."
          [required]="true"
          [invalid]="submitted && !email"
          errorMessage="Digite um e-mail para continuar."
        >
          ${leadingIcon}
        </tis-input>
        <button class="ds-button ds-button--brand ds-button--sm" type="submit">
          <span class="ds-button__label">Continuar</span>
        </button>
        <p class="ds-angular-input-status" role="status">Valor do formulário: {{ email || 'nenhum' }}</p>
      </form>
    `,
  }),
};
