import { componentDescription, escapeHtml, labeledSample, storyDescription } from './helpers.js';

function spinnerMarkup({ size, onColor, label }) {
  return `<span class="ds-spinner ds-spinner--${size}${onColor ? ' ds-spinner--on-color' : ''}" role="status"><span class="ds-sr-only">${escapeHtml(label)}</span></span>`;
}

export default {
  title: 'Components/Spinner', tags: ['autodocs'],
  args: { size: 'md', onColor: false, label: 'Carregando' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Tamanho explícito.' }, onColor: { control: 'boolean', description: 'Contraste para fundos coloridos.' }, label: { control: 'text', description: 'Mensagem somente para tecnologia assistiva.' },
  },
  parameters: { docs: { description: { component: componentDescription('spinner', 'Indicador indeterminado com status textual acessível.') } } },
  render: spinnerMarkup,
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-row">${['sm', 'md', 'lg'].map((size) => labeledSample(size, spinnerMarkup({ size, label: 'Carregando' }))).join('')}</div>` };
export const Estilos = { render: () => `<div class="sb-story-row">${labeledSample('Default', spinnerMarkup({ size: 'md', label: 'Carregando' }))}<div class="sb-story-sample sb-story-on-color"><span class="sb-story-sample__label">On color</span>${spinnerMarkup({ size: 'md', onColor: true, label: 'Carregando' })}</div></div>` };
export const NoButton = { render: () => '<button class="ds-button ds-button--brand ds-button--loading" type="button" disabled aria-busy="true"><span class="ds-button__label">Salvando</span><span class="ds-button__spinner"><span class="ds-spinner ds-spinner--sm ds-spinner--on-color" aria-hidden="true"></span><span class="ds-sr-only">Salvando</span></span></button>', parameters: storyDescription('Em Button loading, o spinner é decorativo e o nome da operação permanece disponível.') };
