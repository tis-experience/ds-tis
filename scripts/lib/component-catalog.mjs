/**
 * Catálogo canônico dos componentes consumíveis.
 *
 * `build-api.mjs` e `sync-docs.mjs` consomem este módulo para que API e
 * inventário não mantenham listas ou classificações paralelas.
 */

export const READINESS_LEVELS = {
  "app-ready": {
    label: "App-ready",
    description:
      "API pública recomendada para aplicações: anatomia, estados e responsabilidade de comportamento estão documentados.",
  },
  composition: {
    label: "Composição",
    description:
      "Padrão público e estável cuja orquestração, navegação ou estado de negócio permanece sob responsabilidade da aplicação.",
  },
  experimental: {
    label: "Experimental",
    description:
      "Contrato ainda não concluiu o gate de runtime e consumo; pode mudar e não deve sustentar fluxo crítico sem avaliação explícita.",
  },
};

export const BEHAVIOR_MODELS = {
  native: {
    label: "HTML nativo",
    ds: "Entrega anatomia, visual, estados e orientação de semântica nativa.",
    consumer: "Controla dados, eventos e regras de negócio usando o elemento HTML adequado.",
  },
  presentation: {
    label: "Apresentação",
    ds: "Entrega anatomia visual, tokens e orientação semântica sem runtime de componente.",
    consumer: "Fornece conteúdo, contexto e qualquer ação de produto associada.",
  },
  consumer: {
    label: "Aplicação",
    ds: "Entrega a composição, anatomia e estados visuais públicos.",
    consumer: "Mantém a orquestração entre elementos, dados, navegação e regras de negócio.",
  },
  "ds-runtime": {
    label: "Runtime do DS",
    ds: "Mantém o comportamento reutilizável de interação e acessibilidade por módulo público.",
    consumer: "Chama init após render, destroy ao desmontar, e fornece dados, eventos e regras de negócio.",
  },
};

export const RESPONSIVE_PROFILES = {
  container: {
    label: "Container do consumidor",
    ds: "Preserva anatomia, estados e interação na largura oferecida pelo container; não troca variants por viewport.",
    consumer: "Define grid, largura, reflow e densidade da tela sem inventar modificadores responsivos do componente.",
  },
  "viewport-constrained": {
    label: "Limitado pela viewport",
    ds: "Aplica limites intrínsecos de largura/altura contra a viewport além de preservar o contrato do componente.",
    consumer: "Fornece conteúdo conciso e testa teclado, zoom e orientação no contexto real da aplicação.",
  },
  "consumer-managed-horizontal": {
    label: "Coleção horizontal gerida pelo consumidor",
    ds: "Mantém itens, estados e navegação horizontal; não remove, resume nem reorganiza conteúdo por breakpoint.",
    consumer: "Decide redução de itens, overflow, wrapping ou composição alternativa conforme conteúdo e regra de produto.",
  },
  "consumer-selectable-width": {
    label: "Largura selecionável pelo consumidor",
    ds: "Entrega variantes explícitas de largura quando documentadas; não as ativa automaticamente por viewport.",
    consumer: "Escolhe a variante ou largura no breakpoint do layout da aplicação.",
  },
};

export const RESPONSIVE_CONTRACT = {
  version: 1,
  model: "intrinsic-first",
  publicBreakpoints: [],
  testedViewports: [
    { inlineSize: 320, blockSize: 568, context: "phone-portrait" },
    { inlineSize: 568, blockSize: 320, context: "phone-landscape" },
    { inlineSize: 1280, blockSize: 800, context: "desktop" },
  ],
  rules: [
    "Variants de size são escolhas explícitas de produto; não representam breakpoints automáticos.",
    "O pacote não publica modificadores de breakpoint nem tokens de viewport.",
    "O app consumidor mantém o layout da página, a densidade de conteúdo e qualquer troca de composição.",
    "O smoke do tarball valida ausência de overflow horizontal do documento e limites de overlays na fixture de referência.",
  ],
};

const RESPONSIVE_PROFILE_BY_SLUG = {
  button: "consumer-selectable-width",
  modal: "viewport-constrained",
  tooltip: "viewport-constrained",
  toast: "viewport-constrained",
  tabs: "consumer-managed-horizontal",
  breadcrumb: "consumer-managed-horizontal",
  pagination: "consumer-managed-horizontal",
};

export function responsiveFor(component) {
  const profile = RESPONSIVE_PROFILE_BY_SLUG[component.slug] || "container";
  return { profile, ...RESPONSIVE_PROFILES[profile] };
}

/**
 * Responsabilidade publicada para um componente, considerando disponibilidade
 * Ownership (`ds-runtime`) não implica módulo já distribuído.
 */
export function responsibilityFor(component, runtime) {
  const base = BEHAVIOR_MODELS[component.behaviorModel];
  if (component.behaviorModel === "ds-runtime" && !runtime) {
    return {
      model: component.behaviorModel,
      label: base.label,
      ds: "Deve manter o comportamento reutilizável de interação e acessibilidade; o módulo público ainda não foi distribuído.",
      consumer: "Não há módulo público para inicializar. Comportamento local é adaptação temporária do app e deve ser declarado como tal — ver readinessNotes.",
    };
  }
  return { model: component.behaviorModel, ...base };
}

function defineComponent(component) {
  const readinessDefinition = READINESS_LEVELS[component.readiness];
  const behaviorDefinition = BEHAVIOR_MODELS[component.behaviorModel];
  if (!readinessDefinition) {
    throw new Error(`Readiness inválido em ${component.slug}: ${component.readiness}`);
  }
  if (!behaviorDefinition) {
    throw new Error(`Modelo de comportamento inválido em ${component.slug}: ${component.behaviorModel}`);
  }

  return {
    ...component,
    readinessNotes: component.readinessNotes || readinessDefinition.description,
  };
}

export const COMPONENTS = [
  defineComponent({
    name: "Accordion",
    slug: "accordion",
    css: "accordion.css",
    html: "accordion.html",
    figmaPage: "Accordion",
    readiness: "app-ready",
    behaviorModel: "ds-runtime",
  }),
  defineComponent({
    name: "Button",
    slug: "button",
    css: "button.css",
    html: "button.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Input Text",
    slug: "input",
    css: "input.css",
    html: "input.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Textarea",
    slug: "textarea",
    css: "textarea.css",
    html: "textarea.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Select",
    slug: "select",
    css: "select.css",
    html: "select.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Combobox",
    slug: "combobox",
    css: "combobox.css",
    html: "combobox.html",
    figmaPage: "Combobox",
    readiness: "app-ready",
    behaviorModel: "ds-runtime",
  }),
  defineComponent({
    name: "Checkbox",
    slug: "checkbox",
    css: "checkbox.css",
    html: "checkbox.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Radio",
    slug: "radio",
    css: "radio.css",
    html: "radio.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Toggle",
    slug: "toggle",
    css: "toggle.css",
    html: "toggle.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Badge",
    slug: "badge",
    css: "badge.css",
    html: "badge.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
  defineComponent({
    name: "Alert",
    slug: "alert",
    css: "alert.css",
    html: "alert.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
  defineComponent({
    name: "Card",
    slug: "card",
    css: "card.css",
    html: "card.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
  defineComponent({
    name: "Modal",
    slug: "modal",
    css: "modal.css",
    html: "modal.html",
    readiness: "app-ready",
    behaviorModel: "ds-runtime",
  }),
  defineComponent({
    name: "Tooltip",
    slug: "tooltip",
    css: "tooltip.css",
    html: "tooltip.html",
    readiness: "app-ready",
    behaviorModel: "ds-runtime",
  }),
  defineComponent({
    name: "Toast",
    slug: "toast",
    css: "toast.css",
    html: "toast.html",
    figmaPage: "Toast",
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "MVP com fila, dismiss, auto-hide e ação; promove a App-ready após evidência lifecycle/consumer.",
  }),
  defineComponent({
    name: "Menu",
    slug: "menu",
    css: "menu.css",
    html: "menu.html",
    readiness: "app-ready",
    behaviorModel: "ds-runtime",
  }),
  defineComponent({
    name: "Tabs",
    slug: "tabs",
    css: "tabs.css",
    html: "tabs.html",
    readiness: "app-ready",
    behaviorModel: "ds-runtime",
  }),
  defineComponent({
    name: "Breadcrumb",
    slug: "breadcrumb",
    css: "breadcrumb.css",
    html: "breadcrumb.html",
    readiness: "app-ready",
    behaviorModel: "native",
  }),
  defineComponent({
    name: "Pagination",
    slug: "pagination",
    css: "pagination.css",
    html: "pagination.html",
    figmaPage: "Pagination",
    readiness: "composition",
    behaviorModel: "consumer",
    readinessNotes: "O DS entrega itens e estados; a aplicação mantém URL, carregamento e página atual.",
  }),
  defineComponent({
    name: "Avatar",
    slug: "avatar",
    css: "avatar.css",
    html: "avatar.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
  defineComponent({
    name: "Divider",
    slug: "divider",
    css: "divider.css",
    html: "divider.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
  defineComponent({
    name: "Form Field",
    slug: "form-field",
    css: "form-field.css",
    html: "form-field.html",
    cssClass: "ds-field",
    cssOnly: true,
    readiness: "composition",
    behaviorModel: "consumer",
    readinessNotes: "O DS entrega label, helper e erro; a aplicação mantém IDs, validação, valor e mensagens.",
  }),
  defineComponent({
    name: "Spinner",
    slug: "spinner",
    css: "spinner.css",
    html: "spinner.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
  defineComponent({
    name: "Skeleton",
    slug: "skeleton",
    css: "skeleton.css",
    html: "skeleton.html",
    readiness: "app-ready",
    behaviorModel: "presentation",
  }),
];

/** Comportamento JS público exigido quando o componente é usado interativamente. */
export const RUNTIME_BY_SLUG = {
  accordion: {
    level: "required",
    module: "ds-tis/accordion",
    init: "initAccordions",
    destroy: "destroyAccordions",
    exports: ["initAccordions", "destroyAccordions", "openAccordionItem", "closeAccordionItem"],
    events: ["ds-accordion-open", "ds-accordion-close"],
    notes: "Expand/collapse, teclado e modo single exigem init após render; chame destroy ao desmontar.",
  },
  combobox: {
    level: "required",
    module: "ds-tis/combobox",
    init: "initComboboxes",
    destroy: "destroyComboboxes",
    exports: ["initComboboxes", "destroyComboboxes", "syncComboboxState"],
    events: ["ds-combobox-change"],
    notes: "Listbox, filtro, seleção e teclado exigem init após render; chame destroy ao desmontar.",
  },
  modal: {
    level: "required",
    module: "ds-tis/modal",
    init: "initModals",
    destroy: "destroyModals",
    exports: ["initModals", "destroyModals", "openModal", "closeModal"],
    events: ["ds-modal-open", "ds-modal-close"],
    notes: "Abertura, focus trap, Escape, inert e retorno de foco exigem init; chame destroy ao desmontar.",
  },
  menu: {
    level: "required",
    module: "ds-tis/menu",
    init: "initActionMenus",
    destroy: "destroyActionMenus",
    exports: ["initActionMenus", "destroyActionMenus", "openActionMenu", "closeActionMenu"],
    events: ["ds-menu-open", "ds-menu-close"],
    notes: "Action Menu exige init para abertura, teclado e retorno de foco; chame destroy ao desmontar.",
  },
  tabs: {
    level: "required",
    module: "ds-tis/tabs",
    init: "initTabs",
    destroy: "destroyTabs",
    exports: ["initTabs", "destroyTabs", "selectTab"],
    events: ["ds-tabs-change"],
    notes: "Seleção, roving tabindex e sync de painéis exigem init após render; chame destroy ao desmontar.",
  },
  tooltip: {
    level: "required",
    module: "ds-tis/tooltip",
    init: "initTooltips",
    destroy: "destroyTooltips",
    exports: ["initTooltips", "destroyTooltips", "showTooltip", "hideTooltip"],
    events: ["ds-tooltip-show", "ds-tooltip-hide"],
    notes: "Hover, focus, Escape e hoverable content (WCAG 1.4.13) exigem init após render; chame destroy ao desmontar.",
  },
  toast: {
    level: "required",
    module: "ds-tis/toast",
    init: "initToasts",
    destroy: "destroyToasts",
    exports: ["initToasts", "destroyToasts", "showToast", "dismissToast"],
    events: ["ds-toast-show", "ds-toast-dismiss", "ds-toast-action"],
    notes: "Fila, auto-hide, dismiss e ação opcional exigem init; chame destroy ao desmontar.",
  },
};
