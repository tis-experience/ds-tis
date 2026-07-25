import { componentDescription, escapeHtml, fieldMarkup, labeledSample, storyDescription } from './helpers.js';

const states = ['default', 'filled', 'error', 'disabled', 'readonly'];

function textareaMarkup(args, suffix = 'playground') {
  const { label, placeholder, helper, value, size, state, required, maxLength, showCounter } = args;
  const id = `story-textarea-${suffix}`;
  const actualValue = value || (state === 'filled' || state === 'readonly' ? 'Precisamos revisar o fluxo antes da publicação.' : state === 'error' ? 'Curto' : '');
  const over = actualValue.length > maxLength;
  const counterId = `${id}-counter`;
  return fieldMarkup({
    id, label, required, helper: state === 'error' ? '' : helper, error: state === 'error' ? 'Inclua mais detalhes.' : '',
    afterControl: showCounter ? `<span class="ds-field__counter${over ? ' ds-field__counter--over' : ''}" id="${counterId}">${actualValue.length}/${maxLength}</span>` : '',
    control: (describedBy) => `<div class="ds-textarea ds-textarea--${size}${state !== 'default' ? ` ds-textarea--${state}` : ''}"><textarea class="ds-textarea__field" id="${id}" placeholder="${escapeHtml(placeholder)}" maxlength="${maxLength}"${[describedBy, showCounter ? counterId : ''].filter(Boolean).length ? ` aria-describedby="${[describedBy, showCounter ? counterId : ''].filter(Boolean).join(' ')}"` : ''}${required ? ' required aria-required="true"' : ''}${state === 'error' ? ' aria-invalid="true"' : ''}${state === 'disabled' ? ' disabled' : ''}${state === 'readonly' ? ' readonly' : ''}>${escapeHtml(actualValue)}</textarea></div>`,
  });
}

export default {
  title: 'Components/Form/Textarea', tags: ['autodocs'],
  args: { label: 'Mensagem', placeholder: 'Descreva sua solicitação…', helper: 'Máximo de 500 caracteres.', value: '', size: 'md', state: 'default', required: false, maxLength: 500, showCounter: true },
  argTypes: {
    label: { control: 'text', description: 'Label visível.' }, placeholder: { control: 'text', description: 'Exemplo breve.' }, helper: { control: 'text', description: 'Ajuda associada.' }, value: { control: 'text', description: 'Conteúdo multilinha.' }, size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' }, state: { control: 'select', options: states, description: 'Estado visual e nativo.' }, required: { control: 'boolean', description: 'Required visual e semântico.' }, maxLength: { control: { type: 'number', min: 1 }, description: 'Limite nativo de caracteres.' }, showCounter: { control: 'boolean', description: 'Exibe contagem associada por aria-describedby.' },
  },
  parameters: { docs: { description: { component: componentDescription('textarea', 'Entrada multilinha composta com label, helper, erro e contador opcional.') } } },
  render: (args) => textareaMarkup(args),
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-grid">${['sm', 'md', 'lg'].map((size) => labeledSample(size, textareaMarkup({ label: 'Mensagem', placeholder: 'Digite…', helper: '', value: '', size, state: 'default', required: false, maxLength: 200, showCounter: false }, size))).join('')}</div>` };
export const Estados = { render: () => `<div class="sb-story-grid">${states.map((state) => labeledSample(state, textareaMarkup({ label: 'Mensagem', placeholder: 'Digite…', helper: 'Máximo de 200 caracteres.', value: '', size: 'md', state, required: false, maxLength: 200, showCounter: false }, state))).join('')}</div>` };
export const ComContador = {
  render: () => `<div class="sb-story-grid">
    ${labeledSample('Dentro do limite', textareaMarkup({ label: 'Mensagem', placeholder: 'Digite…', helper: 'Máximo de 80 caracteres.', value: 'Conteúdo em revisão.', size: 'md', state: 'filled', required: false, maxLength: 80, showCounter: true }, 'counter-default'))}
    ${labeledSample('Limite excedido', textareaMarkup({ label: 'Mensagem', placeholder: 'Digite…', helper: 'Revise o conteúdo antes de continuar.', value: 'Este conteúdo deliberadamente ultrapassa o limite curto definido para demonstrar o estado visual do contador.', size: 'md', state: 'error', required: false, maxLength: 40, showCounter: true }, 'counter-over'))}
  </div>`,
  parameters: storyDescription('O contador é associado ao textarea; a segunda amostra demonstra explicitamente a validação over controlada pelo consumidor.'),
};
