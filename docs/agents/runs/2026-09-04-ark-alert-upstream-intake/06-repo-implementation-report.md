# Implementação

Status: validado localmente. Ark Factory expõe partes independentes com refs e classes públicas TIS. Aplicação controla visibilidade e retorno de foco ao dispensar. role=status por padrão; role=alert opt-in para mensagens urgentes.

- Builds Astro/Storybook e test:vnext passaram; bundle dentro do limite de 5 KiB gzip (React externo).
- test:vnext:browser passou após atualizar expectativas do catálogo para a saída Ark disponível. O teste abre as quatro rotas de Alert, confere anatomia/preview em 390px e dispensa a mensagem real.
- Ação, fechamento via Enter, retorno de foco, reabertura, quatro tons × solid/subtle em claro/escuro e 320px/Axe passaram.
- Cinco capturas visuais revisadas em evidence: anatomia alinhada, cores herdadas do CSS TIS, sem recortes.
- verify:tokens: 1.595 tokens, zero erros; Figma omitido por ausência de snapshot. Nenhum diff em tokens ou CSS.
- Pages: 1.293 arquivos, 254 HTML, links locais íntegros.
