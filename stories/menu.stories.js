import { componentDescription, icon, labeledSample, storyDescription } from './helpers.js';

function menuMarkup({ size, fullWidth, selection, disabledItem, activeItem = false }) {
  const classes = ['ds-menu'];
  if (size !== 'md') classes.push(`ds-menu--${size}`);
  if (fullWidth) classes.push('ds-menu--full');
  return `<div class="${classes.join(' ')}" role="menu" aria-label="Densidade de visualização"><button class="ds-menu__item" role="menuitemradio" aria-checked="${selection === 'comfortable'}" type="button"${activeItem ? ' data-active="true"' : ''}>${icon('check', 'ds-menu__check')}<span class="ds-menu__item-label">Confortável</span><span class="ds-menu__shortcut">⌘1</span></button><button class="ds-menu__item" role="menuitemradio" aria-checked="${selection === 'compact'}" type="button">${icon('check', 'ds-menu__check')}<span class="ds-menu__item-label">Compacta</span><span class="ds-menu__shortcut">⌘2</span></button><button class="ds-menu__item" role="menuitem" type="button"${disabledItem ? ' aria-disabled="true"' : ''}>${icon('settings', 'ds-menu__icon')}<span class="ds-menu__item-label">Configurações</span></button><div class="ds-menu__separator" role="separator"></div><button class="ds-menu__item ds-menu__item--destructive" role="menuitem" type="button">${icon('trash', 'ds-menu__icon')}<span class="ds-menu__item-label">Excluir visualização</span></button></div>`;
}

export default {
  title: 'Components/Menu', tags: ['autodocs'],
  args: { size: 'md', fullWidth: false, selection: 'comfortable', disabledItem: true },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Densidade explícita dos itens.' }, fullWidth: { control: 'boolean', description: 'Ocupa a largura do container consumidor.' }, selection: { control: 'radio', options: ['none', 'comfortable', 'compact'], description: 'Estado aria-checked de itens radio.' }, disabledItem: { control: 'boolean', description: 'Demonstra item com aria-disabled.' },
  },
  parameters: { docs: { description: { component: componentDescription('menu', 'Lista de ações ou escolhas; Action Menu adiciona trigger, overlay e teclado.') } } },
  render: menuMarkup,
};

export const Playground = {};
export const Estados = {
  render: () => `<div class="sb-story-grid">${labeledSample('Default + selected', menuMarkup({ size: 'md', selection: 'comfortable', disabledItem: false }))}${labeledSample('Active + disabled + destructive', menuMarkup({ size: 'md', selection: 'none', disabledItem: true, activeItem: true }))}</div>`,
  parameters: storyDescription('Inclui item default, active, selected, disabled e destructive; focus-visible pode ser exercitado por teclado.'),
};
export const ActionMenu = {
  render: () => `<div class="sb-story-row sb-story-menu-stage"><div class="ds-action-menu"><button class="ds-button ds-button--outline ds-action-menu__trigger" id="story-menu-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="story-menu-content"><span class="ds-button__label">Ações do projeto</span>${icon('chevron-down', 'ds-button__icon')}</button><div class="ds-menu ds-action-menu__content" id="story-menu-content" role="menu" aria-labelledby="story-menu-trigger" hidden><button class="ds-menu__item" role="menuitem" type="button">${icon('settings', 'ds-menu__icon')}<span class="ds-menu__item-label">Editar detalhes</span><span class="ds-menu__shortcut">⌘E</span></button><button class="ds-menu__item" role="menuitem" type="button">${icon('check', 'ds-menu__icon')}<span class="ds-menu__item-label">Duplicar projeto</span></button><div class="ds-menu__separator" role="separator"></div><button class="ds-menu__item ds-menu__item--destructive" role="menuitem" type="button">${icon('trash', 'ds-menu__icon')}<span class="ds-menu__item-label">Excluir projeto</span></button></div></div></div>`,
  parameters: storyDescription('O runtime mantém abertura, Escape, navegação por teclado e retorno de foco.'),
};
