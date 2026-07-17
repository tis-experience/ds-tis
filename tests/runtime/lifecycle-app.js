import {
  initAccordions,
  destroyAccordions,
} from '../../js/accordion.js';
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
import {
  initTabs,
  destroyTabs,
} from '../../js/tabs.js';
import {
  initTooltips,
  destroyTooltips,
} from '../../js/tooltip.js';

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
track('ds-accordion-open');
track('ds-accordion-close');
track('ds-tabs-change');
track('ds-tooltip-show');
track('ds-tooltip-hide');

window.__dsLifecycle = {
  init() {
    return {
      modals: initModals(),
      menus: initActionMenus(),
      comboboxes: initComboboxes(),
      accordions: initAccordions(),
      tabs: initTabs(),
      tooltips: initTooltips(),
    };
  },
  destroy() {
    destroyModals();
    destroyActionMenus();
    destroyComboboxes();
    destroyAccordions();
    destroyTabs();
    destroyTooltips();
  },
  openModal,
  closeModal,
  openActionMenu,
  closeActionMenu,
  initAccordions,
  destroyAccordions,
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
      accordionInit: document.getElementById('life-accordion')?.dataset.dsAccordionInit === 'true',
      tabsInit: document.getElementById('life-tabs')?.dataset.dsTabsInit === 'true',
      tooltipInit: document.getElementById('life-tooltip')?.dataset.dsTooltipInit === 'true',
    };
  },
};

document.documentElement.dataset.lifecycleReady = 'true';
