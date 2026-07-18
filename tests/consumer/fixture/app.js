/**
 * Entry do consumidor smoke.
 * Imports relativos ao pacote instalado — prova que o tarball entrega os
 * módulos públicos sem bundler. Em apps reais com bundler, use:
 *   import { initModals } from 'ds-tis/modal';
 */
import { initAccordions } from './node_modules/ds-tis/js/accordion.js';
import { initComboboxes } from './node_modules/ds-tis/js/combobox.js';
import { initModals } from './node_modules/ds-tis/js/modal.js';
import { initActionMenus } from './node_modules/ds-tis/js/menu.js';
import { initTabs } from './node_modules/ds-tis/js/tabs.js';
import { initTooltips } from './node_modules/ds-tis/js/tooltip.js';

const status = document.getElementById('status');
const tabsForm = document.getElementById('consumer-tabs-form');

tabsForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  tabsForm.dataset.submitCount = String(Number(tabsForm.dataset.submitCount || 0) + 1);
});

try {
  initAccordions();
  initComboboxes();
  initModals();
  initActionMenus();
  initTabs();
  initTooltips();
  status.textContent = 'Runtime ok';
  document.documentElement.dataset.smokeReady = 'true';
} catch (error) {
  status.textContent = `Runtime falhou: ${error.message}`;
  document.documentElement.dataset.smokeReady = 'false';
  console.error(error);
}
