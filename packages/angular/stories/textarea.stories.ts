import { FormsModule } from "@angular/forms";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import { TisTextarea, type TisTextareaSize } from "../textarea/src/public-api";

interface TextareaArgs {
  disabled: boolean;
  helperText: string;
  invalid: boolean;
  label: string;
  maxLength: number;
  readonly: boolean;
  required: boolean;
  showCounter: boolean;
  size: TisTextareaSize;
  value: string;
}

const meta: Meta<TextareaArgs> = {
  id: "angular-textarea",
  title: "Componentes/Textarea",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [FormsModule, TisTextarea] })],
  args: {
    disabled: false,
    helperText: "Máximo de 500 caracteres.",
    invalid: false,
    label: "Mensagem",
    maxLength: 500,
    readonly: false,
    required: false,
    showCounter: true,
    size: "md",
    value: "",
  },
  argTypes: {
    maxLength: { control: { type: "number", min: 1 } },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Textarea standalone com elemento nativo, contador acessível, Form Field completo e ControlValueAccessor.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-textarea-stage">
        <tis-textarea
          [(value)]="value"
          [disabled]="disabled"
          [helperText]="helperText"
          [invalid]="invalid"
          [label]="label"
          [maxLength]="maxLength"
          [readonly]="readonly"
          [required]="required"
          [showCounter]="showCounter"
          [size]="size"
          placeholder="Descreva sua solicitação…"
          errorMessage="Inclua mais detalhes."
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Playground: Story = {};

export const Estados: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-textarea-grid">
        <tis-textarea label="Padrão" placeholder="Descreva sua solicitação…" />
        <tis-textarea label="Preenchido" value="Precisamos revisar o fluxo antes da publicação." />
        <tis-textarea label="Erro" value="Curto" [invalid]="true" errorMessage="Inclua mais detalhes." />
        <tis-textarea label="Desabilitado" value="Conteúdo indisponível." [disabled]="true" />
        <tis-textarea label="Somente leitura" value="Conteúdo apenas para consulta." [readonly]="true" />
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-textarea-grid">
        <tis-textarea label="Pequeno" size="sm" placeholder="sm" />
        <tis-textarea label="Médio" size="md" placeholder="md" />
        <tis-textarea label="Grande" size="lg" placeholder="lg" />
      </div>
    `,
  }),
};

export const ComContador: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-textarea-grid">
        <tis-textarea
          label="Mensagem"
          value="Conteúdo em revisão."
          helperText="Máximo de 80 caracteres."
          [maxLength]="80"
          [showCounter]="true"
        />
        <tis-textarea
          label="Resumo"
          value="Este conteúdo ultrapassa deliberadamente o limite curto."
          helperText="Revise o conteúdo antes de continuar."
          [maxLength]="24"
          [showCounter]="true"
          [invalid]="true"
          errorMessage="Reduza o conteúdo."
        />
      </div>
    `,
  }),
};

export const AngularForms: Story = {
  render: () => ({
    props: { message: "", submitted: false },
    template: `
      <form class="ds-angular-textarea-form" novalidate (submit)="submitted = true; $event.preventDefault()">
        <tis-textarea
          name="message"
          [(ngModel)]="message"
          label="Mensagem"
          helperText="Explique o contexto em poucas linhas."
          [maxLength]="500"
          [showCounter]="true"
          [required]="true"
          [invalid]="submitted && !message"
          errorMessage="Escreva uma mensagem para continuar."
        />
        <button class="ds-button ds-button--brand ds-button--sm" type="submit">
          <span class="ds-button__label">Enviar</span>
        </button>
        <p class="ds-angular-textarea-status" role="status">Caracteres: {{ message.length }}</p>
      </form>
    `,
  }),
};
