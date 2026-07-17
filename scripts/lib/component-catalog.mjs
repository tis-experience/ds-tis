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
    consumer: "Inicializa o módulo documentado e fornece dados, eventos e regras de negócio.",
  },
};

/**
 * Responsabilidade publicada para um componente, considerando disponibilidade
 * real do runtime. Ownership (`ds-runtime`) não implica módulo já distribuído:
 * Accordion, Tooltip e Tabs pertencem ao DS, mas o runtime ainda não foi
 * publicado — a API não pode instruir o consumidor a inicializar algo que
 * não existe.
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
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "O comportamento existe apenas no site de docs; falta módulo público e teste em consumidor.",
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
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "Runtime público existente; falta ciclo de vida com destroy e teste de integração DOM em consumidor.",
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
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "Runtime público existente; falta ciclo de vida com destroy e teste de integração DOM em consumidor.",
  }),
  defineComponent({
    name: "Tooltip",
    slug: "tooltip",
    css: "tooltip.css",
    html: "tooltip.html",
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "Falta runtime público para hover, focus, Escape e persistência exigidos pelo contrato acessível.",
  }),
  defineComponent({
    name: "Menu",
    slug: "menu",
    css: "menu.css",
    html: "menu.html",
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "Runtime público existente; falta ciclo de vida com destroy e teste de integração DOM em consumidor.",
  }),
  defineComponent({
    name: "Tabs",
    slug: "tabs",
    css: "tabs.css",
    html: "tabs.html",
    readiness: "experimental",
    behaviorModel: "ds-runtime",
    readinessNotes: "Falta runtime público para seleção, roving tabindex, teclado e sincronização dos painéis.",
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
  combobox: {
    level: "required",
    module: "ds-tis/combobox",
    init: "initComboboxes",
    exports: ["initComboboxes", "syncComboboxState"],
    notes: "Listbox, filtro, seleção e teclado exigem init após render.",
  },
  modal: {
    level: "required",
    module: "ds-tis/modal",
    init: "initModals",
    exports: ["initModals", "openModal", "closeModal"],
    notes: "Abertura, focus trap, Escape, inert e retorno de foco exigem init.",
  },
  menu: {
    level: "required",
    module: "ds-tis/menu",
    init: "initActionMenus",
    exports: ["initActionMenus", "openActionMenu", "closeActionMenu"],
    notes: "Action Menu exige init para abertura, teclado e retorno de foco.",
  },
};
