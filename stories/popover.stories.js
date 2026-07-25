import { componentDescription, escapeHtml, icon, labeledSample, storyDescription } from './helpers.js';

function popoverMarkup({
  placement,
  title,
  description,
  showSlot,
  showActions,
  id = 'story-popover',
  open = false,
}) {
  const actions = showActions
    ? '<div class="ds-popover__actions"><button class="ds-button ds-button--outline ds-button--sm" type="button" data-ds-popover-close><span class="ds-button__label">Cancelar</span></button><button class="ds-button ds-button--primary ds-button--sm" type="button"><span class="ds-button__label">Salvar</span></button></div>'
    : '';
  const slot = showSlot
    ? '<div class="ds-popover__content"><div class="ds-field"><label class="ds-field__label" for="popover-name">Nome</label><div class="ds-input"><input class="ds-input__field" id="popover-name" type="text" value="Relatorio mensal"></div></div></div>'
    : '';

  return `<div class="ds-popover ds-popover--${placement}"${open ? ' data-open="true"' : ''}><button class="ds-button ds-button--outline ds-button--sm ds-popover__trigger" type="button"><span class="ds-button__label">Abrir popover</span></button><div class="ds-popover__panel" id="${id}" role="dialog" aria-labelledby="${id}-title"${open ? '' : ' hidden'}><div class="ds-popover__header"><h3 class="ds-popover__title" id="${id}-title">${escapeHtml(title)}</h3></div><button class="ds-popover__close" type="button" aria-label="Fechar popover">${icon('x')}</button><div class="ds-popover__body"><p>${escapeHtml(description)}</p>${slot}</div>${actions}</div></div>`;
}

export default {
  title: 'Components/Popover',
  tags: ['autodocs'],
  args: {
    placement: 'bottom',
    title: 'Renomear item',
    description: 'Aplique uma alteração curta sem sair do contexto atual.',
    showSlot: true,
    showActions: true,
  },
  argTypes: {
    placement: { control: 'radio', options: ['bottom', 'top', 'left', 'right'], description: 'Posição preferencial relativa ao trigger.' },
    title: { control: 'text', description: 'Título referenciado por aria-labelledby.' },
    description: { control: 'text', description: 'Conteúdo textual curto do body.' },
    showSlot: { control: 'boolean', description: 'Exibe slot opcional sem substituir os actions.' },
    showActions: { control: 'boolean', description: 'Exibe actions substituíveis ou permite ocultá-los.' },
  },
  parameters: { docs: { description: { component: componentDescription('popover', 'Dialog contextual não modal com trigger, painel, close absoluto, content slot opcional, actions e Arrow.') } } },
  render: (args) => `<div class="sb-story-popover-stage">${popoverMarkup(args)}</div>`,
};

export const Playground = { parameters: storyDescription('Clique no trigger; Escape, click externo e retorno de foco são mantidos pelo runtime.') };
export const Posicoes = {
  render: () => `<div class="sb-story-grid sb-story-popover-matrix">${['bottom', 'top', 'left', 'right'].map((placement) => labeledSample(placement, popoverMarkup({ placement, title: `Popover ${placement}`, description: 'Abra para comparar Arrow e alinhamento.', showSlot: false, showActions: true, id: `popover-${placement}`, open: false }))).join('')}</div>`,
  parameters: storyDescription('Matriz de triggers para exercitar as quatro posições pelo runtime sem forçar overflow em viewports estreitos.'),
};
export const ComSlot = {
  render: (args) => `<div class="sb-story-popover-stage">${popoverMarkup({ ...args, showSlot: true, showActions: true, id: 'popover-slot', open: true })}</div>`,
  parameters: storyDescription('O slot é uma opção adicional ao conteúdo e aos actions, não substitui os buttons.'),
};
export const SemActions = {
  render: (args) => `<div class="sb-story-popover-stage">${popoverMarkup({ ...args, showSlot: false, showActions: false, id: 'popover-no-actions', open: true })}</div>`,
  parameters: storyDescription('Actions podem ser ocultados; close permanece fixo e proporcional.'),
};
