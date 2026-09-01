- Status: Approved unchanged

# Spec Figma

- Componente: Toast existente; intake de providers sem redesign
- Página/root: `10279:2544` / `10279:2545`
- Fontes: Figma snapshot, `docs/toast.html`, `css/components/toast.css`, `js/toast.js`, `tokens/component/toast.json`
- Benchmarks: Web TIS, Ark UI Toast 5.37.2/Zag 1.41.2 e Base UI Toast 1.6.0

## Contrato preservado

- Root documental vertical, padding 96 e gap 64 por Semantic.
- Anatomia visual: icon, content, title, description, actions e close.
- Variants: quatro tipos e dois estilos; content/action/close opcionais conforme composição.
- Tokens: 58 no JSON, 57 Variables Figma com WEB syntax; shadow permanece CSS-only.
- Live region e manager pertencem ao runtime, não ao componente visual Figma.
- Nenhum node, property, variable, style ou binding será alterado.

## Validação planejada

- Comparar Web, Ark e React em light/dark, desktop e 320/390 px.
- Exercitar anúncio, criação, action, close, timeout, pausa, limite e foco.
- Medir bundle incremental e instalar a receita React em consumer Vite real.
- Bloqueado: Figma write, Web core write, commit/push/release.
