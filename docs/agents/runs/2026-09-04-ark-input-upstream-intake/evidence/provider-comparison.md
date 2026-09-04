# Paridade das quatro saídas · Input Text

| Saída | Estado | Source independente | Contrato preservado | Mudança nesta run |
|---|---|---|---|---|
| HTML/CSS/JS | Estável | `css/components/input.css` | Sim | Não |
| Ark/Zag | Beta | `packages/react/src/ark/input.jsx` | Sim | Sim |
| React · shadcn/Base UI | Beta | `registry/tis/input.tsx` | Sim | Não |
| Angular | Beta | `packages/angular/input/src/input.ts` | Sim | Não |

## Evidência Ark

- Edição controlada, limpeza e recuperação de foco: passou.
- Tamanhos 32/40/48px e estados filled/invalid/readonly/disabled: passou.
- Submit nativo com `name`, `required`, `type` e valor: passou.
- Tema claro e escuro: passou.
- Viewports 320px e 390px sem overflow: passou.
- Axe sem violações serious/critical nos cenários publicados: passou.
- Bundle do adapter: 1,33 KiB gzip; preview integrado: 13,26 KiB gzip.

As diferenças de runtime são legítimas. Web usa HTML nativo, Ark usa Factory sobre o mesmo elemento, React mantém a recipe Base UI e Angular mantém ControlValueAccessor. Nenhuma saída importa outra.
