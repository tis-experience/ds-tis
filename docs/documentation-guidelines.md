# Documentation guidelines

Este guia define o contrato editorial das páginas do Design System Core. Use-o antes de criar, refatorar ou revisar páginas em `docs/`.

## Princípios

1. **Docs descrevem o estado atual.** A fonte de verdade continua sendo ADR, Figma, JSON e CSS conforme `AGENTS.md`.
2. **Estrutura varia por finalidade.** Foundation, Component, Process e System pages não precisam ter o mesmo template.
3. **Exceções devem ser explícitas.** Se uma página omite uma seção comum, explique o motivo na própria página ou neste guia.
4. **Nomes oficiais não são inventados na documentação.** Use o nome do Figma, JSON ou CSS. Descrições de uso ficam em colunas de papel/uso.
5. **Design System TIS é o nome público do produto.** Use-o de forma consistente na documentação e nas instruções de consumo.

## Tipos de página

| Tipo | Finalidade | Exemplos |
|---|---|---|
| Foundation | Explicar escalas, tokens, valores e uso recomendado | Colors, Spacing, Elevation |
| Component | Ensinar uso, anatomia, estados, tokens, CSS e acessibilidade | Button, Input, Tabs |
| Process | Explicar fluxo operacional verificável | Contributing, Releasing, Versioning |
| System | Explicar princípios, arquitetura e normas transversais | Token Architecture, Accessibility |

## Foundation pages

Template recomendado:

1. Visão geral.
2. Visual reference ou escala.
3. Token reference.
4. Uso e relações com outros sistemas, quando aplicável.
5. Exceções arquiteturais, quando houver ADR.
6. JSON (DTCG).

Variações permitidas:

- Colors e Theme Colors podem usar swatches em vez de tabelas.
- Typography pode incluir preview de tipo.
- Elevation deve mencionar surface, porque depth combina shadow e surface, especialmente em dark mode.
- Motion, Z-index e Shadow/Elevation podem citar exceções CSS-only quando ligadas à ADR-016.

## Component pages

Template recomendado:

1. Quando usar.
2. Anatomia.
3. Variantes, tamanhos, estados e exemplos.
4. Boas práticas.
5. Diretrizes de conteúdo, quando o componente renderiza texto, label ou mensagem.
6. Mapeamento de tokens.
7. Classes CSS.
8. Propriedades Figma, quando houver variants/properties relevantes para handoff.
9. Interação por teclado, quando interativo.
10. Accessibility.
11. Relacionados.

Exceções permitidas:

- Componentes não interativos não precisam de Interação por teclado.
- Componentes simples podem ter uma anatomia curta, mas não devem omitir a intenção estrutural.
- `Form Field` segue template próprio porque é CSS-only por ADR-017.

## Documentação estática e Storybook

As duas superfícies são complementares e não devem manter contratos editoriais concorrentes:

- a documentação estática é a referência canônica de uso, anatomia, tokens, classes, propriedades Figma e accessibility;
- o Storybook demonstra a implementação pública real com Controls, variantes, tamanhos, estados e comportamento dos runtimes;
- cada componente no Storybook deve apontar para sua página estática canônica;
- a home e a navegação global da documentação devem manter acesso ao Storybook publicado em `/storybook/`;
- `npm run test:storybook` protege a cobertura do contrato e `npm run test:storybook:browser:pages` valida o artefato final em desktop, mobile, dark mode, Axe e interações.

## Form Field

`Form Field` é CSS-only e não deve ser auditado como componente visual ausente no Figma. A página deve deixar claro que:

- existe para compor markup HTML de label, control, helper e error;
- não substitui os componentes Figma de Input, Select, Textarea, Checkbox, Radio ou Toggle;
- mapeia comportamento de DOM e ARIA, não uma nova superfície visual no Figma.

## Process pages

Template recomendado:

1. Escopo e fonte de verdade.
2. Antes de começar.
3. Passo a passo.
4. Validação.
5. Falhas comuns ou rollback.
6. Links relacionados.

## System pages

Template recomendado:

1. Princípio ou decisão.
2. Impacto em design.
3. Impacto em código.
4. Tokens ou artefatos relacionados.
5. Verificação.
6. ADRs e processos relacionados.

## Labels oficiais de tabelas

Use estes labels em português:

| Conceito | Label |
|---|---|
| CSS variable | Variável CSS |
| Description | Descrição |
| WCAG criterion | Critério WCAG |
| Function / role | Função ou Papel |
| Reference | Referência |
| Class | Classe |
| Property | Propriedade |
| Value | Valor |
| Usage | Uso |

## Authored vs generated

| Arquivo | Tipo | Como alterar |
|---|---|---|
| `docs/*.html` manuais | Authored | Editar o HTML direto |
| `docs/*.md` publicados por `sync:docs` | Authored source | Editar o MD e rodar `npm run sync:docs` |
| `docs/*.en.md` pareado com página pública | Authored source EN | Editar o MD em inglês e rodar `npm run sync:docs` |
| `docs/decisions/ADR-*.md` | Authored source | Editar o MD e rodar `npm run sync:docs` |
| `docs/decisions/adr-*.html` | Generated | Não editar à mão |
| `docs/changelog.html` | Generated | Editar `CHANGELOG.md` |
| `docs/token-schema.md`, `docs/component-inventory.md`, `docs/adr-index.md` | Generated | Rodar `npm run sync:docs` |
| `docs/llms*.txt` | Generated | Rodar `npm run build:llms` |

## Checklist de revisão

- A página segue o template do tipo correto.
- Exceções estão declaradas.
- Tokens citados existem e passam em `npm run verify:tokens`.
- Labels de tabela usam a nomenclatura oficial deste guia.
- Mudança observável está registrada no `CHANGELOG.md`.
- Arquivos gerados foram atualizados pelo comando correto.
- Páginas públicas bilíngues têm fontes PT-BR e EN completas.
- Storybook e documentação estática permanecem ligados nos dois sentidos.
