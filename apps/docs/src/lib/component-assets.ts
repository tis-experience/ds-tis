import accordionCssUrl from '../../../../css/components/accordion.css?url';
import badgeCssUrl from '../../../../css/components/badge.css?url';
import buttonCssUrl from '../../../../css/components/button.css?url';
import checkboxCssUrl from '../../../../css/components/checkbox.css?url';
import comboboxCssUrl from '../../../../css/components/combobox.css?url';
import formFieldCssUrl from '../../../../css/components/form-field.css?url';
import inputCssUrl from '../../../../css/components/input.css?url';
import menuCssUrl from '../../../../css/components/menu.css?url';
import modalCssUrl from '../../../../css/components/modal.css?url';
import popoverCssUrl from '../../../../css/components/popover.css?url';
import radioCssUrl from '../../../../css/components/radio.css?url';
import selectCssUrl from '../../../../css/components/select.css?url';
import tabsCssUrl from '../../../../css/components/tabs.css?url';
import textareaCssUrl from '../../../../css/components/textarea.css?url';
import toastCssUrl from '../../../../css/components/toast.css?url';
import toggleCssUrl from '../../../../css/components/toggle.css?url';
import tooltipCssUrl from '../../../../css/components/tooltip.css?url';

interface ComponentAssets {
  css: string[];
}

// Imports estáticos mantêm a estratégia auditável e permitem ao Vite emitir
// apenas folhas de componente conhecidas, sem carregar o reset ou todo o DS.
const COMPONENT_ASSETS: Record<string, ComponentAssets> = {
  accordion: { css: [accordionCssUrl, buttonCssUrl] },
  button: { css: [buttonCssUrl] },
  checkbox: { css: [buttonCssUrl, checkboxCssUrl] },
  combobox: { css: [formFieldCssUrl, comboboxCssUrl] },
  input: { css: [formFieldCssUrl, inputCssUrl] },
  menu: { css: [buttonCssUrl, menuCssUrl] },
  modal: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, modalCssUrl] },
  popover: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, popoverCssUrl] },
  radio: { css: [buttonCssUrl, radioCssUrl] },
  select: { css: [formFieldCssUrl, menuCssUrl, selectCssUrl] },
  tabs: { css: [buttonCssUrl, tabsCssUrl] },
  textarea: { css: [formFieldCssUrl, textareaCssUrl] },
  toast: { css: [badgeCssUrl, buttonCssUrl, toastCssUrl] },
  toggle: { css: [buttonCssUrl, toggleCssUrl] },
  tooltip: { css: [buttonCssUrl, tooltipCssUrl] },
};

export function getComponentAssets(slug: string): ComponentAssets {
  return COMPONENT_ASSETS[slug] ?? { css: [] };
}
