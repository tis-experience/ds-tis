import * as React from 'react';

import { Button } from '../../../../registry/tis/button.tsx';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLabelRow, FieldRequired } from '../../../../registry/tis/field.tsx';
import { Input } from '../../../../registry/tis/input.tsx';
import { StoryCanvas, storyArg } from './_shared.jsx';

function FieldExample({ description, error, invalid, label, required }) {
  return (
    <Field invalid={invalid}>
      <FieldLabelRow><FieldLabel htmlFor="story-field">{label}</FieldLabel>{required ? <FieldRequired /> : null}</FieldLabelRow>
      <Input id="story-field" required={required} aria-invalid={invalid || undefined} aria-describedby={invalid ? 'story-field-error' : 'story-field-help'} />
      {invalid ? <FieldError id="story-field-error">{error}</FieldError> : <FieldDescription id="story-field-help">{description}</FieldDescription>}
    </Field>
  );
}

function SubmissionExample() {
  const [result, setResult] = React.useState('Ainda não enviado.');
  return (
    <form onSubmit={(event) => { event.preventDefault(); setResult(new FormData(event.currentTarget).get('name') || 'Sem nome'); }}>
      <FieldGroup><Field><FieldLabelRow><FieldLabel htmlFor="story-name">Nome</FieldLabel></FieldLabelRow><Input id="story-name" name="name" defaultValue="Ana" /></Field><Button type="submit">Enviar</Button><output aria-live="polite" data-slot="form-result">{result}</output></FieldGroup>
    </form>
  );
}

export default {
  id: 'react-form-field',
  title: 'Components/Input and selection/Form Field',
  component: Field,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Compõe label, controle, ajuda e erro em um campo acessível; o controle permanece um componente separado.' } } },
  args: { label: 'E-mail', description: 'Use seu e-mail corporativo.', error: 'Revise o valor informado.', required: true, invalid: false },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'E-mail', description: 'Rótulo persistente associado ao controle.' }),
    description: storyArg({ control: 'text', defaultValue: 'Use seu e-mail corporativo.', description: 'Orientação exibida no estado válido.' }),
    error: storyArg({ control: 'text', defaultValue: 'Revise o valor informado.', description: 'Mensagem exibida no estado inválido.' }),
    required: storyArg({ control: 'boolean', defaultValue: true, description: 'Marca e configura o campo como obrigatório.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Alterna entre helper text e mensagem de erro.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><FieldExample {...args} /></StoryCanvas> };
export const Invalid = { render: () => <StoryCanvas narrow><FieldExample invalid label="Código" error="Revise o código informado." /></StoryCanvas> };
export const FormComposition = { name: 'Form composition', render: () => <StoryCanvas narrow><SubmissionExample /></StoryCanvas> };
