# Evidência — benchmark upstream do Popover

- Capturado em: 2026-08-03
- Status: concluído para o gate de arquitetura
- Escopo: source oficial Base UI, packages Ark/Zag fixados e documentação primária

## shadcn + Base UI

O repo fixa Base UI `1.6.0` para a saída React/shadcn/Base UI e usa o registry
shadcn para estrutura e distribuição de source. Popover ainda não é um item TIS.

Evidência reproduzível:

- documentação oficial Base UI do shadcn:
  `https://ui.shadcn.com/docs/components/base/popover`;
- source oficial:
  `shadcn-ui/ui@a7d77e0cf78d338f213bed172f68261bb6c053e8`,
  `apps/v4/registry/bases/base/ui/popover.tsx`;
- último commit específico do arquivo: 2026-04-16;
- primitive: `@base-ui/react/popover`.

O source compõe `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, `Header`,
`Title` e `Description`. `PopoverContent` expõe `align`, `alignOffset`, `side` e
`sideOffset`. O recipe não contém close, arrow ou actions do contrato TIS; essas
partes não podem ser removidas nem substituídas silenciosamente.

A execução de `npx shadcn@latest view popover` na raiz deste repo resolveu a base
Radix (`radix-ui`), pois não há `components.json` que selecione Base UI nesse
contexto. Esse output foi descartado como evidência da saída Base UI. A run fixa
explicitamente `base=base` e o source oficial acima para impedir ambiguidade.

O CSS/recipe visual do shadcn não será copiado. A saída deverá reutilizar
classes e tokens TIS; o registry permanece somente distribuição.

## Ark + Zag

O workspace privado `@tis/react` fixa:

- `@ark-ui/react` `5.37.2`;
- `@zag-js/popover` `1.41.2`, transitivo via Ark.

Evidência local reproduzível:

- `node_modules/@ark-ui/react/dist/components/popover/popover.d.ts`;
- `node_modules/@ark-ui/react/dist/components/popover/index.d.ts`;
- `node_modules/@ark-ui/react/dist/components/popover/use-popover.d.ts`.

A anatomy exportada contém `Root`, `Trigger`, `Anchor`, `Positioner`, `Arrow`,
`ArrowTip`, `Content`, `Title`, `Description`, `CloseTrigger`, `Indicator`,
`Context` e `RootProvider`. `usePopover` consome diretamente os tipos e a API de
`@zag-js/popover`, confirmando Zag como motor, não como segundo adapter paralelo.

Documentação primária:

- `https://ark-ui.com/docs/components/popover`;
- `https://zagjs.com/components/popover`.

Ark/Zag documenta controlled state, foco configurável, dismiss, modalidade,
anchor separado, same width, nesting, multiple triggers, portal/layering e
positioning. A documentação atual do Zag mostra `1.42.0`, acima do `1.41.2`
fixado localmente; esta run compara a versão instalada e não autoriza upgrade.

## Diferenças úteis para o comparativo

| Tema | Base UI via shadcn | Ark/Zag |
|---|---|---|
| Source distribuído | recipe React pronto para copiar/adaptar | adapter TIS precisa ser criado |
| Portabilidade | React | Ark cobre React/Solid/Vue/Svelte sobre Zag |
| Anatomy upstream | menor, sem arrow/close/actions no recipe | parts explícitas para arrow, close, anchor e context |
| Posicionamento | `side`, `align` e offsets | `positioning`, anchor, sameWidth, available size |
| Estado | Root Base UI | Root/usePopover sobre máquina Zag |
| Fonte visual | nenhuma autoridade TIS | nenhuma autoridade TIS |

## O que não será copiado

- theme ou valores visuais upstream;
- Tailwind recipe como CSS do DS;
- nomes de provider na API pública TIS;
- parts que contrariem o contrato TIS sem brief/spec aprovada;
- decisão de uma saída aplicada automaticamente às demais.

## Próximo benchmark técnico

Este gate fecha a arquitetura e os inputs. Bundle, SSR/hydration, consumer real,
teclado e Axe só serão medidos depois que o owner aprovar construir as duas
saídas ainda ausentes. Até lá, Ark/Zag e React/shadcn/Base UI permanecem
`benchmark-only`, enquanto HTML/CSS/JS permanece `stable`.
