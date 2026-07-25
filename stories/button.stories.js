import { componentDescription, escapeHtml, icon as renderIcon, labeledSample, storyDescription } from './helpers.js';

const variants = ['brand', 'toned', 'outline', 'ghost', 'success', 'danger'];
const sizes = ['sm', 'md', 'lg'];

function buttonMarkup({ label, variant, size, disabled, loading, fullWidth, icon, iconOnly }) {
  const classes = ['ds-button', `ds-button--${variant}`, `ds-button--${size}`];
  if (fullWidth) classes.push('ds-button--full');
  if (loading) classes.push('ds-button--loading');
  if (iconOnly) classes.push('ds-button--icon-only');
  const accessibleName = iconOnly ? ` aria-label="${escapeHtml(label)}"` : '';
  return `<button class="${classes.join(' ')}" type="button"${accessibleName}${disabled || loading ? ' disabled' : ''}${loading ? ' aria-busy="true"' : ''}>${icon ? renderIcon('check', 'ds-button__icon') : ''}${iconOnly ? '' : `<span class="ds-button__label">${escapeHtml(label)}</span>`}${loading ? '<span class="ds-button__spinner"><span class="ds-spinner ds-spinner--sm" aria-hidden="true"></span><span class="ds-sr-only">Carregando</span></span>' : ''}</button>`;
}

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  args: { label: 'Continuar', variant: 'brand', size: 'md', disabled: false, loading: false, fullWidth: false, icon: false, iconOnly: false },
  argTypes: {
    label: { control: 'text', description: 'Nome da ação; também nomeia icon-only.' },
    variant: { control: 'select', options: variants, description: 'Prioridade e intenção visual.' },
    size: { control: 'radio', options: sizes, description: 'Tamanho explícito, não breakpoint.' },
    disabled: { control: 'boolean', description: 'Usa atributo nativo disabled.' },
    loading: { control: 'boolean', description: 'Oculta conteúdo visual, mantém nome e anuncia carregamento.' },
    fullWidth: { control: 'boolean', description: 'Ocupa a largura oferecida pelo container.' },
    icon: { control: 'boolean', description: 'Exibe ícone leading decorativo.' },
    iconOnly: { control: 'boolean', description: 'Remove label visual e exige aria-label.' },
  },
  parameters: { docs: { description: { component: componentDescription('button', 'Ação ou navegação com variantes semânticas, tamanhos e estados nativos.') } } },
  render: buttonMarkup,
};

export const Playground = {};
export const Variantes = { render: () => `<div class="sb-story-row">${variants.map((variant) => buttonMarkup({ label: variant, variant, size: 'md' })).join('')}</div>` };
export const Tamanhos = { render: () => `<div class="sb-story-row sb-story-avatar-row">${sizes.map((size) => labeledSample(size, buttonMarkup({ label: 'Continuar', variant: 'brand', size }))).join('')}</div>` };
export const Estados = {
  render: () => `<div class="sb-story-row">${labeledSample('Default', buttonMarkup({ label: 'Salvar', variant: 'brand', size: 'md' }))}${labeledSample('Disabled', buttonMarkup({ label: 'Salvar', variant: 'brand', size: 'md', disabled: true }))}${labeledSample('Loading', buttonMarkup({ label: 'Salvando', variant: 'brand', size: 'md', loading: true }))}</div>`,
  parameters: storyDescription('Hover, focus-visible e active são exercitados diretamente nos buttons habilitados.'),
};
export const Icones = {
  render: () => `<div class="sb-story-row">${buttonMarkup({ label: 'Confirmar', variant: 'brand', size: 'md', icon: true })}${buttonMarkup({ label: 'Configurações', variant: 'outline', size: 'md', icon: true, iconOnly: true })}${buttonMarkup({ label: 'Configurações', variant: 'ghost', size: 'sm', icon: true, iconOnly: true })}</div>`,
};
