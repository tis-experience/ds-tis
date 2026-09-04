# Contrato atual · Input Text

- Fonte visual: componente Input Text já refletido no repositório; nenhuma mudança de Figma ou token nesta run.
- Anatomia pública: `.ds-field` compõe label, indicador obrigatório, `.ds-input`, controle nativo e mensagem associada.
- Tamanhos: `sm` 32px, `md` 40px e `lg` 48px, conforme `css/components/input.css`.
- Estados: default, hover, focused, filled, invalid, readonly e disabled.
- Semântica: `label` associado por `for/id`, `aria-describedby`, `aria-invalid`, `required`, `readonly` e `disabled` permanecem no `input` nativo.
- Composição: ícones são decorativos e não substituem label; submit usa `name`, `type` e valor nativos.
- Preservado: HTML/CSS/JS estável, recipe React/Base UI e componente Angular, sem imports cruzados.

O snapshot Figma disponível tinha sete dias no preflight. Ele foi tratado como histórico e não foi usado para afirmar uma auditoria visual nova. O owner determinou que o Figma permanecesse inalterado neste incremento.
