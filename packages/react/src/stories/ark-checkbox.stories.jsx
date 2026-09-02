import {
  Checkbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxDescription,
  CheckboxHiddenInput,
  CheckboxIndicator,
  CheckboxLabel,
} from '../ark/checkbox.jsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';
import { useState } from 'react';

function CheckboxExample({ checked = false, description, disabled = false, invalid = false, label, name, size = 'md' }) {
  return (
    <Checkbox
      defaultChecked={checked}
      disabled={disabled}
      invalid={invalid}
      name={name}
      value="enabled"
    >
      <CheckboxControl size={size}>
        <CheckboxIndicator />
      </CheckboxControl>
      <CheckboxContent>
        <CheckboxLabel>{label}</CheckboxLabel>
        {description ? <CheckboxDescription>{description}</CheckboxDescription> : null}
      </CheckboxContent>
      <CheckboxHiddenInput />
    </Checkbox>
  );
}

export default {
  id: 'ark-checkbox',
  title: 'Outputs/Ark + Zag/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter Checkbox independente. Ark UI fornece as parts React, Zag mantém checked, mixed, foco e input de formulário, e o DS TIS preserva visual e tokens.',
      },
    },
  },
  args: {
    label: 'Receber novidades',
    description: 'Enviaremos apenas atualizações relevantes.',
    size: 'md',
    checked: true,
    disabled: false,
    invalid: false,
  },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'Receber novidades', description: 'Nome acessível e área de clique.' }),
    description: storyArg({ control: 'text', defaultValue: 'Enviaremos apenas atualizações relevantes.', description: 'Descrição opcional.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho do controle.', options: ['sm', 'md', 'lg'] }),
    checked: storyArg({ control: 'boolean', defaultValue: true, description: 'Estado inicial.' }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede interação.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Comunica erro do campo.' }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas narrow><CheckboxExample {...args} name="notifications" /></StoryCanvas>,
};

export const States = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        <CheckboxExample label="Não selecionado" />
        <CheckboxExample checked label="Selecionado" />
        <CheckboxExample checked="indeterminate" label="Seleção parcial" />
        <CheckboxExample checked disabled label="Selecionado indisponível" />
        <CheckboxExample invalid label="Seleção obrigatória" />
      </StoryStack>
    </StoryCanvas>
  ),
};

export const Sizes = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        {['sm', 'md', 'lg'].map((size) => <CheckboxExample checked key={size} label={size} size={size} />)}
      </StoryStack>
    </StoryCanvas>
  ),
};

function CheckboxFormExample() {
  const [result, setResult] = useState('Nenhum envio');

  return (
    <StoryCanvas narrow>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(new FormData(event.currentTarget).get('terms') || 'unchecked');
        }}
      >
        <StoryStack>
          <CheckboxExample checked label="Aceito os termos" name="terms" />
          <button className="ds-button ds-button--primary ds-button--md" type="submit">
            <span className="ds-button__label">Enviar</span>
          </button>
          <output aria-live="polite">Valor enviado: {result}</output>
        </StoryStack>
      </form>
    </StoryCanvas>
  );
}

export const FormSubmission = {
  name: 'Form submission',
  render: () => <CheckboxFormExample />,
};
