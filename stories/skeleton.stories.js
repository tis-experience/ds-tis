import { componentDescription, labeledSample, storyDescription } from './helpers.js';

function skeletonMarkup({ type }) {
  return `<span class="ds-skeleton ds-skeleton--${type}" aria-hidden="true"></span>`;
}

function skeletonCard(announced = true) {
  return `<div class="sb-story-skeleton-card"${announced ? ' role="status" aria-label="Carregando conteúdo"' : ' aria-hidden="true"'}>${skeletonMarkup({ type: 'circle' })}<span class="sb-story-skeleton-lines">${skeletonMarkup({ type: 'text' })}${skeletonMarkup({ type: 'text' })}</span>${skeletonMarkup({ type: 'rectangle' })}</div>`;
}

export default {
  title: 'Components/Skeleton', tags: ['autodocs'],
  args: { type: 'text' },
  argTypes: { type: { control: 'radio', options: ['text', 'circle', 'rectangle'], description: 'Forma que aproxima o conteúdo futuro.' } },
  parameters: { docs: { description: { component: componentDescription('skeleton', 'Placeholder visual para conteúdo previsível ainda em carregamento.') } } },
  render: (args) => `<div class="sb-story-skeleton-standalone" role="status" aria-label="Carregando conteúdo">${skeletonMarkup(args)}</div>`,
};

export const Playground = {};
export const Tipos = { render: () => `<div class="sb-story-grid">${['text', 'circle', 'rectangle'].map((type) => labeledSample(type, skeletonMarkup({ type }))).join('')}</div>` };
export const Card = { render: skeletonCard, parameters: storyDescription('A região comunica aria-busy; shapes individuais são decorativos.') };
export const Lista = { render: () => `<div class="sb-story-stack" role="status" aria-label="Carregando lista">${skeletonCard(false)}${skeletonCard(false)}${skeletonCard(false)}</div>` };
