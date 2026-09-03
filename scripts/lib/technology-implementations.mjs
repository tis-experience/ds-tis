/**
 * Contrato canônico das implementações públicas por tecnologia.
 *
 * As quatro saídas coexistem conforme ADR-022/023. Web permanece estável no pacote
 * `ds-tis`; Ark/Zag possui adapters próprios; React/shadcn/Base UI é distribuído
 * como source por um registry shadcn versionado. Angular é uma biblioteca nativa
 * independente. Não existe pacote público `@tis/react`.
 */

export const TECHNOLOGY_OUTPUTS = [
  {
    id: "web-html-css-js",
    key: "web",
    label: "HTML/CSS/JS",
    distribution: "npm",
  },
  {
    id: "ark-zag",
    key: "ark",
    label: "Ark/Zag",
    distribution: "technology-adapters",
  },
  {
    id: "react-shadcn-base-ui",
    key: "react",
    label: "React · shadcn/Base UI",
    distribution: "shadcn-registry",
  },
  {
    id: "angular-native",
    key: "angular",
    label: "Angular",
    distribution: "angular-package",
  },
];

export const ANGULAR_LIBRARY = {
  package: "@tis/angular",
  status: "beta",
  distribution: "angular-package",
  docs: "https://tis-experience.github.io/ds-tis/next/pt-br/angular/",
  storybook: "https://tis-experience.github.io/ds-tis/next/storybook-angular/",
  install: "npm install ./dist/tis-angular-0.0.0-beta.0.tgz ds-tis",
  publicRegistry: false,
};

export const ANGULAR_COMPONENTS_BY_SLUG = {
  accordion: { entrypoint: "accordion", primitive: "@angular/aria/accordion", storyId: "angular-accordion--playground" },
  button: { entrypoint: "button", primitive: "native button", storyId: "angular-button--playground" },
  checkbox: { entrypoint: "checkbox", primitive: "native checkbox + Angular Forms", storyId: "angular-checkbox--playground" },
  input: { entrypoint: "input", primitive: "native input + Angular Forms", storyId: "angular-input--playground" },
  modal: { entrypoint: "modal", primitive: "@angular/cdk/overlay + portal + a11y", storyId: "angular-modal--playground" },
  popover: { entrypoint: "popover", primitive: "@angular/cdk/overlay + portal + a11y", storyId: "angular-popover--playground" },
  radio: { entrypoint: "radio", primitive: "native radio group + Angular Forms", storyId: "angular-radio--playground" },
  select: { entrypoint: "select", primitive: "native select + Angular Forms", storyId: "angular-select--playground" },
  textarea: { entrypoint: "textarea", primitive: "native textarea + Angular Forms", storyId: "angular-textarea--playground" },
  toggle: { entrypoint: "toggle", primitive: "native switch + Angular Forms", storyId: "angular-toggle--playground" },
};

export const SHADCN_REGISTRY = {
  schema: "ds-tis/shadcn-registry",
  schemaVersion: 1,
  channel: "v1",
  status: "beta",
  namespace: "@tis",
  coreRef: "dd4c906943847cb7664a72a0c7637a378b39adcc",
  coreDependency: "ds-tis@github:tis-experience/ds-tis#dd4c906943847cb7664a72a0c7637a378b39adcc",
  baseUrl: "https://tis-experience.github.io/ds-tis/registry/v1",
  manifestUrl: "https://tis-experience.github.io/ds-tis/registry/manifest.json",
  source: "registry.json",
  docs: "https://tis-experience.github.io/ds-tis/next/pt-br/react/",
  distribution: "shadcn-registry",
  behaviorArchitecture: "base-ui",
  currentReactBehaviorTrack: "react-shadcn-base-ui",
};

export const REACT_REGISTRY_BY_SLUG = {
  accordion: { item: "accordion", provider: "Base UI" },
  alert: { item: "alert", provider: "React composition" },
  badge: { item: "badge", provider: "React composition" },
  button: { item: "button", provider: "Base UI" },
  card: { item: "card", provider: "React composition" },
  checkbox: { item: "checkbox", provider: "Base UI" },
  combobox: { item: "combobox", provider: "Base UI" },
  divider: { item: "separator", provider: "Native React" },
  "form-field": { item: "field", provider: "React composition" },
  input: { item: "input", provider: "Base UI" },
  menu: { item: "menu", provider: "Base UI" },
  modal: { item: "dialog", provider: "Base UI" },
  popover: { item: "popover", provider: "Base UI" },
  radio: { item: "radio-group", provider: "Base UI" },
  select: { item: "select", provider: "Base UI" },
  skeleton: { item: "skeleton", provider: "React presentation" },
  spinner: { item: "spinner", provider: "React presentation" },
  tabs: { item: "tabs", provider: "Base UI" },
  textarea: { item: "textarea", provider: "Native React" },
  toast: { item: "toast", provider: "Base UI" },
  tooltip: { item: "tooltip", provider: "Base UI" },
  toggle: { item: "switch", provider: "Base UI" },
};

export const ARK_ADAPTERS_BY_SLUG = {
  accordion: {
    adapter: "packages/react/src/ark/accordion.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-accordion--playground",
  },
  button: {
    adapter: "packages/react/src/ark/button.jsx",
    framework: "React",
    provider: "Ark UI Factory",
    storyId: "ark-button--playground",
  },
  checkbox: {
    adapter: "packages/react/src/ark/checkbox.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-checkbox--playground",
  },
  combobox: {
    adapter: "packages/react/src/ark/combobox.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-combobox--playground",
  },
  menu: {
    adapter: "packages/react/src/ark/menu.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-menu--playground",
  },
  modal: {
    adapter: "packages/react/src/ark/modal.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-modal--playground",
  },
  popover: {
    adapter: "packages/react/src/ark/popover.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-popover--playground",
  },
  radio: {
    adapter: "packages/react/src/ark/radio.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-radio--playground",
  },
  select: {
    adapter: "packages/react/src/ark/select.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-select--playground",
  },
  tabs: {
    adapter: "packages/react/src/ark/tabs.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-tabs--playground",
  },
  toast: {
    adapter: "packages/react/src/ark/toast.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-toast--playground",
  },
  toggle: {
    adapter: "packages/react/src/ark/toggle.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-toggle--playground",
  },
  tooltip: {
    adapter: "packages/react/src/ark/tooltip.jsx",
    framework: "React",
    provider: "Ark UI + Zag",
    storyId: "ark-tooltip--playground",
  },
};

export const ARK_ADAPTER_COMPONENTS = Object.entries(ARK_ADAPTERS_BY_SLUG)
  .map(([slug, implementation]) => ({ slug, ...implementation }))
  .sort((a, b) => a.slug.localeCompare(b.slug, "en"));

export function providerRoleFor(provider) {
  return provider === "Base UI" ? "output-provider" : "native-or-composition";
}

export const REACT_REGISTRY_COMPONENTS = Object.entries(REACT_REGISTRY_BY_SLUG)
  .map(([slug, implementation]) => ({
    slug,
    ...implementation,
    providerRole: providerRoleFor(implementation.provider),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug, "en"));

export function registryItemUrl(item) {
  return `${SHADCN_REGISTRY.baseUrl}/${item}.json`;
}

export function registryInstallCommand(item) {
  return `npx shadcn@latest add ${SHADCN_REGISTRY.namespace}/${item}`;
}

export function implementationsFor(component, runtime) {
  const react = REACT_REGISTRY_BY_SLUG[component.slug];
  const ark = ARK_ADAPTERS_BY_SLUG[component.slug];
  const angular = ANGULAR_COMPONENTS_BY_SLUG[component.slug];
  const providerRole = react ? providerRoleFor(react.provider) : null;

  return {
    web: {
      outputId: "web-html-css-js",
      status: "stable",
      distribution: "npm",
      package: "ds-tis",
      css: "ds-tis/css",
      runtime: runtime?.module ?? null,
      docs: `https://tis-experience.github.io/ds-tis/docs/${component.html}`,
    },
    ark: ark
      ? {
          outputId: "ark-zag",
          status: "beta",
          distribution: "technology-adapters",
          package: null,
          provider: ark.provider,
          framework: ark.framework,
          adapter: ark.adapter,
          storyId: ark.storyId,
          docs: `https://tis-experience.github.io/ds-tis/next/pt-br/ark/components/${component.slug}/`,
        }
      : {
          outputId: "ark-zag",
          status: "planned",
          distribution: "technology-adapters",
          package: null,
          provider: "Ark UI + Zag",
          framework: null,
          adapter: null,
          storyId: null,
          docs: null,
        },
    react: react
      ? {
          outputId: "react-shadcn-base-ui",
          status: SHADCN_REGISTRY.status,
          distribution: "shadcn-registry",
          package: null,
          item: react.item,
          provider: react.provider,
          providerRole,
          registryUrl: registryItemUrl(react.item),
          install: registryInstallCommand(react.item),
          docs: SHADCN_REGISTRY.docs,
        }
      : {
          outputId: "react-shadcn-base-ui",
          status: "unavailable",
          distribution: null,
          package: null,
          item: null,
          provider: null,
          providerRole: null,
          registryUrl: null,
          install: null,
          docs: SHADCN_REGISTRY.docs,
        },
    angular: angular
      ? {
          outputId: "angular-native",
          status: ANGULAR_LIBRARY.status,
          distribution: ANGULAR_LIBRARY.distribution,
          package: ANGULAR_LIBRARY.package,
          entrypoint: angular.entrypoint,
          primitive: angular.primitive,
          storyId: angular.storyId,
          install: ANGULAR_LIBRARY.install,
          docs: ANGULAR_LIBRARY.docs,
        }
      : {
          outputId: "angular-native",
          status: "planned",
          distribution: "angular-package",
          package: ANGULAR_LIBRARY.package,
          entrypoint: null,
          primitive: null,
          storyId: null,
          install: null,
          docs: ANGULAR_LIBRARY.docs,
        },
  };
}
