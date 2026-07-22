import { componentDescription, escapeHtml, labeledSample, storyDescription } from './helpers.js';

function radioMarkup({ label, size, selected, disabled, name = 'story-radio' }) {
  const sizeClass = size === 'md' ? '' : ` ds-radio--${size}`;
  return `<label class="ds-radio-label"><input type="radio" class="ds-radio${sizeClass}" name="${name}"${selected ? ' checked' : ''}${disabled ? ' disabled' : ''}><span class="ds-radio__content"><span class="ds-radio__label">${escapeHtml(label)}</span></span></label>`;
}

export default {
  title: 'Components/Form/Radio', tags: ['autodocs'],
  args: { label: 'E-mail', size: 'md', selected: true, disabled: false, error: false },
  argTypes: {
    label: { control: 'text', description: 'Texto da opção e target de clique.' }, size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' }, selected: { control: 'boolean', description: 'Estado checked nativo.' }, disabled: { control: 'boolean', description: 'Estado disabled nativo.' }, error: { control: 'boolean', description: 'Aplica erro no fieldset do grupo.' },
  },
  parameters: { docs: { description: { component: componentDescription('radio', 'Escolha exclusiva em fieldset identificado por legend.') } } },
  render: (args) => `<fieldset class="ds-radio-group${args.error ? ' ds-radio-group--error' : ''}"${args.error ? ' aria-describedby="story-radio-error"' : ''}><legend class="ds-radio-group__legend">Preferência de contato</legend>${radioMarkup(args)}${radioMarkup({ ...args, label: 'SMS', selected: false, name: 'story-radio' })}${args.error ? '<span class="ds-radio-group__error" id="story-radio-error">Selecione uma opção.</span>' : ''}</fieldset>`,
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-row">${['sm', 'md', 'lg'].map((size) => labeledSample(size, radioMarkup({ label: size, size, selected: true, name: `radio-${size}` }))).join('')}</div>` };
export const Estados = { render: () => `<div class="sb-story-grid">${labeledSample('Unchecked', radioMarkup({ label: 'Não selecionado', size: 'md', selected: false, name: 'radio-a' }))}${labeledSample('Checked', radioMarkup({ label: 'Selecionado', size: 'md', selected: true, name: 'radio-b' }))}${labeledSample('Disabled', radioMarkup({ label: 'Indisponível', size: 'md', selected: false, disabled: true, name: 'radio-c' }))}${labeledSample('Checked disabled', radioMarkup({ label: 'Selecionado indisponível', size: 'md', selected: true, disabled: true, name: 'radio-d' }))}</div>`, parameters: storyDescription('Hover e focus-visible podem ser exercitados nas opções habilitadas.') };
export const GrupoComErro = { args: { error: true, selected: false }, parameters: storyDescription('Erro pertence ao grupo e é associado ao fieldset por aria-describedby.') };
