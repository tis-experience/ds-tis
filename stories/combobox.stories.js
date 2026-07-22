import { componentDescription, escapeHtml, fieldMarkup, icon, labeledSample, storyDescription } from './helpers.js';

const states = ['default', 'filled', 'open', 'error', 'disabled', 'readonly'];

function comboboxMarkup(args, suffix = 'playground') {
  const { label, placeholder, helper, value, size, state, required, showLeadingIcon, showClearButton } = args;
  const id = `story-combobox-${suffix}`;
  const hasValue = Boolean(value) || ['filled', 'open', 'readonly'].includes(state);
  const inputValue = hasValue ? (value || 'Brasil') : '';
  const isOpen = state === 'open';
  const isError = state === 'error';
  const isDisabled = state === 'disabled';
  const isReadonly = state === 'readonly';
  const stateClasses = [state !== 'default' ? `ds-combobox--${state}` : '', hasValue && state !== 'filled' ? 'ds-combobox--filled' : ''].filter(Boolean).join(' ');
  return fieldMarkup({
    id, label, required, helper: isError ? '' : helper, error: isError ? 'Selecione um país válido.' : '',
    control: (describedBy) => `<div class="ds-combobox-anchor"><div class="ds-combobox ds-combobox--${size}${stateClasses ? ` ${stateClasses}` : ''}">${showLeadingIcon ? icon('search', 'ds-combobox__icon') : ''}<input class="ds-combobox__input" id="${id}" type="text" role="combobox" aria-expanded="${isOpen}" aria-controls="${id}-list" aria-autocomplete="list" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(inputValue)}"${describedBy ? ` aria-describedby="${describedBy}"` : ''}${required ? ' aria-required="true"' : ''}${isError ? ' aria-invalid="true"' : ''}${isDisabled ? ' disabled' : ''}${isReadonly ? ' readonly' : ''}>${showClearButton && hasValue && !isDisabled && !isReadonly ? `<button class="ds-combobox__clear" type="button" aria-label="Limpar seleção">${icon('x')}</button>` : ''}${icon('chevron-down', 'ds-combobox__chevron')}</div><ul class="ds-combobox__listbox" id="${id}-list" role="listbox" aria-label="Países"${isOpen ? '' : ' hidden'}><li class="ds-combobox__option" role="option">Argentina</li><li class="ds-combobox__option" role="option" aria-selected="${hasValue}">Brasil</li><li class="ds-combobox__option" role="option">Chile</li><li class="ds-combobox__option" role="option">Portugal</li></ul></div>`,
  });
}

export default {
  title: 'Components/Form/Combobox',
  tags: ['autodocs'],
  args: { label: 'País', placeholder: 'Busque um país', helper: 'Digite para filtrar as opções.', value: '', size: 'md', state: 'default', required: true, showLeadingIcon: true, showClearButton: true },
  argTypes: {
    label: { control: 'text', description: 'Label visível ligado ao input.' }, placeholder: { control: 'text', description: 'Orientação antes da seleção.' }, helper: { control: 'text', description: 'Ajuda associada via aria-describedby.' }, value: { control: 'text', description: 'Conteúdo preenchido.' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' }, state: { control: 'select', options: states, description: 'Estado visual e semântico.' }, required: { control: 'boolean', description: 'Indicador visual e aria-required.' },
    showLeadingIcon: { control: 'boolean', description: 'Ícone leading decorativo.' }, showClearButton: { control: 'boolean', description: 'Ação para limpar quando há valor editável.' },
  },
  parameters: { docs: { description: { component: componentDescription('combobox', 'Combobox filtrável com listbox, seleção e teclado mantidos pelo runtime público.') } } },
  render: (args) => comboboxMarkup(args),
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-grid">${['sm', 'md', 'lg'].map((size) => labeledSample(size, comboboxMarkup({ ...Playground.args, label: 'País', placeholder: 'Selecione…', helper: '', value: '', size, state: 'default', required: false, showLeadingIcon: true, showClearButton: false }, size))).join('')}</div>` };
export const Estados = {
  render: () => `<div class="sb-story-grid">${states.map((state) => labeledSample(state, comboboxMarkup({ label: 'País', placeholder: 'Selecione…', helper: 'Digite para filtrar.', value: state === 'default' || state === 'error' || state === 'disabled' ? '' : 'Brasil', size: 'md', state, required: false, showLeadingIcon: true, showClearButton: true }, state))).join('')}</div>`,
  parameters: storyDescription('Open usa aria-expanded=true e listbox visível; readonly preserva o valor sem edição; disabled usa atributo nativo.'),
};
