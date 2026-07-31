# Spec Figma executada no piloto

- Componente/padrão: Accordion vNext — contrato e documentação de um componente composto.
- Página Figma: [DS TIS — vNext Pilot / Accordion](https://www.figma.com/design/VJtzLJV8Ie9yq7b00jfT2g/DS-TIS-vNext-Pilot?node-id=2-6)
- Referências DS TIS consultadas: Accordion `8519:3603`, Checkbox `135:8` e Select `146:20` no arquivo original `IE68amP9Hya5ieFw1rX8S8`.
- Referências externas consultadas: Ark UI/Zag localmente instalados, `docs/agents/ark-zag-reference.md` e o padrão Accordion do WAI-ARIA APG.

## Estratégia do piloto

- O arquivo vNext é separado do DS original.
- O piloto consome o component set publicado `Accordion Item` pela key `7ef5c5fcc4bf4dd635a5534c5bc47de1452dd22a`.
- Nenhuma instância é detached.
- Nenhum token ou style é duplicado.
- A API comportamental nova é documentada; ela ainda não altera a API pública do component set original.

## Anatomia

- Root de documentação: frame `Accordion`, 1440 px, único filho direto da página.
- Seções: `header`, `section-anatomy`, `section-behavior`, `section-states`, `section-api`, `section-accessibility`, `section-quality`.
- Anatomia visual: Item → Trigger → Leading icon opcional + Title + Chevron → Content → Content slot → Focus ring.
- Anatomia de implementação: Root → Item → Header → Trigger → Indicator → Panel.
- Nested instances: Accordion Item, Chevron e Leading Icon publicados pela biblioteca original.
- Slots: `Content Slot` permanece nativo na instância; o contrato de runtime trata `Panel` como conteúdo livre.

## Auto-layout

- Root: vertical, altura HUG, `clipsContent=false`.
- Seções/containers: largura FILL dentro do root; altura HUG; cards e colunas em auto-layout.
- Regras de resize: o canvas de 1440 px serve apenas para organizar e revisar a documentação dentro do Figma; não é breakpoint, token nem contrato de produto.
- Textos documentais: `textAutoResize=HEIGHT`.
- `clipsContent`: false no root e em todos os 28 frames descendentes.

## Relação com Astro e Storybook

- Figma permanece a fonte da verdade de visual, anatomia, properties, variants, states e categorias de tokens que possuem equivalência nativa.
- O repositório é a projeção versionada e validada dessa fonte: JSON, CSS, JS, HTML e APIs já refletem o estado sincronizado e são a entrada de build para consumidores.
- A página Figma não define o layout, a navegação ou a responsividade da documentação Astro.
- Astro tem arquitetura de informação própria: busca, navegação, abas por tecnologia, âncoras e conteúdo responsivo.
- Astro deve consumir os ativos existentes do repositório: tokens JSON, CSS de componentes, runtime JS da v1 e catálogo `docs/api/components.json`.
- O HTML atual é entrada de migração de conteúdo; não deve ser duplicado manualmente nem permanecer como uma segunda fonte canônica.
- Storybook demonstra e testa a implementação executável.
- A paridade obrigatória entre superfícies é do componente — anatomia, estados, conteúdo, acessibilidade, visual e tokens — e não da composição das páginas de documentação.
- Em caso de drift, ADR e Figma prevalecem; o repositório é ressincronizado antes de Astro, Storybook ou pacotes serem promovidos.

## Properties e contrato

- Component set publicado preservado: `State`, `Open`, `Title`, `Content`, `Content Slot`, `Show Leading Icon`, `Leading Icon`.
- Contrato de runtime proposto: `mode`, `collapsible`, `headingLevel`, `expandedItems`, `defaultExpandedItems`, `onExpandedItemsChange`, `disabled`, `leadingIcon`, `landmark`.
- Ordem de uso: configuração do root → estado controlado/não controlado → identificação do item → conteúdo do trigger → panel.
- Não expor: tipos Ark/Zag, hooks internos, `RootProvider`, `details`, `ids`, `orientation`, `lazyMount`, `unmountOnExit`, `data-scope` ou `data-part`.

## States

- Default: fechado e aberto.
- Hover: preservado no component set publicado; não congelado como exemplo estático.
- Focused: exemplo fechado com Focus Ring atual.
- Pressed: comportamento transitório de runtime; não vira variant persistente.
- Disabled: trigger indisponível e ignorado pela navegação por setas.
- Open/Closed: representados por `Open=false|true`.
- Error/Invalid: não se aplica ao padrão.

## Tokens/bindings

- Foundation: nenhuma mudança.
- Semantic: backgrounds, content, borders e surface da página usam variables remotas do DS TIS.
- Component: instâncias continuam consumindo os tokens Accordion publicados.
- Variables novas: zero.
- Effect styles: zero.
- Text styles: zero; documentação usa Inter com auto-height.

## Exemplos no canvas

- Single: default fechado, default aberto e focus fechado.
- Multiple: dois itens abertos, leading icon e item disabled.
- API: contrato neutro e exemplo React sem atributos internos do provider.
- Matriz de variants: permanece no arquivo original; o piloto prioriza composições que demonstram o novo contrato.

## Documentação visual

- Seções: anatomia, comportamento, estados/composições, API, acessibilidade e promoção.
- Tabelas: contrato e gates foram representados como blocos de leitura no piloto.
- Notas para designers: comportamento pertence ao contrato do DS; visual e tokens continuam canônicos no DS TIS.
- Diferenças para componentes próximos: registradas no brief e deverão aparecer na documentação Astro.

## Validação planejada/executada

- Estrutura: um root, sete seções na ordem esperada e zero nós soltos.
- Bindings: variables remotas na documentação e contratos Component preservados nas instâncias.
- Slots: propriedade SLOT preservada, sem detach.
- Textos: zero textos documentais com altura fixa.
- Instâncias: seis instâncias de Accordion e sete nested instances, todas remotas e conectadas.
- Screenshot: comparado com Accordion, Checkbox e Select vivos apenas para consistência interna do arquivo Figma, não como referência de layout para o Astro.
- Validadores repo: não aplicáveis a tokens, pois nenhuma variável foi criada ou alterada; o wrapper futuro terá gates próprios.

## Bloqueado antes de

- Figma write adicional: somente correções apontadas pelo Auditor ou aprovadas pelo owner.
- Repo sync público: auditoria tripartite do draft.
- Commit/push: validação completa e autorização explícita.
