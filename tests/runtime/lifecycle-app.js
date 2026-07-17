import {
  initComboboxes,
  destroyComboboxes,
} from '../../js/combobox.js';
import {
  initModals,
  destroyModals,
  openModal,
  closeModal,
} from '../../js/modal.js';
import {
  initActionMenus,
  destroyActionMenus,
  openActionMenu,
  closeActionMenu,
} from '../../js/menu.js';

const log = [];

function track(name) {
  document.addEventListener(name, () => {
    log.push(name);
  });
}

track('ds-modal-open');
track('ds-modal-close');
track('ds-menu-open');
track('ds-menu-close');
track('ds-combobox-change');

window.__dsLifecycle = {
  init() {
    return {
      modals: initModals(),
      menus: initActionMenus(),
      comboboxes: initComboboxes(),
    };
  },
  destroy() {
    destroyModals();
    destroyActionMenus();
    destroyComboboxes();
  },
  openModal,
  closeModal,
  openActionMenu,
  closeActionMenu,
  events() {
    return [...log];
  },
  clearEvents() {
    log.length = 0;
  },
  markers() {
    return {
      modalInit: document.getElementById('life-modal')?.dataset.dsModalInit === 'true',
      modalTrigger: document.getElementById('open-modal')?.dataset.dsModalTriggerInit === 'true',
      menuInit: document.getElementById('life-menu')?.dataset.dsActionMenuInit === 'true',
      comboInit: document.getElementById('life-combo')?.dataset.dsComboboxInit === 'true',
    };
  },
};

document.documentElement.dataset.lifecycleReady = 'true';
