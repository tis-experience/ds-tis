# Comparação das saídas

| Dimensão | Web | Ark/Zag | React/Base UI |
|---|---|---|---|
| Semântica | input nativo | hidden input Zag | hidden input Base UI |
| Estados | CSS pseudo-classes | `data-state` e data attrs | `data-checked`/`data-indeterminate` |
| Formulário | nativo | Zag HiddenInput | Base UI Root hidden input |
| Mixed | DOM `indeterminate` | `checked="indeterminate"` | prop `indeterminate` |
| Visual | tokens Checkbox | adapter tokenizado | registry CSS tokenizado |

Nenhuma saída substitui outra. O resultado compartilha contrato, não implementação.
