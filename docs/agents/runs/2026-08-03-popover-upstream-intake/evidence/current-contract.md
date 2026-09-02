# Evidência — contrato TIS atual do Popover

- Capturado em: 2026-08-03
- Fonte: checkout local, sem alteração do componente
- Status: baseline de repo atual e contrato Figma vivo lido em modo read-only

## Contrato publicado no repo

| Superfície | Evidência | Estado observado |
|---|---|---|
| API machine-readable | `docs/api/components.json`, objeto `slug=popover` | `app-ready` |
| Web CSS | `css/components/popover.css` | contrato visual existente |
| Web runtime | `js/popover.js` | módulo público `ds-tis/popover` |
| Documentação | `docs/popover.html` | uso e anatomia existentes |
| Figma vivo | `evidence/figma-live-contract.md` | página, set, properties e refs lidos em 2026-08-03 |
| React | `docs/api/components.json`, `implementations.react.status` | `unavailable` |

O runtime público registra `initPopovers`, `destroyPopovers`, `openPopover` e
`closePopover`, além dos eventos `ds-popover-open` e `ds-popover-close`. O core
Web não possui dependência de Base UI, Ark UI, Zag, React ou shadcn e deve
permanecer preservado durante o comparativo.

## Tokens observados na API

A API lista tokens Component para panel, arrow, title, body, close, content slot
e actions, além de focus ring, radius e z-index. Este registro confirma que já
existe contrato anatômico; não substitui a auditoria de bindings no Figma vivo.

## Evidência Figma

O preflight de 2026-08-03 reportou `.figma-snapshot.json` com oito dias. A run não
tratou esse snapshot como atual: fez uma leitura viva read-only e persistiu node
IDs, properties, referências e screenshot em `figma-live-contract.md`.

- a estrutura/API viva do alvo agora possui evidência atual;
- a comparação visual com 2-3 páginas maduras ainda não foi executada;
- um sync/release futuro ainda exigirá snapshot fresco pelos gates canônicos;
- escrita no Figma permanece bloqueada.
