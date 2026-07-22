import { componentDescription, escapeHtml, icon, storyDescription } from './helpers.js';

function modalMarkup({ size, title, description, id = 'story-modal', customBody = false }) {
  return `<button class="ds-button ds-button--${size === 'sm' ? 'danger' : 'outline'}" type="button" data-ds-modal-open="${id}"><span class="ds-button__label">Abrir modal ${size}</span></button><div class="ds-modal-overlay" id="${id}" hidden><div class="ds-modal ds-modal--${size}" role="dialog" aria-modal="true" aria-labelledby="${id}-title" aria-describedby="${id}-description"><header class="ds-modal__header"><div class="ds-modal__heading"><h2 class="ds-modal__title" id="${id}-title">${escapeHtml(title)}</h2><p class="ds-modal__description" id="${id}-description">${escapeHtml(description)}</p></div><button class="ds-modal__close" type="button" aria-label="Fechar modal">${icon('x')}</button></header><div class="ds-modal__body">${customBody ? '<div class="ds-field"><label class="ds-field__label" for="modal-email">E-mail</label><div class="ds-input"><input class="ds-input__field" id="modal-email" type="email" placeholder="nome@empresa.com"></div><p class="ds-field__helper">Enviaremos um convite para este endereço.</p></div>' : '<p>O projeto e seus dados associados serão removidos permanentemente.</p>'}</div><footer class="ds-modal__footer"><button class="ds-button ds-button--outline" type="button" data-ds-modal-close><span class="ds-button__label">Cancelar</span></button><button class="ds-button ds-button--danger" type="button"><span class="ds-button__label">Confirmar</span></button></footer></div></div>`;
}

export default {
  title: 'Components/Modal', tags: ['autodocs'],
  args: { size: 'sm', title: 'Excluir projeto', description: 'Esta ação não pode ser desfeita.' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Largura máxima e escala interna.' }, title: { control: 'text', description: 'Título referenciado por aria-labelledby.' }, description: { control: 'text', description: 'Descrição referenciada por aria-describedby.' },
  },
  parameters: { docs: { description: { component: componentDescription('modal', 'Diálogo modal com focus trap, Escape, inert e retorno de foco mantidos pelo runtime.') } } },
  render: modalMarkup,
};

export const Playground = {};
export const Tamanhos = { render: () => `<div class="sb-story-row">${['sm', 'md', 'lg'].map((size) => modalMarkup({ size, title: `Modal ${size}`, description: 'Abra para comparar largura e escala.', id: `story-modal-${size}` })).join('')}</div>`, parameters: storyDescription('Cada trigger abre um dialog completo e independente nos tamanhos sm, md e lg.') };
export const CorpoCustomizado = { render: (args) => modalMarkup({ ...args, id: 'story-modal-custom', customBody: true }), parameters: storyDescription('Slots de body compõem Form Field e Input reais do DS; footer usa Buttons públicos.') };
