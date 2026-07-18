# Como contribuir

Este é um extrato bilíngue-amigável do [CONTRIBUTING.md](../CONTRIBUTING.md) na raiz do repo, formatado para leitura no site de documentação. Quando divergirem, a fonte é o CONTRIBUTING.md.

## Setup local

Requisitos: Node.js 20+, git, SSH configurado com o GitHub.

```bash
git clone <repo-url>
cd ds-tis
npm install
npm run build:tokens
```

Para ver o site localmente:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000/`.

## Fluxo de mudança

1. Abra issue descrevendo o que quer mudar e por quê.
2. Crie branch: `git checkout -b feat/nome-curto`.
3. Faça a mudança.
4. Confira o [checklist de pré-commit](#checklist-pré-commit).
5. Abra PR contra `main`.

## Convenções de commit

Conventional Commits em português. Prefixos: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`, `ci`.

Exemplo:

```
fix(input): corrigir alinhamento do ícone trailing em sm

- Ajusta margem direita para usar space/control/padding-x
- Valida em docs/input.html

Co-Authored-By: ...
```

## Checklist de pré-commit

- [ ] `npm run build:tokens` sem erro.
- [ ] `npm run sync:docs` regenera os três MDs em `docs/`.
- [ ] `npm run verify:tokens` sem divergências novas.
- [ ] Mudança registrada em `CHANGELOG.md` na seção `[Não publicado]` se for observável para o consumidor.
- [ ] ADR novo ou atualizado em `docs/decisions/` se a mudança toca em decisão arquitetural.

## Quando abrir um ADR

Abra um ADR quando a mudança:

- Altera a arquitetura de tokens.
- Introduz ou remove convenção de naming.
- Muda a relação entre Figma, JSON e CSS.
- Afeta acessibilidade de forma sistêmica.
- Adiciona dependência nova.

Para correções pontuais de componente ou ajustes visuais, não precisa de ADR.

Template em `docs/decisions/` (ver ADRs existentes como referência).

## Pipeline de tokens

Para categorias nativas do Figma, a decisão nasce em Figma Variables e é
sincronizada para `tokens/**/*.json`. Categorias CSS-only definidas na ADR-016
nascem no JSON. Os dois caminhos convergem em `build-tokens.mjs` →
`css/tokens/generated/*.css` → `css/components/*.css`.

Não edite os arquivos em `css/tokens/generated/` à mão. O CI regenera em cada push pra `main`.

Detalhe completo: [token-architecture.html](./token-architecture.html) e [ADR-001](./decisions/ADR-001-migracao-tokens.md).
