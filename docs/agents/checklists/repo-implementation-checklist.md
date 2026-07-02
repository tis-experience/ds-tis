# Checklist: Repo Implementation

Use depois de Figma/tokens aprovados ou quando o componente for CSS-only por ADR.

## Antes de escrever

- [ ] Role declarada: `Repo Component Agent`.
- [ ] Figma/tokens aprovados ou ADR CSS-only aplicavel.
- [ ] Arquivos previstos listados.
- [ ] Tokens que o CSS deve consumir listados.
- [ ] Docs afetadas listadas.

## CSS

- [ ] Sem hardcode de cor, radius, spacing, stroke, shadow quando houver token.
- [ ] Sem consumo de Foundation em componente final.
- [ ] Component tokens consumidos quando houver contrato anatomico.
- [ ] Estados interativos coerentes com Figma.
- [ ] Focus ring segue padrao aprovado.
- [ ] Overlay/elevation usa tokens/effect semantics corretos.

## Docs

- [ ] Exemplos usam componentes DS existentes pela anatomia publica.
- [ ] Nao usar classes internas isoladas como componente.
- [ ] Conteudo bilingue quando a pagina exigir.
- [ ] Documentacao descreve uso atual, nao aspiracional.
- [ ] Diferenciar componentes proximos quando houver risco semantico.

## Validacao

- [ ] `npm run build:tokens` quando tokens mudarem.
- [ ] `npm run sync:docs` quando docs geradas mudarem.
- [ ] `npm run verify:tokens`.
- [ ] Testes relevantes.
- [ ] Diff revisado contra escopo.
