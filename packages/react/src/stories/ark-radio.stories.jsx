import { useState } from 'react';

import {
  RadioGroup,
  RadioGroupContent,
  RadioGroupDescription,
  RadioGroupError,
  RadioGroupHiddenInput,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
} from '../ark/radio.jsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

const options = [
  { description: 'Resposta em até um dia útil.', label: 'E-mail', value: 'email' },
  { description: null, label: 'SMS', value: 'sms' },
];

function RadioExample({ defaultValue = 'email', disabledValue, invalid = false, name, size = 'md' }) {
  return (
    <RadioGroup defaultValue={defaultValue} invalid={invalid} name={name}>
      <RadioGroupLegend>Preferência de contato</RadioGroupLegend>
      {options.map((option) => (
        <RadioGroupOption
          disabled={option.value === disabledValue}
          key={option.value}
          value={option.value}
        >
          <RadioGroupItem size={size} />
          <RadioGroupContent>
            <RadioGroupLabel>{option.label}</RadioGroupLabel>
            {option.description ? <RadioGroupDescription>{option.description}</RadioGroupDescription> : null}
          </RadioGroupContent>
          <RadioGroupHiddenInput />
        </RadioGroupOption>
      ))}
      {invalid ? <RadioGroupError>Escolha uma opção válida.</RadioGroupError> : null}
    </RadioGroup>
  );
}

export default {
  id: 'ark-radio',
  title: 'Outputs/Ark + Zag/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter Radio independente. Ark UI fornece as parts, Zag mantém seleção exclusiva, teclado, foco e inputs de formulário, e o DS TIS preserva visual e tokens.',
      },
    },
  },
  args: {
    defaultValue: 'email',
    size: 'md',
    invalid: false,
    disabledValue: '',
  },
  argTypes: {
    defaultValue: storyArg({ control: 'radio', defaultValue: 'email', description: 'Opção selecionada inicialmente.', options: ['email', 'sms'] }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho dos controles.', options: ['sm', 'md', 'lg'] }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Comunica erro do grupo.' }),
    disabledValue: storyArg({ control: 'radio', defaultValue: '', description: 'Opção individual indisponível.', options: ['', 'email', 'sms'] }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas narrow><RadioExample {...args} name="contact" /></StoryCanvas>,
};

export const States = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        <RadioExample disabledValue="sms" name="state-enabled" />
        <RadioExample defaultValue="" invalid name="state-invalid" />
      </StoryStack>
    </StoryCanvas>
  ),
};

export const Sizes = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        {['sm', 'md', 'lg'].map((size) => <RadioExample key={size} name={`size-${size}`} size={size} />)}
      </StoryStack>
    </StoryCanvas>
  ),
};

function RadioFormExample() {
  const [result, setResult] = useState('Nenhum envio');

  return (
    <StoryCanvas narrow>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(new FormData(event.currentTarget).get('delivery') || 'sem seleção');
        }}
      >
        <StoryStack>
          <RadioExample defaultValue="sms" name="delivery" />
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
  render: () => <RadioFormExample />,
};
