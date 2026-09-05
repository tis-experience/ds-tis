import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { FormsModule } from "@angular/forms";
import { TisFormField } from "../form-field/src/public-api";
import { TisButton } from "../button/src/public-api";

const meta: Meta = {
  id: "angular-form-field",
  title: "Componentes/Form Field",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisFormField, TisButton, FormsModule] })],
  args: { label: "Nome", required: true, invalid: false, showLabel: true, helperText: "Como devemos chamar você?", errorMessage: "Informe seu nome." },
  render: (args) => ({
    props: args,
    template: `
      <tis-form-field #field="tisFormField" [label]="label" [required]="required" [invalid]="invalid"
        [showLabel]="showLabel" [helperText]="helperText" [errorMessage]="errorMessage">
        <div class="ds-input" [class.ds-input--error]="field.invalid()">
          <input class="ds-input__field" [id]="field.controlId()" [required]="field.required()"
            [attr.aria-label]="field.ariaLabel()" [attr.aria-invalid]="field.ariaInvalid()"
            [attr.aria-describedby]="field.describedBy()" autocomplete="name">
        </div>
      </tis-form-field>`,
  }),
};
export default meta;
type Story = StoryObj;
export const Playground: Story = {};
export const SemLabelVisivel: Story = { args: { showLabel: false } };
export const Validacao: Story = {
  render: () => ({
    props: { value: "", submitted: false },
    template: `
      <form class="ds-field" novalidate (ngSubmit)="submitted = true">
        <tis-form-field #field="tisFormField" label="Nome para contato" required
          [invalid]="submitted && !value.trim()" helperText="Use seu nome completo." errorMessage="Informe seu nome.">
          <div class="ds-input" [class.ds-input--error]="field.invalid()">
            <input class="ds-input__field" name="contactName" [(ngModel)]="value" [id]="field.controlId()"
              [required]="field.required()" [attr.aria-describedby]="field.describedBy()"
              [attr.aria-invalid]="field.ariaInvalid()" autocomplete="name">
          </div>
        </tis-form-field>
        <div><tis-button type="submit">Validar nome</tis-button></div>
      </form>`,
  }),
};
export const Textarea: Story = {
  render: () => ({
    template: `
      <tis-form-field #field="tisFormField" label="Observações" helperText="Inclua o contexto necessário.">
        <div class="ds-textarea">
          <textarea class="ds-textarea__field" [id]="field.controlId()" [attr.aria-describedby]="field.describedBy()" rows="3"></textarea>
        </div>
      </tis-form-field>`,
  }),
};
