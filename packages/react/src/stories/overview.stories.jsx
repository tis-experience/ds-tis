const categories = [
  { name: 'Actions', components: ['Button'] },
  { name: 'Content and structure', components: ['Avatar', 'Card', 'Divider', 'Table'] },
  { name: 'Input and selection', components: ['Checkbox', 'Combobox', 'Form Field', 'Input Text', 'Radio', 'Select', 'Textarea', 'Toggle'] },
  { name: 'Feedback and status', components: ['Alert', 'Badge', 'Skeleton', 'Spinner'] },
  { name: 'Navigation', components: ['Breadcrumb', 'Menu'] },
  { name: 'Overlay and disclosure', components: ['Accordion', 'Modal', 'Popover'] },
];

export default {
  id: 'react-registry-overview',
  title: 'Overview/React registry',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    options: { showPanel: false },
    docs: {
      description: {
        component:
          'Entrada do registry React beta do Design System TIS. Cada componente possui grupo, Docs, Playground e exemplos isolados; detalhes de provider permanecem fora do catálogo público.',
      },
    },
  },
};

export const Catalog = {
  name: 'Start here',
  render: () => (
    <main className="ds-story-overview">
      <header className="ds-story-overview__header">
        <p className="ds-story-overview__eyebrow">React registry · Beta</p>
        <h1 className="ds-story-overview__title">Componentes por problema, não por provider</h1>
        <p className="ds-story-overview__intro">
          Use a navegação para abrir um componente. Playground documenta a API ajustável;
          os demais exemplos mostram estados, variantes e composições válidas.
        </p>
      </header>
      <div className="ds-story-overview__grid">
        {categories.map((category) => (
          <section className="ds-story-overview__category" key={category.name}>
            <h2>{category.name}</h2>
            <p>{category.components.length} {category.components.length === 1 ? 'component' : 'components'}</p>
            <ul>
              {category.components.map((component) => <li key={component}>{component}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </main>
  ),
};
