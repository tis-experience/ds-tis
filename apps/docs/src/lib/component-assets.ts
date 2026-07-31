import buttonCssUrl from '../../../../css/components/button.css?url';

interface ComponentAssets {
  css: string[];
}

// Imports estáticos mantêm a estratégia auditável e permitem ao Vite emitir
// apenas folhas de componente conhecidas, sem carregar o reset ou todo o DS.
const COMPONENT_ASSETS: Record<string, ComponentAssets> = {
  button: { css: [buttonCssUrl] },
};

export function getComponentAssets(slug: string): ComponentAssets {
  return COMPONENT_ASSETS[slug] ?? { css: [] };
}
