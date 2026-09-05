# Contrato atual — 2026-09-05

Preflight nesta sessão: branch `codex/ark-badge`, HEAD `0338ec8`, 13 arquivos dirty existentes e snapshot Figma ausente. Todo o trabalho inicial foi preservado.

| Dimensão | Contrato inspecionado |
| --- | --- |
| Anatomia | `span.ds-badge`, label em children; nenhuma parte interativa |
| Tons | brand, error, info, neutral, success, warning |
| Estilos | solid, subtle; defaults brand/solid |
| Tokens | CSS público `css/components/badge.css` consome `--ds-badge-*`; fonte `tokens/component/badge.json` |
| Semântica | Sem role, tabindex, aria-live ou dismiss implícitos; texto explícito |
| Ark | `@tis/react/ark/badge`; `forwardRef` + `@ark-ui/react/factory` |
| Web | `css/components/badge.css`, estável e inalterado |
| React | `registry/tis/badge.tsx`, beta e inalterado |
| Angular | `packages/angular/badge/src/badge.ts`, beta e inalterado |
| Figma | Nenhuma leitura viva nem snapshot disponível; sem alegação de paridade Figma fresca |

Zag não recebe import direto no adapter. A Factory instalada utiliza `@zag-js/core` internamente para composição de props, sem máquina de estado necessária para o Badge.
