import { componentDescription, escapeHtml, labeledSample, storyDescription } from './helpers.js';

function toggleMarkup({ label, description, checked, disabled, size }) {
  const sizeClass = size === 'md' ? '' : ` ds-toggle--${size}`;
  return `<label class="ds-toggle-label"><input type="checkbox" class="ds-toggle${sizeClass}" role="switch"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}><span class="ds-toggle__content"><span class="ds-toggle__label">${escapeHtml(label)}</span>${description ? `<span class="ds-toggle__description">${escapeHtml(description)}</span>` : ''}</span></label>`;
}

export default {
  title: 'Components/Form/Toggle', tags: ['autodocs'],
  args: { label: 'Notificações', description: 'Receba atualizações importantes.', checked: true, disabled: false, size: 'md' },
  argTypes: {
    label: { control: 'text', description: 'Nome da configuração.' }, description: { control: 'text', description: 'Consequência ou contexto da configuração.' }, checked: { control: 'boolean', description: 'Estado on/off anunciado pelo role switch.' }, disabled: { control: 'boolean', description: 'Estado nativo disabled.' }, size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' },
  },
  parameters: { docs: { description: { component: componentDescription('toggle', 'Alterna imediatamente uma configuração binária com input nativo e role switch.') } } },
  render: toggleMarkup,
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-grid">${['sm', 'md', 'lg'].map((size) => labeledSample(size, toggleMarkup({ label: 'Notificações', description: '', checked: true, disabled: false, size }))).join('')}</div>` };
export const Estados = { render: () => `<div class="sb-story-grid">${labeledSample('Off', toggleMarkup({ label: 'Desativado', description: '', checked: false, size: 'md' }))}${labeledSample('On', toggleMarkup({ label: 'Ativado', description: '', checked: true, size: 'md' }))}${labeledSample('Off disabled', toggleMarkup({ label: 'Indisponível', description: '', checked: false, disabled: true, size: 'md' }))}${labeledSample('On disabled', toggleMarkup({ label: 'Ativo e indisponível', description: '', checked: true, disabled: true, size: 'md' }))}</div>`, parameters: storyDescription('Hover e focus-visible podem ser exercitados nos switches habilitados.') };
export const ComDescricao = { args: { description: 'Receba alertas de segurança e atualizações do projeto.' } };
