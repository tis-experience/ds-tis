import accordionCssUrl from '../../../../css/components/accordion.css?url';
import alertCssUrl from '../../../../css/components/alert.css?url';
import badgeCssUrl from '../../../../css/components/badge.css?url';
import breadcrumbCssUrl from '../../../../css/components/breadcrumb.css?url';
import buttonCssUrl from '../../../../css/components/button.css?url';
import cardCssUrl from '../../../../css/components/card.css?url';
import checkboxCssUrl from '../../../../css/components/checkbox.css?url';
import comboboxCssUrl from '../../../../css/components/combobox.css?url';
import dividerCssUrl from '../../../../css/components/divider.css?url';
import formFieldCssUrl from '../../../../css/components/form-field.css?url';
import inputCssUrl from '../../../../css/components/input.css?url';
import menuCssUrl from '../../../../css/components/menu.css?url';
import modalCssUrl from '../../../../css/components/modal.css?url';
import popoverCssUrl from '../../../../css/components/popover.css?url';
import radioCssUrl from '../../../../css/components/radio.css?url';
import selectCssUrl from '../../../../css/components/select.css?url';
import tableCssUrl from '../../../../css/components/table.css?url';
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
  alert: { css: [alertCssUrl, buttonCssUrl] },
  badge: { css: [badgeCssUrl] },
  breadcrumb: { css: [breadcrumbCssUrl] },
  button: { css: [buttonCssUrl] },
  card: { css: [badgeCssUrl, buttonCssUrl, cardCssUrl] },
  checkbox: { css: [buttonCssUrl, checkboxCssUrl] },
  combobox: { css: [formFieldCssUrl, comboboxCssUrl] },
  divider: { css: [buttonCssUrl, dividerCssUrl] },
  input: { css: [formFieldCssUrl, inputCssUrl] },
  menu: { css: [buttonCssUrl, menuCssUrl] },
  modal: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, modalCssUrl] },
  popover: { css: [buttonCssUrl, formFieldCssUrl, inputCssUrl, popoverCssUrl] },
  radio: { css: [buttonCssUrl, radioCssUrl] },
  select: { css: [formFieldCssUrl, menuCssUrl, selectCssUrl] },
  table: { css: [badgeCssUrl, buttonCssUrl, tableCssUrl] },
  tabs: { css: [buttonCssUrl, tabsCssUrl] },
  textarea: { css: [formFieldCssUrl, textareaCssUrl] },
  toast: { css: [badgeCssUrl, buttonCssUrl, toastCssUrl] },
  toggle: { css: [buttonCssUrl, toggleCssUrl] },
  tooltip: { css: [buttonCssUrl, tooltipCssUrl] },
};

export function getComponentAssets(slug: string): ComponentAssets {
  return COMPONENT_ASSETS[slug] ?? { css: [] };
}
