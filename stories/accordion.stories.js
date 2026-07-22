import { componentDescription, escapeHtml, icon, storyDescription } from './helpers.js';

function accordionItem({ id, title, content, open = false, disabled = false, showLeadingIcon = true }) {
  return `<div class="ds-accordion__item${disabled ? ' ds-accordion__item--disabled' : ''}" data-state="${open ? 'open' : 'closed'}"${disabled ? ' aria-disabled="true"' : ''}><button class="ds-accordion__trigger" type="button" id="${id}-trigger" aria-expanded="${open}" aria-controls="${id}-panel"${disabled ? ' disabled' : ''}>${showLeadingIcon ? icon('settings', 'ds-accordion__leading-icon') : ''}<span class="ds-accordion__title">${escapeHtml(title)}</span>${icon('chevron-down', 'ds-accordion__chevron')}</button><div class="ds-accordion__panel" id="${id}-panel" role="region" aria-labelledby="${id}-trigger"${open ? '' : ' hidden'}>${content}</div></div>`;
}

function renderAccordion({ mode, showLeadingIcon, disabled }) {
  return `<div class="ds-accordion" data-accordion-mode="${mode}">${accordionItem({ id: 'story-billing', title: 'Faturamento', content: '<p>Gerencie forma de pagamento e dados fiscais.</p>', open: true, showLeadingIcon })}${accordionItem({ id: 'story-security', title: 'Segurança', content: '<p>Configure autenticação e sessões ativas.</p>', showLeadingIcon })}${accordionItem({ id: 'story-disabled', title: 'Configuração bloqueada', content: '<p>Este conteúdo não está disponível.</p>', disabled, showLeadingIcon })}</div>`;
}

export default {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  args: { mode: 'single', showLeadingIcon: true, disabled: true },
  argTypes: {
    mode: { control: 'radio', options: ['single', 'multiple'], description: 'Define se um ou vários itens podem permanecer abertos.' },
    showLeadingIcon: { control: 'boolean', description: 'Exibe o ícone leading opcional em cada trigger.' },
    disabled: { control: 'boolean', description: 'Desabilita o último item e o remove da interação.' },
  },
  parameters: {
    docs: { description: { component: componentDescription('accordion', 'Seções expansíveis com teclado, modo single/multiple e lifecycle público.') } },
  },
  render: renderAccordion,
};

export const Playground = {
  parameters: storyDescription('Use os triggers para validar mouse, Enter/Space e navegação por setas.'),
};

export const ConteudoCustomizado = {
  args: { mode: 'multiple', disabled: false },
  render: ({ mode, showLeadingIcon }) => `<div class="ds-accordion" data-accordion-mode="${mode}">${accordionItem({ id: 'story-team', title: 'Team Pro', open: true, showLeadingIcon, content: '<div class="sb-story-row"><span class="ds-badge ds-badge--brand ds-badge--subtle">12 membros</span><button class="ds-button ds-button--outline ds-button--sm" type="button"><span class="ds-button__label">Gerenciar equipe</span></button></div>' })}${accordionItem({ id: 'story-limits', title: 'Limites do plano', showLeadingIcon, content: '<p>Consulte armazenamento, automações e histórico.</p>' })}</div>`,
  parameters: storyDescription('O painel aceita composição com componentes públicos do DS; o trigger preserva sua anatomia.'),
};

export const Disabled = {
  args: { disabled: true },
  parameters: storyDescription('O item desabilitado usa atributo nativo disabled e aria-disabled no item.'),
};
