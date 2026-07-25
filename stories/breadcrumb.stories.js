import { componentDescription, escapeHtml, storyDescription } from './helpers.js';

function renderBreadcrumb({ items, currentIndex }) {
  return `<div class="sb-story-scroll"><nav class="ds-breadcrumb" aria-label="Breadcrumb">${items.map((item, index) => `${index ? '<span class="ds-breadcrumb__separator" aria-hidden="true">/</span>' : ''}${index === currentIndex ? `<span class="ds-breadcrumb__item ds-breadcrumb__item--current" aria-current="page">${escapeHtml(item)}</span>` : `<a href="#" class="ds-breadcrumb__item">${escapeHtml(item)}</a>`}`).join('')}</nav></div>`;
}

export default {
  title: 'Components/Breadcrumb',
  tags: ['autodocs'],
  args: { items: ['Início', 'Projetos', 'Design System'], currentIndex: 2 },
  argTypes: {
    items: { control: 'object', description: 'Rótulos ordenados do nível mais amplo ao atual.' },
    currentIndex: { control: { type: 'number', min: 0 }, description: 'Índice anunciado com aria-current=page.' },
  },
  parameters: { docs: { description: { component: componentDescription('breadcrumb', 'Trilha hierárquica com links anteriores e página atual anunciada por ARIA.') } } },
  render: renderBreadcrumb,
};

export const Playground = {};
export const HierarquiaProfunda = {
  args: { items: ['Início', 'Produtos', 'Design System', 'Componentes', 'Breadcrumb'], currentIndex: 4 },
  parameters: storyDescription('O consumidor decide redução ou overflow conforme o espaço; a ordem semântica é preservada.'),
};
export const DoisNiveis = { args: { items: ['Configurações', 'Segurança'], currentIndex: 1 } };
