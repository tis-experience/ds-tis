- Status: Approved unchanged

# Spec Figma

- Componente: Checkbox existente; intake de provider sem redesign
- Página/root: `121:2` / `135:8`
- Fontes: snapshot Figma, `docs/checkbox.html`, `css/components/checkbox.css`, `tokens/component/checkbox.json`
- Benchmarks: Checkbox TIS Web, Ark UI Checkbox, Base UI Checkbox e WAI-ARIA APG Checkbox

## Contrato preservado

- Root documental vertical com padding 96 e gap 64 por Semantic.
- Anatomia visual: box, marca checked/mixed e conteúdo de label/description/helper.
- Tamanhos: sm 16px, md 20px e lg 24px, com targets de 32/40/48px.
- Tokens: 38 no JSON e 38 Variables Figma com WEB syntax.
- Semântica, input de formulário e estado pertencem ao runtime; o visual e a API conceitual permanecem agnósticos.
- Nenhum node, property, variable, style ou binding será alterado.

## Validação planejada

- Comparar Web, Ark e React em light/dark, desktop e 320/390 px.
- Exercitar click, Space, checked, mixed, disabled, invalid e serialização de formulário.
- Medir bundle incremental e preservar a instalação React já validada.
- Bloqueado: Figma write, Web core write, commit/push/release.
