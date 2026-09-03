import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisCombobox,
  TisComboboxIcon,
  type TisComboboxOption,
  type TisComboboxSize,
} from "../combobox/src/public-api";

interface ComboboxArgs {
  disabled: boolean;
  helperText: string;
  invalid: boolean;
  label: string;
  readonly: boolean;
  required: boolean;
  showLeadingIcon: boolean;
  size: TisComboboxSize;
  value: string | null;
}

const countries: TisComboboxOption[] = [
  { label: "Argentina", value: "ar" },
  { label: "Brasil", value: "br" },
  { label: "Chile", value: "cl" },
  { disabled: true, label: "Indisponível", value: "disabled" },
  { label: "Portugal", value: "pt" },
];

const leadingIcon = `
  <svg tisComboboxIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="7"></circle>
    <path d="m20 20-4-4"></path>
  </svg>
`;

const meta: Meta<ComboboxArgs> = {
  id: "angular-combobox",
  title: "Componentes/Combobox",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisCombobox, TisComboboxIcon] })],
  args: {
    disabled: false,
    helperText: "Digite para filtrar as opções.",
    invalid: false,
    label: "País",
    readonly: false,
    required: true,
    showLeadingIcon: true,
    size: "md",
    value: null,
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    value: { control: "select", options: [null, "ar", "br", "cl", "pt"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Combobox standalone com Angular Aria, filtro local, Form Field completo e ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: { ...args, countries },
    template: `
      <div class="ds-angular-combobox-stage">
        <tis-combobox
          [(value)]="value"
          [disabled]="disabled"
          [helperText]="helperText"
          [invalid]="invalid"
          [label]="label"
          [options]="countries"
          [readonly]="readonly"
          [required]="required"
          [size]="size"
          errorMessage="Selecione uma opção válida."
        >
          ${args.showLeadingIcon ? leadingIcon : ""}
        </tis-combobox>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ComboboxArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    props: { countries },
    template: `
      <div class="ds-angular-combobox-grid">
        <tis-combobox label="Padrão" [options]="countries" />
        <tis-combobox label="Preenchido" value="br" [options]="countries" />
        <tis-combobox label="Erro" [invalid]="true" errorMessage="Selecione uma opção válida." [options]="countries" />
        <tis-combobox label="Desabilitado" [disabled]="true" [options]="countries" />
        <tis-combobox label="Somente leitura" value="pt" [readonly]="true" [options]="countries" />
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    props: { countries },
    template: `
      <div class="ds-angular-combobox-grid">
        <tis-combobox label="Pequeno" size="sm" [options]="countries" />
        <tis-combobox label="Médio" size="md" [options]="countries" />
        <tis-combobox label="Grande" size="lg" [options]="countries" />
      </div>
    `,
  }),
};

export const AngularForms: Story = {
  render: () => ({
    props: { countries, country: null, submitted: false },
    template: `
      <form class="ds-angular-combobox-form" novalidate (submit)="submitted = true; $event.preventDefault()">
        <tis-combobox
          name="country"
          [(ngModel)]="country"
          label="País"
          [options]="countries"
          helperText="Digite para filtrar as opções."
          [required]="true"
          [invalid]="submitted && !country"
          errorMessage="Selecione um país para continuar."
        />
        <button class="ds-button ds-button--brand ds-button--sm" type="submit">
          <span class="ds-button__label">Continuar</span>
        </button>
        <p class="ds-angular-combobox-status" role="status">Valor do formulário: {{ country || 'nenhum' }}</p>
      </form>
    `,
  }),
};
