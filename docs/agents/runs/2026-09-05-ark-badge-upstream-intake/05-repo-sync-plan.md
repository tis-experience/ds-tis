# Token Sync — não aplicável

- Status: Approved unchanged — nenhum token alterado.

Nenhuma escrita em `tokens/`, `css/` ou `js/`. O adapter aplica apenas classes públicas `ds-badge`, `ds-badge--<tone>`, `ds-badge--<variant>`. O CSS já consome tokens `--ds-badge-*` para gap, padding, radius, tipografia, foreground e background.

Regenerar somente API e portal/Storybook necessários à saída Ark. Executar `verify:tokens` e preservar o resultado verdadeiro, com Figma SKIP se snapshot ausente.
