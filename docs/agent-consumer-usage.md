# Uso do DS TIS por agents em projetos consumidores

Este guia é a instrução oficial para agents IA que precisam implementar telas em aplicações consumidoras usando o DS TIS. Ele não substitui `AGENTS.md`, que é voltado para manutenção deste repositório. Aqui o foco é consumo: montar telas reais com a API pública do pacote, sem inventar uma camada oficial que não existe.

Use este guia antes de gerar, revisar ou refatorar qualquer tela em um app consumidor.

## Escopo

O DS TIS é stack-agnóstico. A base pública estável é HTML, CSS e JavaScript distribuídos pelo pacote `ds-tis`. React também possui uma distribuição beta por source registry shadcn para dezesseis componentes validados; o código é copiado para o app consumidor e continua dependente do CSS e dos tokens públicos do DS.

Não apresente `@tis/react` como pacote público. Para React, use o registry somente quando `docs/api/components.json` marcar `implementations.react.status` como `beta`; para Vue, Angular, Svelte ou componentes React ainda indisponíveis, qualquer wrapper continua sendo uma adaptação local do projeto consumidor.

A regra operacional para agents é literal: `nao invente wrappers oficiais`.
Fora do catálogo beta, documente o wrapper como código local da aplicação.

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
- `docs/api/components.json` para componentes, implementações por tecnologia (`implementations.web` e `implementations.react`), readiness, responsabilidade, variantes, tokens consumidos e metadados de runtime JS (`runtime.level`, `runtime.module`, `runtime.init`, `runtime.destroy`, `runtime.events`);
- `docs/api/tokens.json` para camadas Foundation, Semantic e Component;
- páginas HTML dos componentes em `docs/<component>.html`;
- templates em `docs/templates/` e exports `ds-tis/templates/*`, quando o fluxo se aproxima de um padrão já publicado.

Não dependa de memória ou suposições sobre classes. Quando houver dúvida, leia a página do componente e a API JSON.

O tarball inclui o contexto machine-readable. Depois da instalação, leia pelos
exports `ds-tis/metadata`, `ds-tis/metadata/components`,
`ds-tis/metadata/tokens`, `ds-tis/agent-guide`, `ds-tis/agent-guide/en`, `ds-tis/llms` e
`ds-tis/llms-full`, ou diretamente em `node_modules/ds-tis/docs/`. Sem o pacote
instalado, use o fallback público
`https://tis-experience.github.io/ds-tis/docs/api/components.json`.

`ds-tis/metadata` aponta para `consumer-context.json`: um manifesto pequeno com
entrypoints oficiais, tecnologias disponíveis, registry React, versão, fontes de verdade e contrato responsivo. JSON
modules podem exigir import attribute na stack usada; agents e scripts também
podem ler o arquivo diretamente pelo package resolver ou filesystem.

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

Instale a versão corrente pelo npm registry:

```bash
npm install ds-tis
```

A versão estável é instalada por `npm install ds-tis`. Em produção, prefira `"ds-tis": "1.0.0"` no `package.json`; `npm install ds-tis@beta` fica reservado a futuras pré-releases. Fallback por release GitHub: `npm install github:tis-experience/ds-tis#v1.0.0`.

Importe o CSS público uma vez no entrypoint global do app:

```js
import 'ds-tis/css';
```

Para Accordion, Combobox, Modal, Action Menu, Popover, Toast, Tabs e Tooltip, inicialize o comportamento público quando o app renderizar ou hidratar os componentes. Ao desmontar (SPA, rota, portal), chame o `destroy` correspondente para limpar listeners:

```js
import { initAccordions, destroyAccordions } from 'ds-tis/accordion';
import { initComboboxes, destroyComboboxes } from 'ds-tis/combobox';
import { initModals, destroyModals } from 'ds-tis/modal';
import { initActionMenus, destroyActionMenus } from 'ds-tis/menu';
import { initPopovers, destroyPopovers } from 'ds-tis/popover';
import { initToasts, destroyToasts } from 'ds-tis/toast';
import { initTabs, destroyTabs } from 'ds-tis/tabs';
import { initTooltips, destroyTooltips } from 'ds-tis/tooltip';

initAccordions();
initComboboxes();
initModals();
initActionMenus();
initPopovers();
initToasts();
initTabs();
initTooltips();

// ao sair da view / unmount:
destroyAccordions();
destroyComboboxes();
destroyModals();
destroyActionMenus();
destroyPopovers();
destroyToasts();
destroyTabs();
destroyTooltips();
```

Ter módulo `required` não significa automaticamente estar App-ready. Accordion,
Combobox, Modal, Action Menu, Popover, Toast, Tabs e Tooltip concluíram o gate executável da
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

## React beta pelo registry shadcn

O pacote `@tis/react` não é público. Para os dezesseis componentes validados, a API
React é distribuída como source pelo canal versionado
`https://tis-experience.github.io/ds-tis/registry/v1`.

Descubra o catálogo em `ds-tis/metadata/components` ou no fallback público
`docs/api/components.json`. Instale somente quando
`implementations.react.status` for `beta`; use `implementations.react.item` como
nome do item.

Configure o namespace no `components.json` do app:

```json
{
  "registries": {
    "@tis": "https://tis-experience.github.io/ds-tis/registry/v1/{name}.json"
  }
}
```

Depois instale apenas o necessário:

```bash
npx shadcn@latest add @tis/button @tis/field @tis/input
```

O catálogo beta atual contém Accordion, Alert, Badge, Button, Card, Checkbox,
Divider, Form Field, Input Text, Modal, Radio, Skeleton, Spinner, Textarea e
Toggle. Os nomes shadcn de Modal, Form Field, Radio e Toggle são,
respectivamente, `dialog`, `field`, `radio-group` e `switch`. Não deduza essa
tradução: leia `implementations.react.item`.

Não confunda as três saídas da ADR-022. Em
`docs/api/consumer-context.json`, `outputPolicy.outputs` lista HTML/CSS/JS,
Ark/Zag e React/shadcn/Base UI como alternativas coexistentes. A saída React usa
`technologies.react.distribution: "shadcn-registry"`,
`behaviorArchitecture: "base-ui"` e `providerRole: "output-provider"`. Isso não
transforma Base UI em core nem substitui as outras duas saídas. Consulte o status
da saída escolhida; não misture imports ou instruções entre elas.

O source instalado pertence ao app consumidor e pode ser revisado ou composto
localmente. Preserve as classes públicas, o primeiro import global
`@import "ds-tis/css"`, as relações ARIA e as dependências fixadas pelo item.

## Runtime JS por componente

Consulte `docs/api/components.json` antes de importar módulos JS. Cada componente expõe `runtime`:

| Campo | Significado |
|---|---|
| `null` | CSS-only — sem módulo JS publicado. |
| `runtime.level: "required"` | O contrato interativo e acessível depende de init (Accordion, Combobox, Modal, Action Menu, Popover, Toast, Tabs e Tooltip). |
| `runtime.level: "optional"` | Reservado para enhancement que não seja necessário ao contrato acessível; nenhum módulo atual usa este nível. |
| `runtime.module` | Export do pacote (`ds-tis/accordion`, `ds-tis/combobox`, `ds-tis/modal`, `ds-tis/menu`, `ds-tis/popover`, `ds-tis/toast`, `ds-tis/tabs`, `ds-tis/tooltip`). |
| `runtime.init` | Função a chamar após render/hydration (`initAccordions`, `initComboboxes`, `initModals`, `initActionMenus`, `initPopovers`, `initToasts`, `initTabs`, `initTooltips`). |
| `runtime.destroy` | Função a chamar ao desmontar (`destroyAccordions`, `destroyComboboxes`, `destroyModals`, `destroyActionMenus`, `destroyPopovers`, `destroyToasts`, `destroyTabs`, `destroyTooltips`). |
| `runtime.events` | Eventos públicos emitidos pelo módulo (`ds-modal-open`, `ds-combobox-change`, etc.). |

O array `runtimeModules` no topo de `components.json` lista todos os módulos publicados. Não importe JS de componentes com `runtime: null`.

## Contrato responsivo

O DS usa estratégia `intrinsic-first` e não publica breakpoints automáticos.
`publicBreakpoints` é uma lista vazia por design: variantes `sm`, `md`, `lg` ou
`full` são escolhas explícitas do produto, não regras ativadas pela viewport.
Consulte `responsiveContract`, `responsiveProfiles` e o campo `responsive` de
cada componente em `ds-tis/metadata/components`.

- `container`: o componente preserva sua anatomia na largura oferecida; o app mantém grid e reflow;
- `viewport-constrained`: Modal e Tooltip aplicam limites intrínsecos contra a viewport;
- `consumer-managed-horizontal`: Tabs, Breadcrumb e Pagination não removem nem resumem itens; o app decide overflow, redução ou composição alternativa;
- `consumer-selectable-width`: Button oferece escolhas explícitas de largura; o app decide quando usá-las.

O tarball é exercitado em 320×568, 568×320 e 1280×800. Isso prova a fixture de
referência e os limites de overlays; não substitui teste do conteúdo, zoom,
idioma, orientação e layout reais do produto consumidor.

## Regras de implementação

1. Escolha componentes existentes antes de criar markup ad hoc. Consulte `readiness`, `responsibility` e `runtime` em `docs/api/components.json`.
2. Use a anatomia pública do componente conforme documentada. Não use classes internas isoladas como se fossem componentes autônomos.
3. Formulários devem compor `ds-field` com o controle real: `ds-input`, `ds-select`, `ds-textarea`, `ds-combobox`, `ds-checkbox`, `ds-radio` ou `ds-toggle`. Para Input, o campo nativo continua dentro da anatomia pública com `ds-input__field`.
4. Não hardcode `#hex`, `rgb()`, `px` ou `rem` quando existir token, classe, variante ou utilitário público do DS para o mesmo papel.
5. Preserve a cadeia visual do DS. Tokens públicos aparecem como CSS variables `var(--ds-...)`; não invente valores locais para cor, spacing, radius, border, typography ou focus ring sem justificar.
6. Preserve acessibilidade: landmarks semânticos, heading order, labels, `aria-*`, `aria-describedby`, `aria-expanded`, `aria-current`, teclado, estados disabled/error/read-only e focus ring visível.
7. Estados não são decoração. Implemente loading, empty, error, disabled, hover, focus e responsive quando fizerem parte do fluxo esperado.
8. Ícones devem seguir o padrão do projeto consumidor quando houver biblioteca instalada; quando a tela reproduzir exemplos do DS, prefira o mesmo vocabulário visual documentado.
9. Em React, prefira o item oficial quando `implementations.react.status` for `beta`; nos demais casos e em Vue/Angular, declare o wrapper como adaptação local e não invente pacote ou item oficial.
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

React pode instalar os dezesseis componentes beta pelo registry. React fora desse catálogo, Vue e Angular podem renderizar a anatomia pública do DS por meio de componentes locais. Toda adaptação local deve:

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
- docs/api/consumer-context.json (tecnologias e registry)
- docs/api/components.json (implementations, readiness, responsibility e runtime)
- docs/api/tokens.json
- docs/<component>.html dos componentes usados
- docs/templates/ ou ds-tis/templates/* quando houver template aplicavel

Regras:
- Instale via `npm install ds-tis`; durante a beta, fixe a versão exata em produção.
- Importe ds-tis/css uma vez no entrypoint global.
- Para React, quando implementations.react.status for beta, configure @tis em components.json e instale implementations.react.item via shadcn. Nunca invente @tis/react ou um item ausente.
- Para cada componente usado, derive o módulo de `runtime.module` em docs/api/components.json; quando `runtime.level` for required, chame init após render/hydration e destroy antes do unmount.
- Prefira componentes app-ready; trate composition como fronteira explícita do app e não use experimental em fluxo crítico sem registrar a limitação.
- Use ds-tis/theme apenas para requisito real de tema/brand em runtime.
- Escolha componentes existentes antes de criar markup ad hoc.
- Use anatomia publica dos componentes; nao use classes internas isoladas.
- Form controls devem compor ds-field + controle real, como ds-input + ds-input__field.
- Nao hardcode hex/rgb/px/rem quando existir token, classe ou variante publica.
- Preserve landmarks, labels, aria-*, teclado, focus ring e estados disabled/error/read-only.
- Fora do catalogo React beta e em Vue/Angular, adapte a anatomia publica em wrappers locais do app e declare esse limite.

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
- imports e distribuição usados: `ds-tis/css`, módulos JS com `runtime`, itens `@tis/*` do registry, `ds-tis/theme` e/ou `ds-tis/templates/*`;
- classes públicas principais usadas, como `ds-field`, `ds-input` e `ds-input__field`;
- tokens CSS relevantes quando houver customização via `var(--ds-...)`;
- evidência de acessibilidade: labels, landmarks, `aria-*`, teclado, focus ring e contraste quando aplicável;
- estados implementados: default, hover, focus, disabled, error, loading, empty e responsive conforme o fluxo;
- limitações assumidas e gaps que precisam ser tratados no DS ou no produto.

Se um item não se aplica, declare o motivo. Não deixe ausência de estado ou acessibilidade implícita.
