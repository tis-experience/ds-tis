/**
 * Requisitos executáveis do gate App-ready (ADR-020).
 *
 * Este arquivo declara o que precisa ser provado. Resultados nunca vivem aqui
 * nem no catálogo de componentes: são produzidos em relatórios efêmeros pelas
 * suites que realmente executam os cenários.
 */

export const EVIDENCE_SCHEMA = 'ds-tis/app-ready-evidence';
export const EVIDENCE_VERSION = 1;

export const EVIDENCE_SUITES = Object.freeze({
  lifecycle: 'runtime-lifecycle',
  consumer: 'consumer-smoke',
});

export const RUNTIME_CAPABILITIES = Object.freeze({
  'package-export': {
    suite: EVIDENCE_SUITES.consumer,
    description: 'O módulo resolve por bare import e entrega todos os exports públicos declarados.',
  },
  'root-init': {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Init funciona com document, container e o próprio root do componente.',
  },
  'late-hydration': {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Markup incompleto não fica envenenado e subtree montada depois pode ser inicializada.',
  },
  'idempotent-init': {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Init repetido não duplica instâncias, listeners nem eventos.',
  },
  keyboard: {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'O teclado específico do padrão segue o contrato público.',
  },
  focus: {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Entrada, movimento, contenção e retorno de foco seguem o contrato.',
  },
  aria: {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Roles, relações e estados ARIA permanecem sincronizados.',
  },
  'open-close': {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'O fluxo principal de abrir, fechar, selecionar ou alternar funciona.',
  },
  events: {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Eventos públicos têm nome, quantidade, bubbling, target e detail validados.',
  },
  destroy: {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Destroy é escopado/idempotente e limpa listeners, timers e callbacks pendentes.',
  },
  reinit: {
    suite: EVIDENCE_SUITES.lifecycle,
    description: 'Re-init restaura o comportamento sem duplicar efeitos ou eventos.',
  },
  'consumer-tarball': {
    suite: EVIDENCE_SUITES.consumer,
    description: 'O componente é renderizado e operado usando somente o tarball instalado.',
  },
  'browser-errors': {
    suite: EVIDENCE_SUITES.consumer,
    description: 'O consumidor instalado não emite pageerror nem console.error durante o fluxo exercitado.',
  },
  'axe-closed': {
    suite: EVIDENCE_SUITES.consumer,
    description: 'Axe não encontra violações critical/serious no estado inicial/fechado.',
  },
  'axe-open': {
    suite: EVIDENCE_SUITES.consumer,
    description: 'Axe não encontra violações critical/serious no estado interativo aberto.',
  },
});

const COMMON_CASES = Object.freeze({
  'package-export': ['bare-import', 'declared-exports'],
  'root-init': ['init-document', 'init-container', 'init-component-root'],
  'late-hydration': ['incomplete-markup-recoverable', 'late-subtree-init'],
  'idempotent-init': ['double-init-zero-new-instance', 'double-init-no-duplicate-event'],
  events: ['public-event-count', 'public-event-bubbling-target-detail'],
  destroy: ['scoped-destroy', 'double-destroy', 'no-post-destroy-effects'],
  reinit: ['reinit-restores-behavior', 'reinit-single-event'],
  'consumer-tarball': ['installed-interaction'],
  'browser-errors': ['no-page-or-console-errors'],
  'axe-closed': ['axe-closed-no-blocking'],
  'axe-open': ['axe-open-no-blocking'],
});

const SPECIFIC_CASES = Object.freeze({
  accordion: {
    keyboard: ['enter-space-toggle', 'arrows-home-end-focus', 'disabled-no-toggle'],
    focus: ['roving-focus-wrap'],
    aria: ['expanded-hidden-data-state-sync', 'single-mode-sync'],
    'open-close': ['toggle-item', 'single-closes-previous'],
  },
  combobox: {
    keyboard: ['arrows-active-option', 'enter-selects', 'escape-keeps-input-focus'],
    focus: ['dom-focus-stays-on-input'],
    aria: ['active-descendant-valid', 'expanded-selected-sync'],
    'open-close': ['focus-opens', 'selection-closes'],
  },
  modal: {
    keyboard: ['escape-closes', 'tab-shift-tab-wrap'],
    focus: ['initial-focus', 'focus-trap', 'focus-return'],
    aria: ['dialog-modal-labelled'],
    'open-close': ['trigger-opens', 'escape-closes', 'backdrop-closes', 'inline-app-not-inert'],
  },
  menu: {
    keyboard: ['arrows-home-end', 'typeahead', 'escape-returns-focus'],
    focus: ['first-item-focus', 'disabled-focusable-not-activatable'],
    aria: ['menuitem-roles-supported', 'disabled-state-preserved'],
    'open-close': ['trigger-opens', 'enabled-item-closes', 'disabled-item-stays-open'],
  },
  tabs: {
    keyboard: ['arrows-home-end', 'disabled-skipped'],
    focus: ['roving-tabindex', 'tabpanel-focus-entry'],
    aria: ['selected-controls-hidden-sync'],
    'open-close': ['selection-switches-panel', 'selection-does-not-submit-form'],
  },
  tooltip: {
    keyboard: ['escape-dismisses-until-exit'],
    focus: ['focus-opens-without-moving-focus', 'blur-closes'],
    aria: ['role-and-describedby-valid'],
    'open-close': ['hover-delay-opens', 'trigger-to-content-persists', 'leave-both-closes'],
  },
});

function mergeCases(specific = {}) {
  const merged = {};
  for (const capability of Object.keys(RUNTIME_CAPABILITIES)) {
    merged[capability] = [...(COMMON_CASES[capability] || []), ...(specific[capability] || [])];
  }
  return merged;
}

export const RUNTIME_REQUIREMENTS_BY_SLUG = Object.freeze(
  Object.fromEntries(
    Object.entries(SPECIFIC_CASES).map(([slug, cases]) => [slug, Object.freeze(mergeCases(cases))]),
  ),
);

export function validateRequirementRegistry(runtimeBySlug) {
  const errors = [];
  const runtimeSlugs = Object.keys(runtimeBySlug).sort();
  const requirementSlugs = Object.keys(RUNTIME_REQUIREMENTS_BY_SLUG).sort();

  for (const slug of runtimeSlugs) {
    if (!RUNTIME_REQUIREMENTS_BY_SLUG[slug]) {
      errors.push(`${slug}: runtime público sem perfil de requisitos App-ready.`);
    }
  }
  for (const slug of requirementSlugs) {
    if (!runtimeBySlug[slug]) {
      errors.push(`${slug}: perfil de requisitos órfão sem runtime público.`);
    }
  }

  for (const [slug, requirements] of Object.entries(RUNTIME_REQUIREMENTS_BY_SLUG)) {
    for (const capability of Object.keys(RUNTIME_CAPABILITIES)) {
      if (!Array.isArray(requirements[capability]) || requirements[capability].length === 0) {
        errors.push(`${slug}: capability ${capability} não possui casos obrigatórios.`);
        continue;
      }
      const unique = new Set(requirements[capability]);
      if (unique.size !== requirements[capability].length) {
        errors.push(`${slug}: capability ${capability} possui case IDs duplicados.`);
      }
    }
  }

  return errors;
}

export function requiredEvidenceFor(slug) {
  return RUNTIME_REQUIREMENTS_BY_SLUG[slug] || null;
}
