# Processo: intake controlado de componentes upstream

Este processo governa o uso de shadcn, Base UI, Ark UI, Zag ou outra biblioteca
como matéria-prima para evoluir o DS TIS. Ele complementa
`docs/process-ai-component-workflow.md`: o workflow de componentes continua
definindo brief, Figma, implementação e release; este documento impede que uma
referência externa vire, por acidente, fonte de verdade ou uma segunda arquitetura
misturada ao core.

## Resultado esperado

Cada intake deve preservar e evoluir três saídas públicas separadas:

1. `web-html-css-js` — HTML/CSS + JavaScript agnóstico;
2. `ark-zag` — Ark UI + Zag por tecnologia;
3. `react-shadcn-base-ui` — React + shadcn + Base UI.

O objetivo não é somar as três tecnologias em uma implementação nem escolher um
provider vencedor. É entregar alternativas reais que compartilham o contrato TIS
e permanecem independentes em source, dependências, API técnica, instalação,
testes e release. Ver ADR-022.

## Camadas e responsabilidades

| Camada | Autoridade | Pode receber do upstream | Não pode receber |
|---|---|---|---|
| Figma TIS | contrato visual, anatomia, properties e documentação para designers | proposta de melhoria visual/anatômica, após auditoria | nomes de provider, estrutura React ou recipe copiada |
| Tokens DTCG | decisões visuais aprovadas e cadeia Foundation → Semantic → Component | tokens justificados pela spec aprovada | valores de theme do upstream sem normalização |
| Saída HTML/CSS/JS | API agnóstica e runtime estável do DS | melhoria de semântica, teclado ou lifecycle validada | dependência de Base UI, Ark UI, Zag, React ou registry |
| Saída Ark/Zag | integração headless por tecnologia | parts Ark e comportamento Zag via Ark | imports Base UI ou source da saída React |
| Saída React · shadcn/Base UI | composição e source React distribuído pelo registry | estrutura/recipes shadcn + primitives Base UI + adapter TIS | imports Ark/Zag ou dependência da saída Ark |
| Portal documental | escolha explícita entre as três saídas | preview, instalação, API e evidência da saída selecionada | esconder saída, eleger vencedor ou reutilizar código de outra saída como se fosse nativo |

A direção de dependência é sempre:

```txt
Figma + tokens TIS -> HTML/CSS/JS
                   -> Ark/Zag por tecnologia
                   -> React + shadcn/Base UI
                   -> documentação com escolha da saída
```

O sentido inverso é bloqueado. Um adapter pode revelar uma melhoria possível no
core ou no Figma, mas essa melhoria volta ao gate de brief/spec e só então é
incorporada ao contrato TIS.

## Regras duras

1. Preservar a implementação atual até existir decisão aprovada por componente.
2. Manter as três saídas coexistentes. Uma não pode substituir, incorporar ou
   importar a implementação de outra.
3. Tratar shadcn como estrutura de composição e distribuição de source da saída
   React; Base UI permanece o provider comportamental dessa saída quando o
   componente precisar de primitives.
4. Tratar Ark como adapter headless por tecnologia e Zag como motor de estado;
   acesso direto a Zag exige exceção registrada.
5. Manter Figma e Web core livres de nomes e dependências de provider.
6. Não copiar theme, Tailwind recipe, CSS literal ou nomes de parts upstream para
   o consumidor final. Tudo passa pelo contrato anatômico e pelos tokens TIS.
7. Não declarar melhoria no Figma a partir de snapshot antigo. O resultado Figma
   deve ser `sem mudança, com evidência` ou `proposta de melhoria`, nunca omitido.
8. Não implementar, substituir ou publicar uma saída no mesmo gate que faz a
   auditoria de paridade.
9. Não remover uma implementação existente durante o comparativo.
10. Toda decisão deve estar em uma run e em `upstream-intake.json`, validado por
    `npm run agents:validate-intake`.

## Fluxo obrigatório

### Gate U0 — estado atual

- Rodar `npm run agent:preflight` e isolar a sujeira existente.
- Registrar contrato Web, readiness, runtime, tokens e evidência Figma disponível.
- Marcar snapshot Figma antigo como `stale`; ele não prova o estado vivo.
- Declarar explicitamente o que será preservado e quais escritas estão bloqueadas.

### Gate U1 — benchmark upstream reproduzível

- Para shadcn, registrar recipe/base/provider e usar a CLI oficial para consulta:
  `info`, `docs`, `search`, `view`, `--dry-run` e `--diff`, conforme aplicável.
- Registrar o `components.json`, preset ou base usados na resolução. Um `view`
  executado fora de um projeto configurado pode resolver outra base e não vale
  como evidência da saída pretendida.
- Para Ark, registrar package, versão fixada, anatomy e documentação primária.
- Para Zag, registrar se o uso é transitivo por Ark ou uma exceção direta.
- Guardar apenas evidência e links necessários; não importar vendor corpus.
- Comparar versões fixadas no repo. “Latest” sem data e sem evidência não é aceito.

### Gate U2 — contrato TIS atual

- Auditar anatomia, estados, teclado, foco, dismiss, ARIA, lifecycle, tokens,
  responsividade e API pública existentes.
- Para Figma, usar snapshot fresco ou leitura viva persistida em `evidence/`.
- Separar defeito atual, oportunidade de melhoria e diferença legítima de provider.

### Gate U3 — classificação das melhorias

Cada achado recebe exatamente uma classificação:

| Classificação | Destino |
|---|---|
| `figma-core` | volta a brief/spec Figma e aprovação do owner |
| `web-core` | proposta agnóstica para HTML/CSS/JS, após contrato aprovado |
| `adapter-only` | permanece na saída específica |
| `docs-only` | documentação derivada do contrato real |
| `reject` | não entra no DS, com justificativa |

Um achado não pode ser implementado em duas camadas “por garantia”. A matriz deve
declarar uma camada proprietária e como as demais consomem o resultado.

### Gate U4 — brief e resultado Figma

- Atualizar `01-brief.md` com problema, comparação e mudanças propostas.
- Atualizar `02-figma-spec.md` ou registrar, com evidência, que o Figma não muda.
- Obter aprovação explícita do owner para o brief/spec.
- Sem essa aprovação, Figma, Web core e adapters continuam bloqueados.

### Gate U5 — saídas isoladas

- Construir somente as saídas autorizadas no gate, em paths distintos.
- Preservar HTML/CSS/JS mesmo quando as outras saídas forem implementadas.
- A saída React/shadcn/Base UI só importa Base UI e dependências React
  explicitamente registradas.
- A saída Ark/Zag só importa Ark e, por exceção registrada, Zag direto.
- O registry shadcn distribui somente a saída React/shadcn/Base UI.
- Cada saída declara instalação, API, dependências, status e testes próprios.

### Gate U6 — paridade e diferenças legítimas

Aplicar o mesmo método às três saídas:

- semântica, ARIA, teclado, foco e dismiss;
- controlled/uncontrolled e forms, quando aplicável;
- SSR/hydration e lifecycle;
- quantidade de adapter e desvios documentados do contrato TIS;
- bundle, dependências e política de atualização;
- capacidade de cumprir o contrato na tecnologia declarada;
- instalação real em consumer e manutenção por agents IA.

O resultado é uma matriz de paridade com status por saída e diferenças legítimas.
Não existe campo de provider escolhido. Uma saída pode estar `estável`, `beta`,
`planejada` ou `indisponível` sem eliminar nem bloquear as demais.

### Gate U7 — documentação, implementação e release por saída

Depois da paridade aprovada, retomar a sequência canônica da run para cada saída
autorizada:

```txt
Figma Builder -> Figma Auditor -> Token Sync Agent -> Repo Component Agent -> Release Agent
```

O portal deve oferecer `HTML/CSS/JS`, `Ark/Zag` e `React · shadcn/Base UI` como
escolhas explícitas e mostrar o estado real quando uma saída ainda não estiver
disponível. Quando Figma/tokens não mudarem, o gate correspondente deve ser
fechado como não aplicável com evidência, nunca pulado em silêncio. Commit, push,
PR e publicação continuam exigindo autorização explícita por saída.

## Manifesto obrigatório

Cada run de intake contém `upstream-intake.json`, conforme
`docs/agents/templates/upstream-intake.schema.json`. O manifesto registra:

- baseline TIS e freshness da evidência Figma;
- as três saídas, famílias tecnológicas, módulos, distribuição e status;
- separação entre sources e coexistência obrigatória;
- dimensões comuns da comparação;
- contrato do seletor documental;
- resultado Figma obrigatório;
- gates, aprovações e ações bloqueadas;
- paths de evidência reproduzível.

Validação:

```bash
npm run agents:validate-intake
npm run agents:validate-run -- docs/agents/runs/YYYY-MM-DD-slug
npm run agents:next-step -- docs/agents/runs/YYYY-MM-DD-slug
```

O validador bloqueia manifesto sem as três saídas, source que mistura Base UI e
Ark/Zag, campo de provider vencedor, seletor documental incompleto ou gate
posterior avançado antes dos anteriores.

## Política de atualização

Antes de atualizar a saída React/shadcn/Base UI, use `--dry-run` e `--diff`;
preserve alterações TIS e nunca aceite overwrite automático. Antes de atualizar
Ark ou Base UI, repita os cenários, bundle e consumer da saída. Mudança de major,
anatomia, data attributes ou comportamento reabre U1, U2 e U6.

## Piloto atual

Popover é o primeiro intake formal deste processo porque já possui contrato Web
App-ready, runtime público e página Figma registrada, mas ainda não possui
implementação React pública. A run canônica é
`docs/agents/runs/2026-08-03-popover-upstream-intake/`.

Esta run começa somente com registro e auditoria de paridade. A saída HTML/CSS/JS
existente permanece preservada; escrita no Figma, implementação das saídas
Ark/Zag e React/shadcn/Base UI e publicação permanecem bloqueadas até seus gates
específicos.
