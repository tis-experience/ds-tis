import { componentDescription, escapeHtml, icon, labeledSample, storyDescription } from './helpers.js';

const iconByType = {
  success: 'circle-check',
  warning: 'triangle-alert',
  error: 'circle-alert',
  info: 'info',
};

function toastMarkup({
  type,
  style,
  title,
  description,
  showAction,
}) {
  const action = showAction
    ? '<div class="ds-toast__actions"><button class="ds-button ds-button--ghost ds-button--sm" type="button"><span class="ds-button__label">Desfazer</span></button></div>'
    : '';

  return `<div class="ds-toast ds-toast--${type} ds-toast--${style}" data-ds-toast><span class="ds-toast__icon" aria-hidden="true">${icon(iconByType[type], 'ds-icon')}</span><div class="ds-toast__content"><p class="ds-toast__title">${escapeHtml(title)}</p><p class="ds-toast__description">${escapeHtml(description)}</p>${action}</div><button type="button" class="ds-toast__close" aria-label="Dispensar">${icon('x')}</button></div>`;
}

export default {
  title: 'Components/Toast',
  tags: ['autodocs'],
  args: {
    type: 'success',
    style: 'subtle',
    title: 'Alterações salvas',
    description: 'Seu rascunho foi atualizado.',
    showAction: true,
  },
  argTypes: {
    type: { control: 'radio', options: ['info', 'success', 'warning', 'error'], description: 'Prioridade visual e live region do feedback.' },
    style: { control: 'radio', options: ['subtle', 'solid'], description: 'Tratamento visual publicado no Figma.' },
    title: { control: 'text', description: 'Mensagem principal obrigatória.' },
    description: { control: 'text', description: 'Complemento opcional da mensagem.' },
    showAction: { control: 'boolean', description: 'Exibe action curta sem mover foco automaticamente.' },
  },
  parameters: { docs: { description: { component: componentDescription('toast', 'Feedback temporário com live region, fila, timer pausável, actions e dismiss.') } } },
  render: (args) => `<div class="sb-story-toast-stage">${toastMarkup(args)}</div>`,
};

export const Playground = { parameters: storyDescription('A story mostra a anatomia; o runtime público também oferece showToast e dismissToast para uso em app.') };
export const Variantes = {
  render: () => `<div class="sb-story-stack">${['info', 'success', 'warning', 'error'].map((type) => toastMarkup({ type, style: 'subtle', title: `Toast ${type}`, description: 'Mensagem curta com prioridade acessível.', showAction: false })).join('')}${['info', 'success', 'warning', 'error'].map((type) => toastMarkup({ type, style: 'solid', title: `Toast ${type} solid`, description: 'Tratamento solid para feedback de maior destaque.', showAction: false })).join('')}</div>`,
  parameters: storyDescription('Cobre tipos info, success, warning e error nos estilos subtle e solid.'),
};
export const ComAction = {
  render: (args) => `<div class="sb-story-toast-stage">${toastMarkup({ ...args, showAction: true })}</div>`,
  parameters: storyDescription('Actions permanecem dentro do conteúdo e o timer respeita duração mínima quando há action.'),
};
export const Regiao = {
  render: () => `<div class="ds-toast-region" data-ds-toast-region><div class="ds-toast-region__polite" role="status" aria-live="polite" aria-relevant="additions">${toastMarkup({ type: 'success', style: 'subtle', title: 'Importação concluída', description: '18 registros foram adicionados.', showAction: true })}</div><div class="ds-toast-region__assertive" role="alert" aria-live="assertive" aria-relevant="additions"></div></div>`,
  parameters: storyDescription('Demonstra a região pública que separa mensagens polite e assertive.'),
};
