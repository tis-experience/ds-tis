# scripts/archive — scripts históricos preservados

Arquivos aqui rodaram uma vez só, cumpriram um propósito específico, e ficaram preservados apenas como referência. Não estão em `package.json` e não devem ser usados no fluxo normal.

## `extract-tokens.js`

**O que fez:** migração de tokens CSS escritos à mão para o formato DTCG em JSON. Leu `css/tokens/foundation.css`, `theme-light.css`, `theme-dark.css` (arquivos legados) e escreveu `tokens/foundation/*.json`, `tokens/semantic/light.json`, `tokens/semantic/dark.json`.

**Quando rodou:** 0.2.0 (fevereiro de 2026), durante a transição para a arquitetura DTCG (ADR-001).

**Por que preservado:** referência histórica. Se for necessário extrair tokens novamente de arquivos CSS herdados em alguma migração futura, esse script pode servir de base.

## `add-i18n-shell.mjs`

**O que fez:** adicionou o boilerplate de internacionalização (spans `data-lang`, seletor PT/EN, script anti-FOUC) em todos os HTMLs do `docs/`.

**Quando rodou:** 0.5.0 (abril de 2026), quando o site virou bilíngue.

**Por que preservado:** referência. Se o site ganhar novas páginas ou um terceiro idioma, a lógica aqui é o ponto de partida.
