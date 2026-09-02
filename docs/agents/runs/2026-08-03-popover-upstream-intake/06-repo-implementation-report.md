# Repo Implementation Report

- Status: Implementado e validado localmente
- Componente: Popover
- Run: `2026-08-03-popover-upstream-intake`
- Agent: Codex · Repo Component Agent
- Data da última validação: 2026-08-28

## Entrada

- Figma: aprovado sem mudança
- Token sync: não aplicável; contrato existente reutilizado
- Plano: `05-repo-sync-plan.md`

## Implementação

- Web: preservado, sem alteração do core HTML/CSS/JS.
- Ark/Zag: adapter React e CSS próprios em `packages/react/src/ark/`.
- React: `registry/tis/popover.tsx`, item `@tis/popover` e consumer real via shadcn/Base UI.
- Docs: três rotas bilíngues, seletor comum, catálogo React e Storybook Ark/Zag separado.
- API/LLM: 1 adapter Ark/Zag beta e 16 componentes React beta nos metadados gerados.
- CHANGELOG: piloto registrado em `[Não publicado]`.
- Portal: previews Storybook carregam sob demanda, catálogo canônico permanece
  compacto em mobile e a nomenclatura das três saídas é consistente.
- Popover Ark/Zag: `placement` pertence ao Root e os quatro lados têm cobertura
  funcional isolada com fechamento por Escape e retorno de foco.
- Close: o controle icônico do cabeçalho e a ação textual do rodapé preservam
  conteúdo, estilo e nomes acessíveis distintos em Ark/Zag e React/Base UI.

## Decisões

- Nenhum source importa simultaneamente Ark/Zag e Base UI.
- shadcn estrutura e distribui apenas a saída React; Base UI fornece seu comportamento.
- Ark UI fornece as parts do adapter Ark/Zag e Zag permanece transitivo.
- O custo de bundle é medido por saída e não usado para eleger vencedor.

## Validação

Detalhes e números: `evidence/implementation-validation.md`.

- `npm run test:vnext`: passou em 2026-08-28.
- Registry: 22 componentes instalados no consumer real; bundles de todas as
  saídas ficaram dentro dos orçamentos, incluindo Popover Ark/Zag integrado em
  40,38 KiB gzip e React/Base UI em 55,44 KiB gzip.
- Browser: portal, rotas públicas, os quatro placements, foco, Escape, controles
  de fechar independentes, 320/390, dark mode e Axe passaram.
- Artefato integral mais recente: 919 arquivos, 199 páginas HTML e links locais
  íntegros; será repetido no fechamento global.
- Storybook estável: 93 stories em desktop/mobile, 27 Docs dark e zero falhas
  critical/serious de acessibilidade.
- Acessibilidade: 108 execuções WCAG light/dark e 2 do theme playground, zero
  violações.
- Tokens: 0 erros e 0 value drift. O snapshot Figma tinha 17 horas no preflight
  desta rodada; Figma, tokens e Web core não foram alterados.

## Evidência visual

- Desktop: `evidence/web-open-2026-08-28.png`,
  `evidence/ark-open-2026-08-28.png` e `evidence/react-open-2026-08-28.png`.
- Mobile 390px: `evidence/web-open-mobile-390-2026-08-28.png`,
  `evidence/ark-open-mobile-390-2026-08-28.png` e
  `evidence/react-open-mobile-390-2026-08-28.png`.

## Bloqueado antes de

- Commit, push e release: não autorizados.
