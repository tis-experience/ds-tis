import { componentDescription, escapeHtml, icon, labeledSample, storyDescription } from './helpers.js';

const tones = ['info', 'success', 'warning', 'error'];
const styles = ['subtle', 'filled'];

function renderAlert({ tone, style, title, description, dismissible }) {
  return `<div class="ds-alert ds-alert--${tone} ds-alert--${style}" role="${tone === 'error' ? 'alert' : 'status'}">${icon(tone === 'success' ? 'check' : 'info', 'ds-alert__icon')}<div class="ds-alert__content"><strong class="ds-alert__title">${escapeHtml(title)}</strong><p class="ds-alert__description">${escapeHtml(description)}</p></div>${dismissible ? `<button class="ds-alert__close" type="button" aria-label="Fechar alerta">${icon('x')}</button>` : ''}</div>`;
}

export default {
  title: 'Components/Alert',
  tags: ['autodocs'],
  args: { tone: 'info', style: 'subtle', title: 'Atualização disponível', description: 'Uma nova versão pode ser instalada agora.', dismissible: true },
  argTypes: {
    tone: { control: 'select', options: tones, description: 'Intenção semântica da mensagem.' },
    style: { control: 'radio', options: styles, description: 'Tratamento visual subtle ou filled.' },
    title: { control: 'text', description: 'Resumo curto e acionável.' },
    description: { control: 'text', description: 'Contexto complementar da mensagem.' },
    dismissible: { control: 'boolean', description: 'Exibe o button de fechar; o consumidor implementa a remoção.' },
  },
  parameters: { docs: { description: { component: componentDescription('alert', 'Mensagem contextual de feedback com título, descrição e fechamento opcional.') } } },
  render: renderAlert,
};

export const Playground = {};

export const Variantes = {
  render: () => `<div class="sb-story-grid">${styles.flatMap((style) => tones.map((tone) => labeledSample(`${tone} · ${style}`, renderAlert({ tone, style, title: tone === 'error' ? 'Não foi possível salvar' : 'Estado atualizado', description: 'Mensagem curta com orientação objetiva.', dismissible: false })))).join('')}</div>`,
  parameters: storyDescription('Matriz completa de tons e estilos. Error usa live region assertiva; os demais usam status.'),
};

export const Dispensavel = {
  args: { dismissible: true },
  parameters: storyDescription('O button de fechar precisa de nome acessível; a lógica de remoção pertence ao consumidor.'),
};
