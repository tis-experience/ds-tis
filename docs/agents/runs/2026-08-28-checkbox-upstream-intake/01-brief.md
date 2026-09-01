- Status: Approved

# Brief proposto

- Nome: Checkbox
- Classe: form control de seleção binária ou tri-state
- Problema: Web/Figma e React/Base UI já possuem contrato, mas a saída Ark/Zag ainda não é consumível.
- Usar quando: zero, uma ou várias opções independentes podem ser selecionadas; ou para aceite binário com label visível.
- Não usar quando: a escolha é mutuamente exclusiva (Radio) ou a mudança liga/desliga algo imediatamente (Toggle).
- Acessibilidade: label acessível, `aria-checked` true/false/mixed, Space, input de formulário, disabled, required, invalid, description/helper e focus ring visível.
- Anatomia: root/label, control, indicator, content, title, description, helper e hidden input.
- Estados/tamanhos: unchecked, checked, indeterminate, hover, focus, disabled, invalid; sm, md e lg.
- Tokens: reutilizar 38 tokens de `tokens/component/checkbox.json`; 38 Variables Figma; zero token novo.
- Figma: página `121:2`, root `135:8`, `issueCount=0`; unchanged with evidence.
- Escopo repo: adapter Ark, story, export, mapa, rotas Astro, testes de browser/bundle e documentação das três saídas.
- Fora de escopo: alterar Figma, tokens, CSS/markup/runtime Web, contrato React existente, commit, push ou release.
- Aprovação: owner autorizou execução contínua componente a componente preservando Figma e Web.
