import { componentDescription, escapeHtml, fieldMarkup, icon, labeledSample, storyDescription } from './helpers.js';

const states = ['default', 'filled', 'error', 'disabled', 'readonly'];

function selectMarkup(args, suffix = 'playground') {
  const { label, helper, value, size, state, required, showLeadingIcon } = args;
  const id = `story-select-${suffix}`;
  const selectedValue = value || (state === 'filled' || state === 'readonly' ? 'Brasil' : '');
  return fieldMarkup({
    id, label, required, helper: ['error', 'disabled', 'readonly'].includes(state) ? '' : helper, error: state === 'error' ? 'Selecione uma opção.' : '',
    control: (describedBy) => `<div class="ds-select ds-select--${size}${state !== 'default' ? ` ds-select--${state}` : ''}">${showLeadingIcon ? icon('circle', 'ds-select__icon') : ''}<select class="ds-select__field" id="${id}"${describedBy ? ` aria-describedby="${describedBy}"` : ''}${required ? ' required aria-required="true"' : ''}${state === 'error' ? ' aria-invalid="true"' : ''}${state === 'disabled' || state === 'readonly' ? ' disabled' : ''}><option value=""${selectedValue ? '' : ' selected'}>Selecione…</option>${['Brasil', 'Chile', 'Portugal'].map((option) => `<option${selectedValue === option ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select><span class="ds-select__arrow" aria-hidden="true"></span></div>`,
  });
}

export default {
  title: 'Components/Form/Select', tags: ['autodocs'],
  args: { label: 'País', helper: 'Selecione seu país de residência.', value: '', size: 'md', state: 'default', required: true, showLeadingIcon: false },
  argTypes: {
    label: { control: 'text', description: 'Label ligado ao select.' }, helper: { control: 'text', description: 'Ajuda associada.' }, value: { control: 'select', options: ['', 'Brasil', 'Chile', 'Portugal'], description: 'Opção selecionada.' }, size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' }, state: { control: 'select', options: states, description: 'Estado visual e nativo.' }, required: { control: 'boolean', description: 'Required visual e semântico.' }, showLeadingIcon: { control: 'boolean', description: 'Ícone leading decorativo.' },
  },
  parameters: { docs: { description: { component: componentDescription('select', 'Seleção nativa de uma opção, composta com Form Field.') } } },
  render: (args) => selectMarkup(args),
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-grid">${['sm', 'md', 'lg'].map((size) => labeledSample(size, selectMarkup({ label: 'País', helper: '', value: '', size, state: 'default', required: false, showLeadingIcon: false }, size))).join('')}</div>` };
export const Estados = { render: () => `<div class="sb-story-grid">${states.map((state) => labeledSample(state, selectMarkup({ label: 'País', helper: 'Selecione seu país.', value: state === 'default' || state === 'error' || state === 'disabled' ? '' : 'Brasil', size: 'md', state, required: false, showLeadingIcon: false }, state))).join('')}</div>`, parameters: storyDescription('Select nativo não possui readonly; a representação combina disabled com ds-select--readonly, conforme a documentação canônica.') };
export const ComIcone = { args: { showLeadingIcon: true, value: 'Brasil', state: 'filled' } };
