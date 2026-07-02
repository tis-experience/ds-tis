# Design System Core

[![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0--beta.5-blue)](./CHANGELOG.md) [![Licença](https://img.shields.io/badge/licen%C3%A7a-Propriet%C3%A1ria-red)](./LICENSE)

Design system white-label em CSS puro, com tokens DTCG em arquitetura 3-layer (Foundation/Core → Semantic/System → Component), componentes documentados, modos light/dark e paleta brand única customizável.

## Instalação

```html
<link rel="stylesheet" href="https://cdn.example.com/ds-tis@1.0.0-beta.5/css/design-system.css">
```

Uso local:

```bash
git clone <repo-url>
cd ds-tis
npm install
npm run build:tokens
```

Depois serve o diretório estático (`python3 -m http.server` ou equivalente).

## Documentação completa

Toda a documentação vive em `docs/` e pode ser servida como site estático. Lá estão: componentes com preview ao vivo, foundations, guias de tema, acessibilidade e documentação, ADRs navegáveis, inventário de tokens, e consumo por IA em `docs/llms.txt`.

Links rápidos:

- [Getting Started](./index.html)
- [Token Architecture](./docs/token-architecture.html)
- [Documentation Guidelines](./docs/documentation-guidelines.html)
- [Component Inventory](./docs/component-inventory.md)
- [Decisões (ADRs)](./docs/decisions/)
- [Changelog](./CHANGELOG.md)
- [Como contribuir](./CONTRIBUTING.md)
- [Instruções para agentes IA](./AGENTS.md) — canônico (Claude Code, Codex, Gemini, Cursor, etc.)
- [Integrações para agentes IA](./docs/agent-integrations.md) — Figma, GitHub, MCPs e adapters locais

## Licença

Licença proprietária. Todos os direitos reservados. Ver [LICENSE](./LICENSE).
