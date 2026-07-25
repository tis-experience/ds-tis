import { componentDescription, escapeHtml, labeledSample, storyDescription } from './helpers.js';

function cardMarkup({ variant, title, description, interactive, selected, showMedia, forcedState = '' }) {
  const interactiveClasses = `ds-card ds-card--interactive${selected ? ' ds-card--selected' : ''}${forcedState ? ` ds-card--${forcedState}` : ''} sb-story-card`;
  const staticClasses = `ds-card ds-card--${variant} sb-story-card`;
  const open = interactive ? `<button type="button" class="${interactiveClasses}"${selected ? ' aria-pressed="true"' : ''}>` : `<article class="${staticClasses}">`;
  return `${open}${showMedia ? '<div class="ds-card__media" aria-hidden="true"><div class="sb-story-card-media"></div></div>' : ''}<div class="ds-card__container"><header class="ds-card__header"><h3 class="ds-card__title">${escapeHtml(title)}</h3><p class="ds-card__description">${escapeHtml(description)}</p></header><div class="ds-card__body"><p>Acompanhe entregas, participantes e próximas decisões em um só lugar.</p></div><footer class="ds-card__footer"><span class="ds-badge ds-badge--success ds-badge--subtle">Ativo</span></footer></div>${interactive ? '</button>' : '</article>'}`;
}

export default {
  title: 'Components/Card',
  tags: ['autodocs'],
  args: { variant: 'default', title: 'Resumo do projeto', description: 'Atualizado há poucos minutos', interactive: false, selected: false, showMedia: false },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'outlined', 'elevated'], description: 'Tratamento da superfície estática.' },
    title: { control: 'text', description: 'Título do conteúdo agrupado.' },
    description: { control: 'text', description: 'Metadado ou subtítulo curto.' },
    interactive: { control: 'boolean', description: 'Renderiza a anatomia sobre button nativo.' },
    selected: { control: 'boolean', description: 'Estado selected do card interativo.' },
    showMedia: { control: 'boolean', description: 'Exibe o slot full-bleed de media.' },
  },
  parameters: { docs: { description: { component: componentDescription('card', 'Superfície estática ou interativa para agrupar conteúdo e ações relacionadas.') } } },
  render: cardMarkup,
};

export const Playground = {};
export const Variantes = { render: () => `<div class="sb-story-grid">${['default', 'outlined', 'elevated'].map((variant) => labeledSample(variant, cardMarkup({ variant, title: 'Resumo do projeto', description: 'Atualizado hoje' }))).join('')}</div>` };
export const Estados = {
  render: () => `<div class="sb-story-grid">${labeledSample('Default', cardMarkup({ interactive: true, title: 'Interativo', description: 'Use Tab para focar' }))}${labeledSample('Hover', cardMarkup({ interactive: true, forcedState: 'hover', title: 'Hover', description: 'Representação visual' }))}${labeledSample('Focus', cardMarkup({ interactive: true, forcedState: 'focus', title: 'Focus', description: 'Focus ring dedicado' }))}${labeledSample('Selected', cardMarkup({ interactive: true, selected: true, title: 'Selecionado', description: 'Estado persistente' }))}</div>`,
  parameters: storyDescription('Cards interativos usam um único elemento interativo raiz; não coloque buttons ou links aninhados.'),
};
export const ComMedia = { args: { variant: 'elevated', showMedia: true }, parameters: storyDescription('O slot de media é full-bleed e o conteúdo permanece dentro de ds-card__container.') };
