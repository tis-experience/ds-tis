/**
 * Entry do consumidor smoke.
 * Imports relativos ao pacote instalado — prova que o tarball entrega os
 * módulos públicos sem bundler. Em apps reais com bundler, use:
 *   import { initModals } from 'ds-tis/modal';
 */
import { initComboboxes } from './node_modules/ds-tis/js/combobox.js';
import { initModals } from './node_modules/ds-tis/js/modal.js';
import { initActionMenus } from './node_modules/ds-tis/js/menu.js';

const status = document.getElementById('status');

try {
  initComboboxes();
  initModals();
  initActionMenus();
  status.textContent = 'Runtime ok';
  document.documentElement.dataset.smokeReady = 'true';
} catch (error) {
  status.textContent = `Runtime falhou: ${error.message}`;
  document.documentElement.dataset.smokeReady = 'false';
  console.error(error);
}
