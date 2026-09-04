import { forwardRef, useId, useRef, useState } from 'react';
import { MailIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '../ark/button.jsx';
import { Input } from '../ark/input.jsx';
import { StoryCanvas, StoryRow, StoryStack, storyArg } from './_shared.jsx';

const InputField = forwardRef(function InputField({
  error = 'Informe um e-mail válido.',
  helper = 'Use seu e-mail corporativo.',
  invalid = false,
  label = 'E-mail',
  required = false,
  ...props
}, ref) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = invalid ? error : helper;

  return (
    <div className={invalid ? 'ds-field ds-field--error' : 'ds-field'}>
      <div className="ds-field__label-row">
        <label className="ds-field__label" htmlFor={id}>{label}</label>
        {required ? <span aria-hidden="true" className="ds-field__required">*</span> : null}
      </div>
      <Input
        {...props}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
        id={id}
        ref={ref}
        required={required}
      />
      {message ? (
        <span
          className={invalid ? 'ds-field__error' : 'ds-field__helper'}
          id={messageId}
          role={invalid ? 'alert' : undefined}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
});

function InteractiveInput({ initialValue = '', ...props }) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  return (
    <StoryStack>
      <InputField
        {...props}
        filled={value.length > 0}
        leadingIcon={<MailIcon />}
        onChange={(event) => setValue(event.currentTarget.value)}
        ref={inputRef}
        value={value}
      />
      <StoryRow>
        <Button
          onClick={() => {
            setValue('');
            inputRef.current?.focus();
          }}
          variant="outline"
        >
          <XIcon aria-hidden="true" className="ds-button__icon" />
          Limpar
        </Button>
        <output aria-live="polite" data-slot="input-result">
          {value ? `Valor atual: ${value}` : 'Campo vazio'}
        </output>
      </StoryRow>
    </StoryStack>
  );
}

function InputFormExample() {
  const [submittedValue, setSubmittedValue] = useState('Nenhum envio ainda.');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmittedValue(new FormData(event.currentTarget).get('email')?.toString() || 'Campo vazio');
      }}
    >
      <StoryStack>
        <InputField
          label="E-mail"
          name="email"
          placeholder="nome@empresa.com"
          required
          type="email"
        />
        <StoryRow>
          <Button type="submit">Enviar</Button>
          <output aria-live="polite" data-slot="form-result">{submittedValue}</output>
        </StoryRow>
      </StoryStack>
    </form>
  );
}

export default {
  id: 'ark-input',
  title: 'Outputs/Ark + Zag/Input Text',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter React independente sobre Ark Factory e input nativo. Preserva a anatomia, os estados e os tokens do Input Text TIS sem máquina Zag desnecessária.',
      },
    },
  },
  args: {
    disabled: false,
    initialValue: '',
    invalid: false,
    placeholder: 'nome@empresa.com',
    readOnly: false,
    required: true,
    size: 'md',
  },
  argTypes: {
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede foco e edição pelo atributo nativo.' }),
    initialValue: storyArg({ control: 'text', defaultValue: '', description: 'Valor inicial do exemplo interativo.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Liga aria-invalid e a mensagem de erro.' }),
    placeholder: storyArg({ control: 'text', defaultValue: 'nome@empresa.com', description: 'Exemplo de formato; o label permanece visível.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Permite foco e seleção sem permitir edição.' }),
    required: storyArg({ control: 'boolean', defaultValue: true, description: 'Marca o controle como obrigatório.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Altura e densidade explícitas.', options: ['sm', 'md', 'lg'] }),
  },
};

export const Playground = {
  render: ({ initialValue, ...args }) => (
    <StoryCanvas narrow>
      <InteractiveInput {...args} initialValue={initialValue} />
    </StoryCanvas>
  ),
};

export const Sizes = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        {['sm', 'md', 'lg'].map((size) => (
          <InputField key={size} label={`Input ${size}`} placeholder={`Tamanho ${size}`} size={size} />
        ))}
      </StoryStack>
    </StoryCanvas>
  ),
};

export const States = {
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        <InputField filled label="Preenchido" defaultValue="Conteúdo informado" />
        <InputField invalid label="Inválido" defaultValue="valor-inválido" />
        <InputField label="Somente leitura" defaultValue="Somente leitura" readOnly />
        <InputField disabled helper={null} label="Desabilitado" defaultValue="Desabilitado" />
      </StoryStack>
    </StoryCanvas>
  ),
};

export const WithIcons = {
  name: 'With icons',
  render: () => (
    <StoryCanvas narrow>
      <StoryStack>
        <InputField label="Pesquisar" leadingIcon={<SearchIcon />} placeholder="Busque por nome" />
        <InputField label="E-mail" placeholder="nome@empresa.com" trailingIcon={<MailIcon />} />
      </StoryStack>
    </StoryCanvas>
  ),
};

export const FormSubmission = {
  name: 'Form submission',
  render: () => (
    <StoryCanvas narrow>
      <InputFormExample />
    </StoryCanvas>
  ),
};
