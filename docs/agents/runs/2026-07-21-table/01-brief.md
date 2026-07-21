- Status: Pending — aguardando aprovação do owner

# Brief proposto

- Nome: Table
- Classe: Componente tabular de apresentação (HTML `<table>`) + composição documentada — **não** DataGrid / ARIA `grid`
- Problema: Inventário lista Table como pendente. Apps e docs improvisam tabelas ad hoc (ex.: `.ds-token-table` só no site de docs) sem anatomia pública, densidade, estados de linha/header nem contrato de composição com Checkbox, Badge, Menu, Pagination. Card já aponta “dados tabulares densos → use linhas de tabela”, mas o padrão ainda não existe no catálogo.
- Usar quando:
  - Exibir dados estruturados em linhas/colunas para leitura, comparação ou operação leve (status, ações por linha).
  - Precisar de semântica tabular nativa (`<table>`, `<th scope>`, caption) com visual do DS.
  - Compor seleção, badges, botões/menu e paginação com componentes já App-ready / Composition do DS.
- Nao usar quando:
  - Conteúdo não-tabular agrupado → **Card** / layout
  - Lista hierárquica de navegação → **Breadcrumb** / nav
  - Alternar seções de página → **Tabs**
  - Comandos soltos sem dados tabulares → **Menu**
  - Overlay contextual → **Popover** (run separada; fora deste escopo)
  - Feedback transitório → **Toast** / **Alert**
  - Planilha editável, foco célula-a-célula, seleção de range → **DataGrid** (ARIA `grid`) — **fora do MVP**; abrir run futura se houver demanda
- Diferencas para componentes proximos:
  - **Card:** superfície no fluxo para bloco de conteúdo; não modela relações header↔célula.
  - **Divider:** separador visual 1D; Table usa bordas/dividers de linha/coluna como anatomia tabular.
  - **Pagination:** navega páginas de um dataset; **compõe abaixo** da Table — não substitui a grade.
  - **Menu:** ações; na Table vive em célula/coluna de ações (instância), não como container de dados.
  - **Checkbox / Badge / Button:** células compostas; Table não reimplementa esses controles.
  - **`.ds-token-table` (docs):** chrome interno do site — **não** é o componente de produto; não promover para API pública.
- Acessibilidade/semantica (MVP):
  - Base: HTML `<table>` nativo (APG Table Pattern). Preferir markup nativo a roles ARIA em `div`.
  - `caption` (visível ou `.ds-table__caption--sr`) ou `aria-labelledby` quando o título vive fora da table.
  - Headers: `<th scope="col">` (e `scope="row"` quando fizer sentido); células de dados em `<td>`.
  - Colunas ordenáveis (composição): botão no header + `aria-sort="ascending|descending|none"` no `th` ativo (APG Sortable Table). App ordena os dados; DS só documenta markup/estados visuais.
  - Seleção (composição): Checkbox nativo por linha + “selecionar todas” no header com estado indeterminate quando aplicável. App mantém estado; DS documenta anatomia e estilos de linha `selected` / `hover`.
  - **Não** usar `role="grid"` no MVP. Widgets dentro de células permanecem stops no tab order da página.
  - Overflow horizontal: wrapper com scroll; preservar foco visível; não cortar focus ring (`overflow` no wrapper, não em células com controles).
  - Contraste WCAG 2.2 AA em header/célula/hover/selected; `prefers-reduced-motion` em hover/transitions.
- Composicao DS:
  - Células: texto, numérico (alinhamento end), **Badge**, **Avatar**+label, **Button** / **Menu** (ações), **Checkbox** (seleção), link nativo estilizado.
  - Toolbar / filtros / busca: **fora** do component set core — exemplos de composição na página (Button, Input, Select).
  - Paginação: **Pagination** abaixo da table (mesmo dataset).
  - Loading: **Skeleton** em células/linhas ou overlay leve; empty state com texto + CTA Button.
  - Batch actions: barra simples composta (Alert toned ou surface + Buttons) nos exemplos — sem runtime dedicado no MVP.
  - Ícones de sort: Lucide (`arrow-up-down` / `arrow-up` / `arrow-down`) via instância, size/color por Component token.
- Variants/states candidatos (MVP):
  - Density / Size: `sm` | `md` (menor→maior; default `md`). `lg` só se benchmark Figma justificar depois.
  - Appearance: `default` (dividers de linha) | `bordered` (opcional)
  - Boolean / modifiers CSS: `striped` (zebra), sticky header (CSS), compact padding via density
  - Header cell: `Default` | `Sortable` + sort state `None` | `Ascending` | `Descending`
  - Row: `Default` | `Hover` | `Selected` | `Disabled` (opcional)
  - Cell align: `start` (default) | `end` (numérico) | `center` (ícone/ação)
- Slots:
  - Célula = slot de composição (texto ou instâncias DS)
  - Coluna de seleção / ações = exemplos, não variants obrigatórios de todo set
  - Caption / título externo = TEXT ou composição com heading
- Tokens: Component `table/*` (bg header/body/row-hover/row-selected, border, divider, radius container opcional, padding cell por density, typography header/body, icon size sort, checkbox column width) aliasando Semantic (`surface.*`, `background.*`, `border.*`, `content.*`, `space.*`, `radius.*`, `typography.*`). Sem Foundation no CSS de componente. Sem tokens novos de motion/z além dos Semantic existentes.
- Docs Figma: página nova `Table` — frame raiz único + seções (modelo vivo: **Pagination**, **Card**, **Divider**; Menu só em exemplos de ações).
- Impacto repo (após gates Figma → sync → repo): `css/components/table.css`; tokens `tokens/component/table.json` + registry; catálogo `table` com `readiness: composition`, `behaviorModel: consumer`; `docs/table.html`; inventário (sair de “pendentes”); testes a11y markup; CHANGELOG; SemVer **minor** na release — **sem bump** nesta fase. Sem `ds-tis/table` runtime no MVP.
- Fora de escopo:
  - **Popover** (qualquer Figma/repo da run Popover) e **Toast**
  - DataGrid / ARIA grid, virtualização, resize/reorder de colunas, edição in-cell, nested/expandable rows, treegrid
  - Toolbar/filter/search como componente Table embutido
  - Runtime de sort/select/pagination no DS
  - Migrar `.ds-token-table` do site (pode alinhar visualmente depois, gate separado)
  - Branch/sujeira `codex/storybook`, PR #43 Toast, sync tokens, commit/push/PR sem pedido explícito
- Bloqueado antes de: escrita Figma; tokens/CSS/docs de produto; commit/push/PR — até aprovação explícita deste brief + `02-figma-spec.md`.
- Aprovacao necessaria:
  1. Classificação MVP = **Table HTML (APG Table)**, não DataGrid.
  2. Readiness **composition** + `behaviorModel: consumer` (dados/sort/filter/select/paginação na app).
  3. Densidade **sm|md**; sort e seleção como **composição documentada** (não runtime).
  4. Figma-first após este gate; páginas modelo Pagination/Card/Divider.

## Estado atual isolado

- Preflight (worktree `feat/table`): branch `feat/table` tracking `origin/main` @ `ecd72fe`; working tree só com esta run.
- Workspace principal permanece em `codex/storybook` (dirty: Storybook, Popover run, etc.) — **fora de escopo**.
- Snapshot Figma ausente neste worktree — irrelevante até Token Sync.
- Inventário: pendentes Table, Toast, Popover; Toast Experimental (PR #43); Popover em outra run — **não tocar**.
- Figma: nenhum component set `Table` no DS (só ícones Lucide `table*`).

## Benchmark

| Fonte | Aprendizado aplicado |
|-------|----------------------|
| DS TIS Card | “Dados tabulares densos → table”; Table preenche esse gap |
| DS TIS Pagination | Composition/consumer: UI no DS, orquestração na app; compõe com Table |
| DS TIS Divider / Menu | Separadores 1D ≠ grade; Menu = ações em célula |
| DS TIS `.ds-token-table` | Prova demanda visual; não é API de produto |
| WAI-ARIA APG Table + Sortable Table | `<table>` nativo; `aria-sort` no header; não grid |
| WAI-ARIA APG Grid | Interação célula-a-célula = outro padrão (fora do MVP) |
| Carbon Data Table | Anatomia title/toolbar/header/row/pagination; density; selection/expansion como camadas — MVP TIS só core + composição |
| Polaris Data Table / Index Table | Data Table = análise; Index = gestão com ações; lógica de sort/filter/page na app |

## Classificação final (proposta)

- **Padrão:** componente tabular (não primitive solto; não overlay).
- **Readiness:** `composition` (ADR-020).
- **behaviorModel:** `consumer`.
- **runtime:** nenhum no MVP (`none`).
- **Figma → repo** após brief/spec aprovados.

## Anatomia HTML proposta (MVP)

```html
<div class="ds-table-scroll">
  <table class="ds-table ds-table--md">
    <caption class="ds-table__caption">Pedidos recentes</caption>
    <thead>
      <tr>
        <th scope="col" class="ds-table__th ds-table__th--select">
          <input type="checkbox" class="ds-checkbox" aria-label="Selecionar todas">
        </th>
        <th scope="col" class="ds-table__th" aria-sort="ascending">
          <button type="button" class="ds-table__sort">Cliente</button>
        </th>
        <th scope="col" class="ds-table__th ds-table__th--numeric">Total</th>
        <th scope="col" class="ds-table__th"><span class="ds-sr-only">Ações</span></th>
      </tr>
    </thead>
    <tbody>
      <tr class="ds-table__row ds-table__row--selected">
        <td class="ds-table__td ds-table__td--select">…</td>
        <td class="ds-table__td">…</td>
        <td class="ds-table__td ds-table__td--numeric">…</td>
        <td class="ds-table__td ds-table__td--actions">…</td>
      </tr>
    </tbody>
  </table>
</div>
<nav class="ds-pagination" aria-label="Paginação da tabela">…</nav>
```
