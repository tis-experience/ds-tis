import { componentDescription, icon, labeledSample, storyDescription } from './helpers.js';

function pageItem(number, current) {
  return current ? `<li class="ds-pagination__item"><span class="ds-pagination__page ds-pagination__page--current" aria-current="page" aria-label="Página ${number}">${number}</span></li>` : `<li class="ds-pagination__item"><a class="ds-pagination__page" href="#" aria-label="Página ${number}">${number}</a></li>`;
}

function paginationMarkup({ size, currentPage, totalPages }) {
  const current = Math.min(Math.max(1, Number(currentPage)), Number(totalPages));
  const total = Math.max(1, Number(totalPages));
  const pages = [...new Set([1, current - 1, current, current + 1, total].filter((page) => page >= 1 && page <= total))].sort((a, b) => a - b);
  let previous = 0;
  const items = pages.map((page) => { const gap = page - previous > 1 ? '<li class="ds-pagination__item"><span class="ds-pagination__ellipsis" aria-hidden="true">…</span></li>' : ''; previous = page; return `${gap}${pageItem(page, page === current)}`; }).join('');
  const buttonSize = size === 'md' ? '' : ` ds-button--${size}`;
  return `<div class="sb-story-row sb-story-pagination-stage"><nav class="ds-pagination${size === 'md' ? '' : ` ds-pagination--${size}`}" aria-label="Paginação"><ul class="ds-pagination__list"><li class="ds-pagination__item"><button class="ds-button ds-button--ghost ds-button--icon-only${buttonSize}" type="button" aria-label="Página anterior"${current === 1 ? ' disabled aria-disabled="true"' : ''}>${icon('chevron-left')}</button></li>${items}<li class="ds-pagination__item"><button class="ds-button ds-button--ghost ds-button--icon-only${buttonSize}" type="button" aria-label="Próxima página"${current === total ? ' disabled aria-disabled="true"' : ''}>${icon('chevron-right')}</button></li></ul></nav></div>`;
}

export default {
  title: 'Compositions/Pagination', tags: ['autodocs'],
  args: { size: 'md', currentPage: 5, totalPages: 10 },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito dos itens.' }, currentPage: { control: { type: 'number', min: 1 }, description: 'Página atual anunciada por aria-current.' }, totalPages: { control: { type: 'number', min: 1 }, description: 'Total conhecido; o consumidor controla dados e URL.' },
  },
  parameters: { docs: { description: { component: componentDescription('pagination', 'Composição paginada cuja URL, dados e página atual permanecem no consumidor.') } } },
  render: paginationMarkup,
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-grid">${['sm', 'md', 'lg'].map((size) => labeledSample(size, paginationMarkup({ size, currentPage: 3, totalPages: 6 }))).join('')}</div>` };
export const Limites = { render: () => `<div class="sb-story-grid">${labeledSample('Primeira página', paginationMarkup({ size: 'md', currentPage: 1, totalPages: 10 }))}${labeledSample('Última página', paginationMarkup({ size: 'md', currentPage: 10, totalPages: 10 }))}</div>`, parameters: storyDescription('Previous/next usam disabled e aria-disabled nos limites; o item atual usa aria-current=page.') };
