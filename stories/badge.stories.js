import { componentDescription, escapeHtml, labeledSample, storyDescription } from './helpers.js';

const tones = ['brand', 'neutral', 'info', 'success', 'warning', 'error'];
const styles = ['subtle', 'solid'];
const renderBadge = ({ label, tone, style }) => `<span class="ds-badge ds-badge--${tone} ds-badge--${style}">${escapeHtml(label)}</span>`;

export default {
  title: 'Components/Badge',
  tags: ['autodocs'],
  args: { label: 'Em revisão', tone: 'brand', style: 'subtle' },
  argTypes: {
    label: { control: 'text', description: 'Texto curto do status ou metadado.' },
    tone: { control: 'select', options: tones, description: 'Intenção semântica.' },
    style: { control: 'radio', options: styles, description: 'Ênfase subtle ou solid.' },
  },
  parameters: { docs: { description: { component: componentDescription('badge', 'Rótulo curto para status, categoria ou metadado não interativo.') } } },
  render: renderBadge,
};

export const Playground = {};
export const Variantes = {
  render: () => `<div class="sb-story-grid">${styles.flatMap((style) => tones.map((tone) => labeledSample(`${tone} · ${style}`, renderBadge({ label: tone, tone, style })))).join('')}</div>`,
  parameters: storyDescription('Matriz completa de tons e estilos. Badge permanece texto não interativo.'),
};
