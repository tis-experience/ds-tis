import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisSelect, TisSelectIcon, type TisSelectSize } from "../select/src/public-api";

interface SelectArgs {
  disabled: boolean;
  helperText: string;
  invalid: boolean;
  label: string;
  readonly: boolean;
  required: boolean;
  showLeadingIcon: boolean;
  size: TisSelectSize;
  value: string;
}

const options = `
  <option value="br">Brasil</option>
  <option value="cl">Chile</option>
  <option value="pt">Portugal</option>
  <option value="unavailable" disabled>Indisponível</option>
`;

const leadingIcon = `
  <svg tisSelectIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"></path>
  </svg>
`;

const meta: Meta<SelectArgs> = {
  id: "angular-select",
  title: "Componentes/Select",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisSelect, TisSelectIcon] })],
  args: {
    disabled: false,
    helperText: "Selecione o país de residência.",
    invalid: false,
    label: "País",
    readonly: false,
    required: true,
    showLeadingIcon: false,
    size: "md",
    value: "br",
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    value: { control: "select", options: ["", "br", "cl", "pt"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Select standalone com elemento nativo, Form Field completo e integração ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-select-stage">
        <tis-select
          [(value)]="value"
          [disabled]="disabled"
          [helperText]="helperText"
          [invalid]="invalid"
          [label]="label"
          [readonly]="readonly"
          [required]="required"
          [size]="size"
          errorMessage="Selecione uma opção válida."
        >
          ${args.showLeadingIcon ? leadingIcon : ""}
          ${options}
        </tis-select>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-select-grid">
        <tis-select label="Padrão">${options}</tis-select>
        <tis-select label="Preenchido" value="br">${options}</tis-select>
        <tis-select label="Erro" [invalid]="true" errorMessage="Selecione uma opção válida.">${options}</tis-select>
        <tis-select label="Desabilitado" [disabled]="true">${options}</tis-select>
        <tis-select label="Somente leitura" value="pt" [readonly]="true">${options}</tis-select>
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-select-grid">
        <tis-select label="Pequeno" size="sm">${options}</tis-select>
        <tis-select label="Médio" size="md">${options}</tis-select>
        <tis-select label="Grande" size="lg">${options}</tis-select>
      </div>
    `,
  }),
};

export const ComIcone: Story = {
  args: { showLeadingIcon: true },
};

export const AngularForms: Story = {
  render: () => ({
    props: { country: "", submitted: false },
    template: `
      <form class="ds-angular-select-form" novalidate (submit)="submitted = true; $event.preventDefault()">
        <tis-select
          name="country"
          [(ngModel)]="country"
          label="País"
          helperText="Selecione o país de residência."
          [required]="true"
          [invalid]="submitted && !country"
          errorMessage="Selecione um país para continuar."
        >
          ${options}
        </tis-select>
        <button class="ds-button ds-button--brand ds-button--sm" type="submit">
          <span class="ds-button__label">Continuar</span>
        </button>
        <p class="ds-angular-select-status" role="status">Valor do formulário: {{ country || 'nenhum' }}</p>
      </form>
    `,
  }),
};
