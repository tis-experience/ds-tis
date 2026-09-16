import { forwardRef, useId, useRef, useState } from 'react';
import { Button } from '../ark/button.jsx';
import { Textarea } from '../ark/textarea.jsx';
import { StoryCanvas, StoryRow, StoryStack, storyArg } from './_shared.jsx';

const TextareaField = forwardRef(function TextareaField({
  label = 'Mensagem', helper = 'Descreva sua solicitação.', error = 'Revise a mensagem.',
  invalid = false, required = false, counter, ...props
}, ref) {
  const id = useId();
  const message = invalid ? error : helper;
  return (
    <div className={invalid ? 'ds-field ds-field--error' : 'ds-field'}>
      <div className="ds-field__label-row">
        <label className="ds-field__label" htmlFor={id}>{label}</label>
        {required && <span className="ds-field__required" aria-hidden="true">*</span>}
      </div>
      <Textarea
        {...props} ref={ref} id={id} required={required} aria-invalid={invalid || undefined}
        aria-describedby={[message && `${id}-message`, counter != null && `${id}-counter`].filter(Boolean).join(' ') || undefined}
      />
      {message && <span id={`${id}-message`} className={invalid ? 'ds-field__error' : 'ds-field__helper'}>{message}</span>}
      {counter != null && <span id={`${id}-counter`} className="ds-field__counter" data-slot="textarea-counter">{counter}</span>}
    </div>
  );
});

function MessageForm(props) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const ref = useRef(null);
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setSubmitted(new FormData(event.currentTarget).get('message')?.toString() || '');
    }} onReset={() => { setValue(''); setSubmitted(''); ref.current?.focus(); }}>
      <StoryStack>
        <TextareaField
          {...props} name="message" ref={ref} value={value} maxLength={200}
          filled={value.length > 0} counter={`${value.length}/200`} helper="Máximo de 200 caracteres."
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <StoryRow><Button type="submit">Enviar</Button><Button type="reset" variant="outline">Limpar</Button></StoryRow>
        <output data-slot="textarea-result" aria-live="polite">{submitted}</output>
      </StoryStack>
    </form>
  );
}

export default {
  id: 'ark-textarea', title: 'Outputs/Ark + Zag/Textarea', component: Textarea, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Textarea TIS sobre Ark Factory e controle nativo. Preserva edição multilinha, formulário, ref, estados e redimensionamento vertical.' } } },
  args: { size: 'md', disabled: false, readOnly: false, invalid: false, required: true, placeholder: 'Descreva sua solicitação…' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho do campo.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Desabilita o controle nativo.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Permite seleção sem edição.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Associa mensagem e estado inválido.' }),
    required: storyArg({ control: 'boolean', defaultValue: true, description: 'Exige preenchimento para envio.' }),
    placeholder: storyArg({ control: 'text', defaultValue: 'Descreva sua solicitação…', description: 'Exemplo de conteúdo.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><MessageForm {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <TextareaField key={size} size={size} label={`Textarea ${size}`} placeholder={`Tamanho ${size}`} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack>
  <TextareaField label="Preenchido" defaultValue="Conteúdo preenchido" filled />
  <TextareaField label="Inválido" defaultValue="Conteúdo inválido" invalid />
  <TextareaField label="Somente leitura" defaultValue="Conteúdo somente leitura" readOnly />
  <TextareaField label="Desabilitado" defaultValue="Desabilitado" disabled helper={null} />
</StoryStack></StoryCanvas> };
export const Uncontrolled = { render: () => <StoryCanvas narrow><TextareaField name="notes" label="Observações" defaultValue={'Primeira linha\nSegunda linha'} /></StoryCanvas> };
