- Status: Approved

# Brief proposto

- Nome: Tabs
- Classe: navegação local entre painéis relacionados no mesmo contexto
- Problema: o contrato Web e Figma está maduro, mas Ark/Zag e React/shadcn/Base UI ainda não têm saídas equivalentes.
- Usar quando: conjuntos pequenos de painéis irmãos precisam compartilhar o mesmo espaço e alternar instantaneamente.
- Não usar quando: a navegação muda de página, representa etapas sequenciais, exige comparação simultânea ou oculta conteúdo essencial atrás de muitas opções.
- Diferenças para componentes próximos: Accordion empilha seções e pode expor várias ao mesmo tempo; Navigation muda de destino; Segmented Control altera uma configuração ou filtro, não painéis relacionados.
- Acessibilidade/semântica: `tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby`, roving tabindex, setas horizontais, Home/End e ativação automática sem latência.
- Composição DS: Root, List, Trigger/Tab, Panel/Content; indicador visual continua sendo a borda inferior do próprio trigger, como no Web/Figma.
- Variants/states candidatos: horizontal; active, default, hover, focus e disabled; controlled/uncontrolled nas saídas React.
- Slots: Root, List, Trigger/Tab e Panel/Content.
- Tokens: reutilizar os 16 tokens em `tokens/component/tabs.json` e os Semantic já consumidos; zero token novo.
- Docs Figma: sem mudança; página `192:2`, root `194:94`, `issueCount=0` no snapshot de 2026-08-28.
- Impacto repo: adapters Ark e Base UI, stories, registry, rotas Astro, consumidor e gates de browser/bundle.
- Fora de escopo: orientação vertical, tabs removíveis, tabs como links, carregamento remoto, alteração do runtime/CSS Web, Figma, commit, push e release.
- Bloqueado antes de: qualquer mudança Figma/Web core e qualquer publicação.
- Aprovação necessária: fornecida pelo owner ao autorizar execução contínua componente a componente, mantendo Figma/Web estáveis.
