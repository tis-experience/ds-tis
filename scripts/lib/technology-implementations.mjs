/**
 * Contrato canônico das implementações públicas por tecnologia.
 *
 * Web permanece estável no pacote `ds-tis`. React é distribuído como source
 * por um registry shadcn versionado; não existe pacote público `@tis/react`.
 */

export const SHADCN_REGISTRY = {
  schema: "ds-tis/shadcn-registry",
  schemaVersion: 1,
  channel: "v1",
  status: "beta",
  namespace: "@tis",
  baseUrl: "https://tis-experience.github.io/ds-tis/registry/v1",
  manifestUrl: "https://tis-experience.github.io/ds-tis/registry/manifest.json",
  source: "registry.json",
  docs: "https://tis-experience.github.io/ds-tis/next/pt-br/react/registry/",
};

export const REACT_REGISTRY_BY_SLUG = {
  accordion: { item: "accordion", provider: "Base UI" },
  button: { item: "button", provider: "Base UI" },
  checkbox: { item: "checkbox", provider: "Base UI" },
  "form-field": { item: "field", provider: "React composition" },
  input: { item: "input", provider: "Base UI" },
  modal: { item: "dialog", provider: "Base UI" },
  radio: { item: "radio-group", provider: "Base UI" },
  textarea: { item: "textarea", provider: "Native React" },
  toggle: { item: "switch", provider: "Base UI" },
};

export const REACT_REGISTRY_COMPONENTS = Object.entries(REACT_REGISTRY_BY_SLUG)
  .map(([slug, implementation]) => ({ slug, ...implementation }))
  .sort((a, b) => a.slug.localeCompare(b.slug, "en"));

export function registryItemUrl(item) {
  return `${SHADCN_REGISTRY.baseUrl}/${item}.json`;
}

export function registryInstallCommand(item) {
  return `npx shadcn@latest add ${SHADCN_REGISTRY.namespace}/${item}`;
}

export function implementationsFor(component, runtime) {
  const react = REACT_REGISTRY_BY_SLUG[component.slug];

  return {
    web: {
      status: "stable",
      distribution: "npm",
      package: "ds-tis",
      css: "ds-tis/css",
      runtime: runtime?.module ?? null,
      docs: `https://tis-experience.github.io/ds-tis/docs/${component.html}`,
    },
    react: react
      ? {
          status: SHADCN_REGISTRY.status,
          distribution: "shadcn-registry",
          package: null,
          item: react.item,
          provider: react.provider,
          registryUrl: registryItemUrl(react.item),
          install: registryInstallCommand(react.item),
          docs: SHADCN_REGISTRY.docs,
        }
      : {
          status: "unavailable",
          distribution: null,
          package: null,
          item: null,
          provider: null,
          registryUrl: null,
          install: null,
          docs: SHADCN_REGISTRY.docs,
        },
  };
}

