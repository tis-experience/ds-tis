# Versionamento

O Design System TIS usa [Semantic Versioning](https://semver.org/lang/pt-BR/) e
está em fase estável desde `1.0.0`.

## Política atual

| Tipo | Exemplo | Quando |
|---|---|---|
| **Patch** | `1.0.1` | Correção compatível, hardening, documentação ou ajuste interno sem quebra do contrato público. |
| **Minor** | `1.1.0` | Adição compatível, como novo componente, token, foundation, template ou API. |
| **Major** | `2.0.0` | Breaking change: remoção ou rename incompatível de token, classe, markup, export ou comportamento público. |

A classificação considera o impacto para designers, desenvolvedores e agents IA,
não o tamanho do diff. Uma mudança pequena pode exigir major se quebrar um
contrato público; uma implementação grande pode ser minor se for aditiva.

## Pré-releases

Pré-releases futuras usam `X.Y.Z-beta.N` e são publicadas exclusivamente na
dist-tag npm `beta`:

```text
1.1.0-beta.1  → npm install ds-tis@beta
1.1.0         → npm install ds-tis
```

`latest` sempre aponta para a versão estável mais recente. Uma versão `beta`
jamais substitui `latest` enquanto existir uma versão estável.

## Quando versionar

Crie uma release quando um pacote coerente de mudanças observáveis estiver
concluído, documentado e aprovado. Exemplos:

- correção consumível ou de acessibilidade pronta para produção;
- novo componente ou runtime completo;
- mudança de token ou contrato público;
- melhoria de infraestrutura que altera publicação ou consumo;
- conjunto de documentação/API machine-readable que muda o handoff.

Não versionar trabalho em andamento, regeneração sem alteração observável,
notas internas ou refactor sem impacto no contrato.

## Fechamento da maturidade 1.0

O owner aprovou a promoção estável depois destas evidências:

### Arquitetura e consumo

- [x] `verify:tokens` com zero erros e zero warnings.
- [x] Zero leaks Foundation em CSS de componentes e base.
- [x] Componentes auditados entre Figma, tokens, CSS e documentação.
- [x] 23 componentes classificados: 21 App-ready e 2 composições, sem experimentais.
- [x] Seis runtimes públicos com init, destroy, hydration, teclado, ARIA e consumer smoke.
- [x] Pacote npm com exports explícitos, templates, theme engine e metadados para agents IA.

### Qualidade e governança

- [x] WCAG 2.2 AA automatizada em light/dark sem violações aceitas.
- [x] Regressão visual Linux e Darwin separada e estável.
- [x] Registry DTCG completo e cadeia Foundation → Semantic → Component validada.
- [x] ADRs históricos revisados: decisões substituídas ou parcialmente substituídas apontam para a evolução vigente no índice canônico.
- [x] Figma vivo atestado por release: o export permanece manual no plano Pro, mas o CI exige versão, resultados e SHA-256 dos tokens produzidos por snapshot com menos de 24 horas.
- [x] GitHub Pages publicado por workflow Actions auditável, sem builder legado.

## Cadeia única de versão

Estes artefatos precisam concordar:

- `package.json` e `package-lock.json`;
- última seção publicada de `CHANGELOG.md`;
- badge `VERSION` em `index.html`;
- `docs/api/release-figma-evidence.json`;
- tag git anotada.

Os geradores propagam a versão para inventários, APIs JSON, documentação HTML e
corpus LLM. Divergência em qualquer ponto bloqueia a release.

## CHANGELOG

`[Não publicado]` acumula apenas mudanças ainda não entregues. Na release, todo
o conteúdo vira uma única seção `[X.Y.Z] — AAAA-MM-DD`, agrupada por Adicionado,
Alterado, Corrigido e Removido, e uma nova seção vazia é criada no topo.

## Fluxo de bump

1. Confirmar a classificação SemVer e a aprovação do owner.
2. Consolidar `[Não publicado]` e atualizar links de comparação.
3. Atualizar `package.json`, `package-lock.json` e a badge em `index.html`.
4. Com snapshot Figma vivo, rodar `npm run release:figma-evidence`.
5. Rodar `npm run build:all`, `npm run test:app-ready -- --release`,
   `npm run pack:check` e `npm run security:check`.
6. Abrir PR e mesclar somente com todos os checks verdes.
7. Confirmar CI e deploy do commit resultante em `main`.
8. Criar e enviar a tag anotada `vX.Y.Z`.
9. Publicar no npm e validar instalação limpa, GitHub Release, Pages e Figma.

## Histórico

As tags 0.x registram a fase inicial. `1.0.0-beta.1` até
`1.0.0-beta.10` registram a estabilização pré-1.0. O histórico permanece
imutável; nenhuma tag publicada é movida ou reescrita.
