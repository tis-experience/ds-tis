export default {
  title: 'Introdução/Design System TIS',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Catálogo interativo dos 23 componentes públicos do Design System TIS. As stories importam o CSS e os runtimes diretamente do pacote.',
      },
    },
  },
};

export const VisãoGeral = {
  render: () => `
    <div class="sb-story-stack">
      <span class="ds-badge ds-badge--brand ds-badge--subtle">v1.0.0</span>
      <div>
        <h1 class="ds-text-heading-xl">Design System TIS</h1>
        <p class="ds-text-body-md">CSS puro, tokens DTCG, modos light/dark e runtimes acessíveis opt-in.</p>
      </div>
      <div class="sb-story-row">
        <span class="ds-badge ds-badge--success ds-badge--subtle">21 App-ready</span>
        <span class="ds-badge ds-badge--info ds-badge--subtle">2 Compositions</span>
        <span class="ds-badge ds-badge--neutral ds-badge--subtle">WCAG 2.2 AA</span>
      </div>
      <a class="ds-button ds-button--brand" href="https://tis-experience.github.io/ds-tis/">
        <span class="ds-button__label">Abrir documentação completa</span>
      </a>
    </div>`,
};
