# Matriz de paridade — Button

| Dimensão | Web | Ark/Zag | React/Base UI |
|---|---|---|---|
| Semântica | button nativo | `ark.button` nativo | Base UI Button |
| Enter/Space | browser | browser | Base UI/browser |
| Disabled/formulário | atributos nativos | atributos nativos | Base UI |
| Loading | composição CSS TIS | composição do adapter | responsabilidade da recipe/consumer |
| Visual | CSS TIS | CSS e tokens TIS | recipe e tokens TIS |
| Distribuição | pacote core | adapter de workspace | source via shadcn |

Button não exige máquina Zag. Nenhuma saída substitui outra e não há imports cruzados.
