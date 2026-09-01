# ADR-022: Três saídas de implementação coexistentes

- **Status:** Aceita
- **Data:** 2026-08-03
- **Substitui parcialmente:** ADR-021, nas decisões de provider preferencial e seleção excludente entre implementações
- **Relaciona:** ADR-002, ADR-003, ADR-019, ADR-020, ADR-021

## Contexto

A ADR-021 iniciou a vNext com Ark/Zag como base comportamental preferencial e
Base UI como trilha React comparativa. O intake posterior de shadcn, Base UI,
Ark UI e Zag revelou que esse enquadramento ainda sugeria uma competição na qual
uma implementação seria promovida e as demais descartadas.

Esse não é o produto desejado. O DS TIS precisa atender consumidores com e sem
framework, aproveitar a cobertura multiplataforma de Ark/Zag e oferecer também
uma experiência React baseada em source distribuído pelo ecossistema shadcn.
Essas necessidades não são atendidas por uma implementação híbrida nem pela
escolha de um único provider.

## Decisão

### 1. Cada componente pode ter três saídas públicas coexistentes

As saídas canônicas são:

| ID estável | Nome documental | Responsabilidade |
|---|---|---|
| `web-html-css-js` | HTML/CSS/JS | Implementação agnóstica, distribuída pelo pacote `ds-tis`, com CSS e runtime JavaScript opt-in quando necessário. |
| `ark-zag` | Ark/Zag | Implementações headless por tecnologia usando Ark UI e Zag, com adapters, dependências e releases próprios. |
| `react-shadcn-base-ui` | React · shadcn/Base UI | Implementação React em source, estruturada e distribuída pelo registry shadcn, com Base UI como provider comportamental quando necessário. |

As três saídas são produtos do DS. Uma não é fallback temporário, benchmark ou
candidata à eliminação da outra. A disponibilidade pode evoluir em ritmos
diferentes por componente, mas a documentação sempre declara o estado real das
três: `estável`, `beta`, `planejada` ou `indisponível`.

### 2. Contrato compartilhado não significa implementação compartilhada

As saídas compartilham:

- decisões visuais e tokens TIS;
- linguagem, nomenclatura e intenção dos componentes;
- requisitos WCAG 2.2 AA e cenários mínimos de interação;
- conteúdo de design, uso e acessibilidade que seja realmente comum.

Cada saída mantém separadamente:

- source e árvore de dependências;
- API técnica e convenções legítimas da tecnologia;
- instalação, bundle, SSR/hydration e lifecycle;
- testes de consumo e política de atualização;
- diferenças documentadas que não possam ou não devam ser normalizadas.

É proibido criar um source híbrido que importe Base UI e Ark/Zag para representar
o mesmo componente. Também é proibido fazer uma saída depender da implementação
de outra. Melhorias encontradas em qualquer saída podem voltar ao brief/spec e
influenciar o contrato compartilhado somente após aprovação.

### 3. shadcn tem papel de estrutura, composição e distribuição na saída React

shadcn não é reduzido a transporte de arquivos: seus components e recipes podem
fornecer estrutura React, composição, API inicial, exemplos e convenções de
integração. Para a saída `react-shadcn-base-ui`, o registry é também o canal de
aquisição e atualização do source.

Esse papel não transforma shadcn no motor comportamental. Base UI, React
DayPicker ou outra dependência explicitamente registrada podem fornecer o
comportamento especializado da composição. Nenhuma dessas escolhas determina a
implementação HTML/CSS/JS ou Ark/Zag.

### 4. A documentação apresenta uma escolha entre as três saídas

Toda página de componente deve reservar um seletor com a ordem estável:

```txt
[ HTML/CSS/JS ] [ Ark/Zag ] [ React · shadcn/Base UI ]
```

A seleção muda apenas a camada técnica: preview, instalação, imports, API,
exemplo, dependências, compatibilidade, limitações e evidências. Design, uso e
acessibilidade compartilhados não devem ser triplicados artificialmente.

O usuário escolhe qual saída visualizar e utilizar. O portal pode lembrar essa
preferência durante a navegação, mas deve manter deep links e fallback acessível.
Uma saída indisponível deve exibir seu estado e próximo gate; nunca um exemplo
falso ou código emprestado de outra saída.

### 5. Comparação significa paridade, não seleção de vencedor

Os mesmos cenários são executados nas três saídas para medir paridade visual,
semântica, acessibilidade, comportamento e consumo. Diferenças legítimas ficam
registradas por tecnologia. A matriz não possui `selectedCandidate`,
`selectedProvider` ou equivalente.

Implementação, validação e release avançam por saída. Uma saída aprovada não
autoriza, bloqueia, substitui ou publica automaticamente as demais.

### 6. Figma e tokens permanecem compartilhados e agnósticos

Figma e tokens não recebem nomes de provider nem duplicam componentes por saída.
Eles registram o contrato visual e anatômico comum. Quando uma tecnologia exigir
uma diferença exclusivamente técnica, ela permanece na documentação e no
adapter daquela saída.

## Consequências

### Positivas

- consumidores escolhem a implementação adequada sem perder a identidade TIS;
- HTML/CSS/JS, Ark/Zag e React/shadcn/Base UI podem evoluir sem substituição;
- Devs e agents IA recebem disponibilidade, instalação e API sem ambiguidade;
- comparações upstream passam a procurar paridade e melhorias, não um vencedor;
- o core visual continua independente de bibliotecas e frameworks.

### Negativas

- cada saída exige ownership, testes, documentação e política de atualização;
- paridade não pode ser presumida a partir de aparência semelhante;
- alguns componentes ficarão temporariamente indisponíveis em uma ou duas saídas;
- o portal e os metadados precisam representar três estados por componente.

## Alternativas consideradas

### Criar uma única implementação que combine as três tecnologias

Descartada. Misturaria dependências e APIs incompatíveis, aumentaria bundle e
apagaria as vantagens próprias de cada saída.

### Comparar providers e manter somente o vencedor

Descartada. Não atende simultaneamente consumidores agnósticos, multiplataforma e
React source-first.

### Manter apenas conteúdo documental separado, sem saídas reais

Descartada. O seletor precisa apontar para implementação instalável e evidência
executável, não apenas exemplos visuais.

## Referências

- ADR-002 — Stack agnóstica.
- ADR-020 — Biblioteca consumível e contrato App-ready.
- ADR-021 — Coexistência de v1 e vNext.
- `docs/process-upstream-component-intake.md` — intake e matriz de paridade.
- `docs/agents/templates/upstream-intake.schema.json` — contrato verificável das três saídas.
