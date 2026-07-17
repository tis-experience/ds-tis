# Design System Core

[![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0--beta.6-blue)](./CHANGELOG.md) [![Licença](https://img.shields.io/badge/licen%C3%A7a-Propriet%C3%A1ria-red)](./LICENSE)

Design system white-label em CSS puro, com tokens DTCG em arquitetura 3-layer (Foundation/Core → Semantic/System → Component), componentes documentados, modos light/dark e paleta brand única customizável.

## Instalação

O pacote **ainda não está no npm registry**. O caminho oficial de instalação em projetos consumidores é via GitHub:

```bash
npm install github:tis-experience/ds-tis
```

Ou no `package.json`:

```json
{
  "dependencies": {
    "ds-tis": "github:tis-experience/ds-tis#main"
  }
}
```

Pin por tag ou commit SHA quando precisar de versão estável (`#v1.0.0-beta.6`, `#41abe83`, etc.). Publicação no registry (`npm install ds-tis`) fica para quando o owner decidir — ver `docs/backlog.md` e `docs/process-releasing.md`.

Import principal (o nome do pacote continua `ds-tis`):

```js
import 'ds-tis/css';
```

HTML estático ou protótipo sem bundler:

```html
<link rel="stylesheet" href="./node_modules/ds-tis/css/design-system.css">
```

Componentes interativos mantêm CSS puro para a anatomia visual. Para Combobox, Modal e Action Menu o runtime público é **obrigatório** quando usados interativamente (`runtime.level: "required"` em `docs/api/components.json`):

```js
import { initComboboxes } from 'ds-tis/combobox';
import { initModals } from 'ds-tis/modal';
import { initActionMenus } from 'ds-tis/menu';

initComboboxes();
initModals();
initActionMenus();
```

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

## Documentação completa

Toda a documentação vive em `docs/` e pode ser servida como site estático. Lá estão: componentes com preview ao vivo, foundations, guias de tema, acessibilidade e documentação, ADRs navegáveis, inventário de tokens, e consumo por IA em `docs/llms.txt`.

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
