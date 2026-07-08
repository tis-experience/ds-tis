# Design System Core

[![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0--beta.6-blue)](./CHANGELOG.md) [![Licença](https://img.shields.io/badge/licen%C3%A7a-Propriet%C3%A1ria-red)](./LICENSE)

Design system white-label em CSS puro, com tokens DTCG em arquitetura 3-layer (Foundation/Core → Semantic/System → Component), componentes documentados, modos light/dark e paleta brand única customizável.

## Instalação

Como dependência do projeto:

```bash
npm install ds-tis
```

Import principal:

```js
import 'ds-tis/css';
```

HTML estático ou protótipo sem bundler:

```html
<link rel="stylesheet" href="./node_modules/ds-tis/css/design-system.css">
```

Componentes interativos mantêm CSS puro para a anatomia visual. Quando precisar do comportamento de Combobox:

```js
import { initComboboxes } from 'ds-tis/combobox';

initComboboxes();
```

O pacote também exporta o theme engine e templates HTML:

```js
import { applyTheme, toCssSnippet } from 'ds-tis/theme';
```

Uso local:

```bash
git clone <repo-url>
cd ds-tis
npm install
npm run build:all
```

Depois sirva o diretório estático (`python3 -m http.server` ou equivalente).

## Documentação completa

Toda a documentação vive em `docs/` e pode ser servida como site estático. Lá estão: componentes com preview ao vivo, foundations, guias de tema, acessibilidade e documentação, ADRs navegáveis, inventário de tokens, e consumo por IA em `docs/llms.txt`.

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
