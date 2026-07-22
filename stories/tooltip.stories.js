import { componentDescription, escapeHtml, icon, labeledSample, storyDescription } from './helpers.js';

function tooltipMarkup({ content, position, id = 'story-tooltip', open = false, iconName = 'settings', label = 'Configurações' }) {
  return `<div class="ds-tooltip ds-tooltip--${position}"${open ? ' data-open="true"' : ''}><button class="ds-button ds-button--ghost ds-button--icon-only" type="button" aria-label="${escapeHtml(label)}" aria-describedby="${id}">${icon(iconName, 'ds-button__icon')}</button><span class="ds-tooltip__content" id="${id}" role="tooltip">${escapeHtml(content)}</span></div>`;
}

export default {
  title: 'Components/Tooltip', tags: ['autodocs'],
  args: { content: 'Editar projeto', position: 'top' },
  argTypes: { content: { control: 'text', description: 'Descrição breve, não essencial.' }, position: { control: 'radio', options: ['top', 'right', 'bottom', 'left'], description: 'Posição preferencial relativa ao trigger.' } },
  parameters: { docs: { description: { component: componentDescription('tooltip', 'Descrição breve exibida em hover e focus, dismissível por Escape e hoverable.') } } },
  render: (args) => `<div class="sb-story-tooltip-stage">${tooltipMarkup(args)}</div>`,
};

export const Playground = { parameters: storyDescription('Passe o pointer ou foque o button; pressione Escape para fechar.') };
export const Posicoes = { render: () => `<div class="sb-story-grid sb-story-tooltip-matrix">${['top', 'right', 'bottom', 'left'].map((position) => labeledSample(position, tooltipMarkup({ content: position, position, id: `tooltip-${position}`, open: true, label: `Tooltip ${position}` }))).join('')}</div>`, parameters: storyDescription('A matriz mantém data-open=true somente para documentação visual das quatro posições.') };
export const ComIcones = { render: () => `<div class="sb-story-row sb-story-tooltip-stage">${tooltipMarkup({ content: 'Configurações', position: 'top', id: 'tooltip-settings', iconName: 'settings', label: 'Configurações' })}${tooltipMarkup({ content: 'Excluir projeto', position: 'top', id: 'tooltip-delete', iconName: 'trash', label: 'Excluir projeto' })}${tooltipMarkup({ content: 'Informações', position: 'top', id: 'tooltip-info', iconName: 'info', label: 'Informações' })}</div>` };
