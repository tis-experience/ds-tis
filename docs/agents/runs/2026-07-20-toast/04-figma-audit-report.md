# Figma Audit Report — Toast

- Status: aprovado com ressalvas (owner autorizou seguir e ajustar depois)
- Role: Figma Auditor (read-only pós-build)
- Data: 2026-07-20

## Checagens

| Check | Resultado |
|-------|-----------|
| topLevelCount=1 | OK |
| Frame raiz nomeado Toast | OK |
| Seções ordenadas, 0 loose | OK |
| Component → Semantic (amostra Success) | OK (`toast/bg|border|padding|gap|radius`) |
| Lucide icons (não Placeholder/glyph) | OK |
| Texts com componentPropertyReferences | OK (Title, Description) |
| Booleans ligados a visible | OK (Show Description/Action/Close) |
| Instance swaps Icon/Close | OK |
| Action Label wired a Button | FAIL menor — documentado; não bloqueia repo |
| Style Filled ausente | OK (exceção MVP) |
| ALL_SCOPES | não observado nas vars novas |

## Veredito

Apto para Token Sync / Repo com as ressalvas acima. Owner: “pode fazer, depois ajustamos”.
