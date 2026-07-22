# Design System Core

[![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-blue)](./CHANGELOG.md) [![Licença](https://img.shields.io/badge/licen%C3%A7a-Propriet%C3%A1ria-red)](./LICENSE)

Design system white-label em CSS puro, com tokens DTCG em arquitetura 3-layer (Foundation/Core → Semantic/System → Component), componentes documentados, modos light/dark e paleta brand única customizável.

## Instalação

O pacote estável é distribuído pelo npm registry. Instale a versão corrente com:

```bash
npm install ds-tis
```

`npm install ds-tis` resolve a dist-tag estável `latest`. O comando
`npm install ds-tis@beta` fica reservado para testar futuras pré-releases e não
deve substituir a versão estável em produção.

Em produção, prefira o pin exato:

```json
{
  "dependencies": {
    "ds-tis": "1.0.0"
  }
}
```

Como fallback, o mesmo release pode ser instalado pela tag GitHub: `npm install github:tis-experience/ds-tis#v1.0.0`.

Import principal (o nome do pacote continua `ds-tis`):

```js
import 'ds-tis/css';
```

HTML estático ou protótipo sem bundler:

```html
<link rel="stylesheet" href="./node_modules/ds-tis/css/design-system.css">
```

Componentes interativos mantêm CSS puro para a anatomia visual. Quando
`runtime.level` é `required` em `docs/api/components.json`, o módulo público é
**obrigatório** para cumprir o contrato interativo e acessível. Os runtimes atuais
são Accordion, Combobox, Modal, Action Menu, Tabs e Tooltip:

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

// ao desmontar a view/subtree:
destroyAccordions();
destroyComboboxes();
destroyModals();
destroyActionMenus();
destroyTabs();
destroyTooltips();
```

Accordion, Combobox, Modal, Action Menu, Tabs e Tooltip concluíram o gate
executável da ADR-020 e estão **App-ready**. Seus módulos continuam obrigatórios
quando os componentes forem usados, pois mantêm o contrato interativo e
acessível publicado.

O pacote também exporta o theme engine e templates HTML:

```js
import { applyTheme, toCssSnippet } from 'ds-tis/theme';
```

Desenvolvimento local do próprio DS:

```bash
git clone https://github.com/tis-experience/ds-tis.git
cd ds-tis
npm install
npm run build:all
```

Depois sirva o diretório estático (`python3 -m http.server` ou equivalente). Docs públicas: [GitHub Pages](https://tis-experience.github.io/ds-tis/).

### Storybook

O catálogo interativo cobre os 23 componentes públicos usando o CSS e os runtimes reais do pacote:

```bash
npm run storybook
```

Para validar o catálogo e gerar o build estático:

```bash
npm run test:storybook
npm run build:storybook
```

O Storybook publicado fica disponível em [tis-experience.github.io/ds-tis/storybook/](https://tis-experience.github.io/ds-tis/storybook/).

## Documentação completa

Toda a documentação vive em `docs/` e pode ser servida como site estático. Lá estão: componentes com preview ao vivo, foundations, guias de tema, acessibilidade e documentação, ADRs navegáveis, inventário de tokens, e consumo por IA em `docs/llms.txt`.

O pacote também distribui contexto machine-readable para ferramentas e agents:
`ds-tis/metadata` (manifesto de consumo), `ds-tis/metadata/components`,
`ds-tis/metadata/tokens`, `ds-tis/metadata/release-evidence`,
`ds-tis/agent-guide`, `ds-tis/llms` e `ds-tis/llms-full`. O manifesto declara a estratégia responsiva
`intrinsic-first`: não há breakpoints públicos automáticos; layout, densidade e
troca de composição pertencem ao app consumidor.

Antes de usar um componente em fluxo crítico, consulte seu `readiness` na
[API pública de componentes](https://tis-experience.github.io/ds-tis/docs/api/components.json)
ou no inventário: `app-ready` é recomendado para aplicações, `composition`
mantém orquestração no app e `experimental` ainda possui gaps declarados em
`readinessNotes`.

Links rápidos:

- [Getting Started](./index.html)
- [Token Architecture](./docs/token-architecture.html)
- [Documentation Guidelines](./docs/documentation-guidelines.html)
- [Guia para agents consumidores](./docs/agent-consumer-usage.html) — como implementar telas em projetos consumidores usando o DS TIS
- [Component Inventory](./docs/component-inventory.md)
- [Decisões (ADRs)](./docs/decisions/)
- [Changelog](./CHANGELOG.md)
- [Como contribuir](./CONTRIBUTING.md)
- [Instruções para agentes IA](./AGENTS.md) — canônico (Claude Code, Codex, Gemini, Cursor, etc.)
- [Integrações para agentes IA](./docs/agent-integrations.md) — Figma, GitHub, MCPs e adapters locais

## Licença

Licença proprietária. Todos os direitos reservados. Ver [LICENSE](./LICENSE).
