# Release

- Status: Em andamento — autorização explícita do owner recebida em 2026-09-05.
- Role: Release Agent
- Checklist: `docs/agents/checklists/release-checklist.md`
- Autorização: o owner respondeu “sim” ao pedido explícito para commitar, enviar,
  abrir/integrar PRs da fila e publicar documentação após os testes. Pediu em
  seguida continuar os componentes Ark/Zag restantes. Figma, versões e npm
  permanecem fora da autorização.

O commit `64539af` reúne o Badge já iniciado, run v3, docs derivadas e resultados tokens-sync verdadeiros. A saída Ark soma 17 componentes no baseline desta branch.

O primeiro comando git add/commit foi rejeitado antes de executar por falta de
autorização Git explícita. A execução foi interrompida e o owner foi consultado;
a nova autorização acima resolve esse bloqueio, sem alterar o escopo técnico.

Pré-commit: build:tokens, sync:docs, build:api, build:llms, verify:tokens e diff --check passaram com exit 0. test:vnext (repetido), test:vnext:browser, QA pontual e validadores da run também passaram. Evidências no relatório 06 e revisão independente.

Após integrar o Alert atualizado (`8368f92`), passaram novamente build de tokens,
docs/API/LLM, verificação de tokens, registry, Astro, Storybook, `test:vnext`,
`test:vnext:browser` e o artefato Pages (1328 arquivos, 264 páginas HTML, links
locais íntegros). O diff em `css/`, `js/` e `tokens/` permanece vazio.

Push, PR e integração serão registrados após execução. `@tis/react` continua beta
privada de workspace, sem instalação npm pública prometida.

Snapshot Figma ausente: JSON↔Figma SKIP, sem evidência fresca de release. HTML tokens-sync ainda depende da correção global coordenada na frente `token_report_truth`; nenhum restauro do relatório antigo foi realizado.
