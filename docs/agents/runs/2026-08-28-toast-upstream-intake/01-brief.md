- Status: Approved

# Brief proposto

- Nome: Toast
- Classe: feedback transitório global, não modal
- Problema: Web/Figma já possuem contrato completo, mas Ark/Zag e React/shadcn/Base UI ainda não entregam uma saída consumível.
- Usar quando: confirmar resultado de uma ação ou comunicar estado assíncrono sem interromper o fluxo.
- Não usar quando: a mensagem exige decisão antes de continuar, conteúdo persistente na página ou correção junto ao campo.
- Diferenças: Alert permanece no layout; Modal exige atenção; Tooltip explica um alvo; Toast é transitório e global.
- Acessibilidade: live region polite para info/success/warning, prioridade alta para error, pausa em hover/focus, close acessível, action focável, Escape quando o foco estiver no Toast e hotkey do provider preservada.
- Anatomia: region/viewport, root, feedback icon, content, title, description, actions e close.
- Variants/states: success, warning, error, info; subtle e solid; open/closed, paused, action e close.
- Tokens: reutilizar 58 tokens em `tokens/component/toast.json`; 57 variables Figma e shadow CSS-only; zero token novo.
- Figma: página `10279:2544`, root `10279:2545`, `issueCount=0`; unchanged with evidence.
- Escopo repo: adapters Ark e Base UI, stories, registry, rotas Astro, consumer e gates de browser/bundle.
- Fora de escopo: alterar Figma, tokens, CSS/JS Web, anchored toasts, swipe customizado, promise API pública, commit, push ou release.
- Aprovação: owner autorizou execução contínua componente a componente preservando Figma e Web.
