# Uso do DS TIS por agents em projetos consumidores

Este guia é a instrução oficial para agents IA que precisam implementar telas em aplicações consumidoras usando o DS TIS. Ele não substitui `AGENTS.md`, que é voltado para manutenção deste repositório. Aqui o foco é consumo: montar telas reais com a API pública do pacote, sem inventar uma camada oficial que não existe.

Use este guia antes de gerar, revisar ou refatorar qualquer tela em um app consumidor.

## Escopo

O DS TIS é stack-agnóstico. A base pública é HTML, CSS e JavaScript distribuídos pelo pacote `ds-tis`. React, Vue, Angular, Svelte ou outro framework podem encapsular essa base dentro do app consumidor, mas esse encapsulamento é responsabilidade do projeto consumidor.

Não apresente wrappers React/Vue/Angular como API oficial do DS TIS se eles não existem neste repositório.

## Entradas esperadas

Antes de implementar, o agent deve reunir:

- objetivo da tela ou fluxo;
- stack e convenções do projeto consumidor;
- versão instalada do pacote `ds-tis`, quando disponível;
- rotas, layouts, providers e padrões locais já existentes;
- lista de estados esperados: loading, empty, error, disabled, success, read-only, destructive e responsive;
- restrições de acessibilidade, idioma, dados e permissões.

Se essas entradas não estiverem claras, inspecione o projeto primeiro. Pergunte ao owner somente quando a decisão mudar comportamento de produto, dados reais, permissões ou arquitetura local.

## Fontes obrigatórias

Antes de escrever markup novo, consulte as fontes públicas do DS:

- `README.md` para instalação e imports principais;
- `docs/llms.txt` para o índice leve consumível por LLMs;
- `docs/llms-full.txt` para contexto textual completo;
- `docs/api/components.json` para componentes, readiness, responsabilidade, variantes, tokens consumidos e metadados de runtime JS (`runtime.level`, `runtime.module`, `runtime.init`, `runtime.destroy`, `runtime.events`);
- `docs/api/tokens.json` para camadas Foundation, Semantic e Component;
- páginas HTML dos componentes em `docs/<component>.html`;
- templates em `docs/templates/` e exports `ds-tis/templates/*`, quando o fluxo se aproxima de um padrão já publicado.

Não dependa de memória ou suposições sobre classes. Quando houver dúvida, leia a página do componente e a API JSON.

Enquanto o catálogo ainda não fizer parte do tarball npm, consulte a API em
`https://tis-experience.github.io/ds-tis/docs/api/components.json`. Não assuma
que `node_modules/ds-tis/docs/api/` existe.

## Readiness e responsabilidade

Antes de escolher um componente, leia `readiness` e `responsibility` em `docs/api/components.json`:

| Readiness | Uso esperado |
|---|---|
| `app-ready` | Recomendado para aplicações dentro da API pública documentada. |
| `composition` | Público e estável, mas a aplicação mantém orquestração, navegação ou estado entre as partes. |
| `experimental` | Não usar em fluxo crítico sem aceitar explicitamente a limitação em `readinessNotes`. |

`responsibility.model` informa quem mantém o comportamento:

- `native`: use o elemento HTML adequado; o app controla dados e eventos de negócio;
- `presentation`: não há runtime de componente; o app fornece conteúdo e contexto;
- `consumer`: o DS entrega a composição visual, mas o app mantém a orquestração;
- `ds-runtime`: o DS mantém a interação reutilizável; inicialize o módulo indicado em `runtime`.

Não promova localmente um componente Experimental a App-ready. Se o projeto completar um gap com código próprio, declare que ele é uma adaptação local e registre a demanda no DS.

## Imports oficiais

Instale o pacote no projeto consumidor via GitHub (ainda **não** há publish no npm registry):

```bash
npm install github:tis-experience/ds-tis
```

Alternativa no `package.json`: `"ds-tis": "github:tis-experience/ds-tis#main"`. Prefira pin por tag/SHA em produção. Quando o registry existir, a instalação muda para `npm install ds-tis` — até lá, não assuma que o nome solo resolve no npm.

Importe o CSS público uma vez no entrypoint global do app:

```js
import 'ds-tis/css';
```

Para Accordion, Combobox, Modal, Action Menu, Tabs e Tooltip, inicialize o comportamento público quando o app renderizar ou hidratar os componentes. Ao desmontar (SPA, rota, portal), chame o `destroy` correspondente para limpar listeners:

```js
import { initAccordions, destroyAccordions } from 'ds-tis/accordion';
import { initComboboxes, destroyComboboxes } from 'ds-tis/combobox';
import { initModals, destroyModals } from 'ds-tis/modal';
import { initActionMenus, destroyActionMenus } from 'ds-tis/menu';
import { initTabs, destroyTabs } from 'ds-tis/tabs';
import { initTooltips, destroyTooltips } from 'ds-tis/tooltip';

initAccordions();
initComboboxes();
initModals();
initActionMenus();
initTabs();
initTooltips();

// ao sair da view / unmount:
destroyAccordions();
destroyComboboxes();
destroyModals();
destroyActionMenus();
destroyTabs();
destroyTooltips();
```

Ter módulo `required` não significa automaticamente estar App-ready. Accordion,
Combobox, Modal, Action Menu, Tabs e Tooltip concluíram o gate executável da
ADR-020. Seus módulos continuam obrigatórios quando os componentes forem usados,
pois mantêm o contrato interativo e acessível publicado.

No Combobox App-ready, o foco DOM permanece no input enquanto as setas atualizam
`aria-activedescendant`; `Escape` fecha o listbox sem remover esse foco. O evento
`ds-combobox-change` expõe `value`, `input`, `root` e a `option` selecionada em
`detail`.

No Modal App-ready, apenas os irmãos fora do caminho do diálogo recebem `inert`;
o runtime preserva e restaura o estado anterior de cada nó. `ds-modal-open` e
`ds-modal-close` expõem overlay, dialog e a referência de foco relevante em
`detail`.

No Action Menu App-ready, `menuitem`, `menuitemradio` e `menuitemcheckbox` fazem
parte do contrato. Itens `aria-disabled` permanecem alcançáveis pelo foco, mas
não ativam nem fecham o menu; typeahead, setas, Home/End e Escape são mantidos
pelo runtime.

No Tabs App-ready, o runtime mantém exatamente um tab no fluxo de foco, ignora
tabs disabled nas setas/Home/End, sincroniza `aria-selected` com `hidden` nos
painéis e garante entrada de foco no tabpanel selecionado. Botões de tab sem
`type` explícito são normalizados para `type="button"`, evitando submit acidental
quando o componente está dentro de um formulário. `ds-tabs-change` expõe root,
tab, panel e tab anterior em `detail`.

No Tooltip App-ready, o runtime assegura `role="tooltip"`, ID e
`aria-describedby` válidos mesmo quando o markup omite esses atributos. Foco e
hover abrem sem mover o foco DOM; blur e saída conjunta fecham; Escape mantém o
conteúdo dispensado até pointer/foco saírem. A área de conteúdo permanece
hoverable conforme WCAG 1.4.13. `ds-tooltip-show` e `ds-tooltip-hide` expõem root,
trigger e content em `detail`.

Para customização de tema, use o theme engine público:

```js
import { applyTheme, toCssSnippet } from 'ds-tis/theme';
```

Quando fizer sentido partir de um template, use os exports publicados:

```js
import loginTemplate from 'ds-tis/templates/login.html?raw';
```

O caminho `ds-tis/templates/*` referencia templates HTML públicos. Adapte conteúdo, rotas e dados ao app consumidor; não copie textos fictícios para produção.

## Runtime JS por componente

Consulte `docs/api/components.json` antes de importar módulos JS. Cada componente expõe `runtime`:

| Campo | Significado |
|---|---|
| `null` | CSS-only — sem módulo JS publicado. |
| `runtime.level: "required"` | O contrato interativo e acessível depende de init (Accordion, Combobox, Modal, Action Menu, Tabs e Tooltip). |
| `runtime.level: "optional"` | Reservado para enhancement que não seja necessário ao contrato acessível; nenhum módulo atual usa este nível. |
| `runtime.module` | Export do pacote (`ds-tis/accordion`, `ds-tis/combobox`, `ds-tis/modal`, `ds-tis/menu`, `ds-tis/tabs`, `ds-tis/tooltip`). |
| `runtime.init` | Função a chamar após render/hydration (`initAccordions`, `initComboboxes`, `initModals`, `initActionMenus`, `initTabs`, `initTooltips`). |
| `runtime.destroy` | Função a chamar ao desmontar (`destroyAccordions`, `destroyComboboxes`, `destroyModals`, `destroyActionMenus`, `destroyTabs`, `destroyTooltips`). |
| `runtime.events` | Eventos públicos emitidos pelo módulo (`ds-modal-open`, `ds-combobox-change`, etc.). |

O array `runtimeModules` no topo de `components.json` lista todos os módulos publicados. Não importe JS de componentes com `runtime: null`.

## Regras de implementação

1. Escolha componentes existentes antes de criar markup ad hoc. Consulte `readiness`, `responsibility` e `runtime` em `docs/api/components.json`.
2. Use a anatomia pública do componente conforme documentada. Não use classes internas isoladas como se fossem componentes autônomos.
3. Formulários devem compor `ds-field` com o controle real: `ds-input`, `ds-select`, `ds-textarea`, `ds-combobox`, `ds-checkbox`, `ds-radio` ou `ds-toggle`. Para Input, o campo nativo continua dentro da anatomia pública com `ds-input__field`.
4. Não hardcode `#hex`, `rgb()`, `px` ou `rem` quando existir token, classe, variante ou utilitário público do DS para o mesmo papel.
5. Preserve a cadeia visual do DS. Tokens públicos aparecem como CSS variables `var(--ds-...)`; não invente valores locais para cor, spacing, radius, border, typography ou focus ring sem justificar.
6. Preserve acessibilidade: landmarks semânticos, heading order, labels, `aria-*`, `aria-describedby`, `aria-expanded`, `aria-current`, teclado, estados disabled/error/read-only e focus ring visível.
7. Estados não são decoração. Implemente loading, empty, error, disabled, hover, focus e responsive quando fizerem parte do fluxo esperado.
8. Ícones devem seguir o padrão do projeto consumidor quando houver biblioteca instalada; quando a tela reproduzir exemplos do DS, prefira o mesmo vocabulário visual documentado.
9. Não invente wrappers oficiais. Em React/Vue/Angular, crie componentes locais do app apenas como adaptação da anatomia pública e declare esse limite.
10. Não altere tokens, CSS gerado ou documentação do DS a partir do projeto consumidor. Se encontrar gap real, registre a limitação e abra demanda para o DS.

## Fluxo recomendado

1. Leia o pedido, identifique a stack e encontre o entrypoint global onde `ds-tis/css` deve ser importado.
2. Faça inventário das partes da tela: navegação, formulário, feedback, cards, overlays, listas, loading, empty states e ações.
3. Mapeie cada parte para componentes DS existentes e confira readiness. Só use markup local quando o DS não tiver componente adequado.
4. Consulte a página HTML do componente e `docs/api/components.json` antes de escrever a anatomia.
5. Implemente com classes públicas do DS, sem copiar classes internas fora do contexto do componente.
6. Inicialize módulos JS quando `components.json` indicar `runtime` — `required` sempre; `optional` quando a tela precisar de teclado, overlay ou focus management completo.
7. Aplique tema com `ds-tis/theme` somente quando a tela tiver requisito de brand/mode em runtime.
8. Rode os testes e linters do projeto consumidor. Quando possível, valide acessibilidade com axe, Playwright, browser real ou ferramenta equivalente.
9. Entregue evidências: componentes usados, imports, tokens/classes relevantes, validação a11y e limites assumidos.

## Adaptação por framework

React, Vue e Angular podem renderizar a anatomia pública do DS por meio de componentes locais. Essa adaptação deve:

- manter os nomes de classes públicas do DS;
- preservar labels, IDs, `aria-*` e relações `for`/`id`;
- expor props locais alinhadas ao produto, não prometer API oficial do DS;
- manter inicialização de módulos JS depois do render/hydration quando necessário;
- evitar recriar comportamento complexo quando o DS já exporta helper público, como `ds-tis/combobox`.

Exemplo de limite correto: "Criei `AppTextField` no app consumidor usando `ds-field` + `ds-input`; isso é wrapper local do app, não componente oficial exportado por `ds-tis`."

## Prompt curto para agent consumidor

Copie este bloco para iniciar um agent que vai implementar uma tela usando o DS TIS em um projeto consumidor:

```text
Role: Agent consumidor do DS TIS.

Artefato de entrada:
- Pedido da tela/fluxo.
- Stack do projeto consumidor.
- Arquivos atuais do app que definem layout, estilos globais, rotas e componentes locais.
- Versao instalada de ds-tis, se existir.

Fontes obrigatorias:
- README.md
- docs/llms.txt
- docs/llms-full.txt
- docs/api/components.json (readiness, responsibility e runtime)
- docs/api/tokens.json
- docs/<component>.html dos componentes usados
- docs/templates/ ou ds-tis/templates/* quando houver template aplicavel

Regras:
- Instale via github:tis-experience/ds-tis (pacote ainda nao esta no npm registry).
- Importe ds-tis/css uma vez no entrypoint global.
- Para cada componente usado, derive o módulo de `runtime.module` em docs/api/components.json; quando `runtime.level` for required, chame init após render/hydration e destroy antes do unmount.
- Prefira componentes app-ready; trate composition como fronteira explícita do app e não use experimental em fluxo crítico sem registrar a limitação.
- Use ds-tis/theme apenas para requisito real de tema/brand em runtime.
- Escolha componentes existentes antes de criar markup ad hoc.
- Use anatomia publica dos componentes; nao use classes internas isoladas.
- Form controls devem compor ds-field + controle real, como ds-input + ds-input__field.
- Nao hardcode hex/rgb/px/rem quando existir token, classe ou variante publica.
- Preserve landmarks, labels, aria-*, teclado, focus ring e estados disabled/error/read-only.
- Em React/Vue/Angular, adapte a anatomia publica em wrappers locais do app; nao invente wrappers oficiais do DS TIS.

Saida esperada:
- Arquivos alterados.
- Componentes DS usados e por que foram escolhidos.
- Imports DS adicionados.
- Tokens/classes publicas relevantes.
- Evidencia de acessibilidade e teclado.
- Limites assumidos ou gaps do DS que precisam virar demanda.

Bloqueado antes de:
- Criar API oficial do DS que nao existe.
- Alterar tokens ou CSS do pacote ds-tis dentro do app consumidor.
- Trocar componente DS existente por markup ad hoc sem justificar.
- Remover labels, aria-* ou focus ring.
```

## Checklist de entrega

Antes de concluir, o agent deve reportar:

- componentes DS usados e componentes descartados;
- readiness e responsabilidade dos componentes usados;
- imports adicionados: `ds-tis/css`, módulos JS com `runtime` em `components.json`, `ds-tis/theme` e/ou `ds-tis/templates/*`;
- classes públicas principais usadas, como `ds-field`, `ds-input` e `ds-input__field`;
- tokens CSS relevantes quando houver customização via `var(--ds-...)`;
- evidência de acessibilidade: labels, landmarks, `aria-*`, teclado, focus ring e contraste quando aplicável;
- estados implementados: default, hover, focus, disabled, error, loading, empty e responsive conforme o fluxo;
- limitações assumidas e gaps que precisam ser tratados no DS ou no produto.

Se um item não se aplica, declare o motivo. Não deixe ausência de estado ou acessibilidade implícita.
