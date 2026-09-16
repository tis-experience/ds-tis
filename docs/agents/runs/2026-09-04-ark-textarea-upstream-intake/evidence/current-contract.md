# Contrato atual

- CSS: `css/components/textarea.css` e `form-field.css`, sem alterações.
- Anatomia: `.ds-field` com label e helper/error; `.ds-textarea` hospeda `.ds-textarea__field`; contador externo opcional.
- sm/md/lg: altura mínima, tipografia e padding por tokens existentes.
- Estados: preenchido, inválido, readonly, disabled e foco via :focus-within.
- Semântica: textarea nativo, quebras de linha, maxlength, name/value, required, aria-invalid/describedby e resize vertical. Disabled não recebe foco nem é serializado; readonly permite seleção.
- Repositório é a baseline da migração; Figma não foi reinspecionado nesta run.
