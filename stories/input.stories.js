import { componentDescription, escapeHtml, fieldMarkup, icon, labeledSample, storyDescription } from './helpers.js';

const states = ['default', 'filled', 'error', 'disabled', 'readonly'];

function inputMarkup(args, suffix = 'playground') {
  const { label, placeholder, helper, value, size, state, required, showLeadingIcon } = args;
  const id = `story-input-${suffix}`;
  const actualValue = state === 'filled' && !value ? 'usuario@empresa.com' : value;
  return fieldMarkup({
    id, label, required, helper: state === 'error' || state === 'disabled' ? '' : helper, error: state === 'error' ? 'Digite um e-mail válido.' : '',
    control: (describedBy) => `<div class="ds-input ds-input--${size}${state !== 'default' ? ` ds-input--${state}` : ''}">${showLeadingIcon ? icon('user', 'ds-input__icon') : ''}<input class="ds-input__field" id="${id}" type="email" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(actualValue)}"${describedBy ? ` aria-describedby="${describedBy}"` : ''}${required ? ' required aria-required="true"' : ''}${state === 'error' ? ' aria-invalid="true"' : ''}${state === 'disabled' ? ' disabled' : ''}${state === 'readonly' ? ' readonly' : ''}></div>`,
  });
}

export default {
  title: 'Components/Form/Input Text', tags: ['autodocs'],
  args: { label: 'E-mail', placeholder: 'nome@empresa.com', helper: 'Use seu e-mail corporativo.', value: '', size: 'md', state: 'default', required: true, showLeadingIcon: true },
  argTypes: {
    label: { control: 'text', description: 'Label visível.' }, placeholder: { control: 'text', description: 'Exemplo de formato, não substitui label.' }, helper: { control: 'text', description: 'Ajuda vinculada ao campo.' }, value: { control: 'text', description: 'Valor preenchido.' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' }, state: { control: 'select', options: states, description: 'Estado visual e nativo.' }, required: { control: 'boolean', description: 'Required visual e semântico.' }, showLeadingIcon: { control: 'boolean', description: 'Ícone leading decorativo.' },
  },
  parameters: { docs: { description: { component: componentDescription('input', 'Campo de texto nativo composto com Form Field pela anatomia pública.') } } },
  render: (args) => inputMarkup(args),
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-grid">${['sm', 'md', 'lg'].map((size) => labeledSample(size, inputMarkup({ label: 'E-mail', placeholder: 'nome@empresa.com', helper: '', value: '', size, state: 'default', required: false, showLeadingIcon: false }, size))).join('')}</div>` };
export const Estados = { render: () => `<div class="sb-story-grid">${states.map((state) => labeledSample(state, inputMarkup({ label: 'E-mail', placeholder: 'nome@empresa.com', helper: 'Use seu e-mail corporativo.', value: state === 'error' ? 'email-inválido' : state === 'default' ? '' : 'usuario@empresa.com', size: 'md', state, required: false, showLeadingIcon: false }, state))).join('')}</div>`, parameters: storyDescription('Hover e focus-within são exercitados nos campos editáveis; error, disabled e readonly preservam semântica nativa.') };
export const ComIcone = { args: { showLeadingIcon: true }, parameters: storyDescription('O ícone é decorativo e o nome acessível continua vindo do label.') };
