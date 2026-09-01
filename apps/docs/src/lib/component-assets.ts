import accordionCssUrl from '../../../../css/components/accordion.css?url';
import buttonCssUrl from '../../../../css/components/button.css?url';
import comboboxCssUrl from '../../../../css/components/combobox.css?url';
import formFieldCssUrl from '../../../../css/components/form-field.css?url';
import inputCssUrl from '../../../../css/components/input.css?url';
import menuCssUrl from '../../../../css/components/menu.css?url';
import modalCssUrl from '../../../../css/components/modal.css?url';
import popoverCssUrl from '../../../../css/components/popover.css?url';
import selectCssUrl from '../../../../css/components/select.css?url';

interface ComponentAssets {
  css: string[];
}

// Imports estáticos mantêm a estratégia auditável e permitem ao Vite emitir
// apenas folhas de componente conhecidas, sem carregar o reset ou todo o DS.
const COMPONENT_ASSETS: Record<string, ComponentAssets> = {
  accordion: { css: [accordionCssUrl, buttonCssUrl] },
  button: { css: [buttonCssUrl] },
  combobox: { css: [formFieldCssUrl, comboboxCssUrl] },
  menu: { css: [buttonCssUrl, menuCssUrl] },
  modal: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, modalCssUrl] },
  popover: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, popoverCssUrl] },
  select: { css: [formFieldCssUrl, menuCssUrl, selectCssUrl] },
};

export function getComponentAssets(slug: string): ComponentAssets {
  return COMPONENT_ASSETS[slug] ?? { css: [] };
}
