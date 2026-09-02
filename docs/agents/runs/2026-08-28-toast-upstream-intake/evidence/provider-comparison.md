# Comparação de providers

| Dimensão | Web | Ark/Zag | Base UI |
|---|---|---|---|
| Manager | controller DS | createToaster | createToastManager |
| Live region | polite/assertive explícitas | máquina Zag | Provider/Viewport |
| Limite | remove mais antigo | fila acima do max | mantém limited inert |
| Hotkey | Escape no Toast focado | Alt+T padrão | F6 padrão |
| Action | até 2 no Web | uma action nativa | uma action nativa |
| Visual | canônico | classes/tokens TIS | classes/tokens TIS |

Diferenças documentadas permanecem internas aos managers. A API pública inicial limita adapters a uma action para paridade entre Ark e Base; o Web continua aceitando até duas sem regressão.
