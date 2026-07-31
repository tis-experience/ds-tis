# Matriz de contrato — Accordion vNext

> O contrato cross-stack descreve capacidades do DS. Cada adapter traduz essas
> capacidades para os tipos idiomáticos da tecnologia sem expor Ark ou Zag.

| part | targetNode | figmaProperty | componentProperty | componentToken | semanticAlias | modelEvidence | validation | exception |
|---|---|---|---|---|---|---|---|---|
| Root mode | runtime Root | documentação de comportamento | `mode: single \| multiple` | n/a | n/a | Zag Accordion `multiple`; draft Figma `8:21` | single permite um item; multiple permite vários | none |
| Root collapsible | runtime Root | documentação de comportamento | `collapsible: boolean` | n/a | n/a | v1 `js/accordion.js`; Zag Accordion `collapsible`; draft `8:21` | default `true` mantém compatibilidade com a v1 | none |
| Root controlled state | runtime Root | documentação de comportamento | `expandedItems: string[]` | n/a | n/a | Zag Accordion `value`; draft `10:57` | adapter não expõe o objeto `details` do provider | none |
| Root uncontrolled state | runtime Root | documentação de comportamento | `defaultExpandedItems: string[]` | n/a | n/a | Zag Accordion `defaultValue`; draft `10:57` | estado inicial funciona sem controle externo | none |
| Root change event | runtime Root | documentação de comportamento | `onExpandedItemsChange(ids)` | n/a | n/a | Zag Accordion `onValueChange`; draft `10:57` | callback recebe somente lista de IDs | none |
| Root disabled | runtime Root | documentação de comportamento | `disabled: boolean` | n/a | n/a | Accordion publicado `State=Disabled`; Zag Root `disabled` | triggers disabled são ignorados na navegação por setas | none |
| Root heading | runtime Root | documentação de acessibilidade | `headingLevel: 2..6` | n/a | n/a | WAI-ARIA Accordion; draft `10:63` | trigger fica dentro do heading configurado | none |
| Root landmark | runtime Panel | documentação de acessibilidade | `landmark: boolean ou nome acessível` | n/a | n/a | WAI-ARIA Accordion; draft `10:63` | `role=region` somente por opt-in | none |
| Item identity | runtime Item | exemplo por tecnologia | `itemId: string` | n/a | n/a | Zag Item `value`; draft corrigido `10:57` e `10:60` | um único nome público em spec, exemplo e adapter | none |
| Trigger content | visual Trigger | `Title`, `Show Leading Icon`, `Leading Icon` | label + slot visual opcional | `component.accordion.trigger.*`; `component.accordion.leading-icon.*` | aliases Semantic atuais | component set publicado `8519:3845`; instâncias `9:165` a `9:259` | adapter renderiza classes e anatomia TIS sem expor Ark | none |
| Indicator | visual Chevron | `Open` | interno, não configurável no primeiro contrato | `component.accordion.chevron.*` | aliases `semantic.icon.*` atuais | component set publicado `8519:3845` | rotação acompanha `aria-expanded` | none |
| Panel content | visual Content | `Content`, `Content Slot` | slot de conteúdo livre | `component.accordion.content.*` | aliases Semantic atuais | component set publicado `8519:3845`; draft `10:57` | aceita conteúdo e componentes TIS sem markup imposto | none |
