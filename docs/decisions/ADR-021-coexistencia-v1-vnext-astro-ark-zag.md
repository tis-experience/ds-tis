# ADR-021: Coexistência da v1 com vNext em Astro, Storybook e Ark/Zag

- **Status:** Aceita
- **Data:** 2026-07-28
- **Substituída parcialmente por:** ADR-022, nas decisões de provider preferencial e seleção excludente entre implementações
- **Relaciona:** ADR-002, ADR-003, ADR-019, ADR-020

## Contexto

A versão 1.0.0 consolidou um núcleo stack-agnóstico consumível em CSS, JavaScript,
tokens DTCG, documentação estática e Storybook HTML/Vite. Esse trabalho permanece
útil e estável, mas mostrou um custo alto para criar e manter componentes
interativos complexos diretamente, incluindo acessibilidade, lifecycle,
composições e paridade entre superfícies.

Ao mesmo tempo, o projeto precisa:

- preservar aplicações que já consomem `ds-tis`;
- reduzir o trabalho artesanal para novos componentes web;
- manter tokens, theming e conhecimento como ativos independentes da biblioteca;
- documentar variações por tecnologia sem duplicar todo o conteúdo;
- permitir que uma futura versão principal substitua gradualmente a v1, com
  evidência de qualidade e sem migração abrupta.

O núcleo declarado na ADR-020 já concluiu o gate de consumo em 1.0.0. Portanto,
iniciar um adaptador React não antecipa mais uma superfície sobre um núcleo
incompleto.

## Decisão

### 1. A v1 permanece estável e a vNext nasce de forma aditiva

A estrutura existente continua canônica para a linha 1.x:

- `css/`, `js/`, `tokens/`, `docs/`, `stories/` e `.storybook/`;
- pacote npm `ds-tis`;
- documentação pública em `/`;
- Storybook HTML/Vite em `/storybook/`.

A vNext nasce no mesmo repositório, sem substituir arquivos ou rotas da v1:

- `apps/docs/`: portal Astro com Starlight;
- `packages/react/`: futura biblioteca React;
- `packages/theme-schema/`: contrato JSON versionado de tema;
- `packages/theme-engine/`: pacote-ponte para o motor de tema existente;
- `.storybook-vnext/`: Storybook React/Vite independente;
- documentação em `/next/`;
- Storybook React em `/next/storybook/`.

### 2. Astro/Starlight é o portal documental progressivo

O portal novo organiza conteúdo por idioma e tecnologia em URL. Exemplo:

```txt
/next/pt-br/web/components/button/
/next/pt-br/react/components/button/
```

Cada página pode combinar:

- conteúdo compartilhado de design, uso e acessibilidade;
- conteúdo específico de implementação;
- seleção de tecnologia por rota, com links e fallback por `select`;
- seletor de idioma e tema fornecidos pelo Starlight;
- visões de conteúdo com deep link (`Design`, `Uso`, `Implementação` e
  `Acessibilidade`) para evitar uma única página excessivamente longa;
- navegação interna por âncoras e table of contents dentro da visão ativa;
- tabs locais para informações equivalentes, como package managers.

O chrome do portal usa os componentes e estilos nativos do Starlight, com a cor
de marca TIS aplicada pelas variables `--sl-*`. Ele não simula componentes do DS
nem carrega o reset visual da v1. Somente os canvases que documentam um componente
real importam seu CSS público e os tokens necessários.

As quatro visões editoriais usam semântica de tabs com teclado, hash e fallback
server-rendered. Essa escolha é navegação de conteúdo, não uma cópia visual das
referências consideradas durante o desenho do portal. Tabs locais continuam
reservadas a alternativas equivalentes, como package managers.

### 3. Ark UI é o provider preferencial e Zag é o motor de comportamento

Na vNext web:

- cada tecnologia suportada usa seu pacote Ark nativo (`@ark-ui/react`,
  `@ark-ui/vue`, `@ark-ui/solid` ou `@ark-ui/svelte`) quando o padrão existir;
- Ark fornece anatomy headless, composição, atributos e adaptação ao framework;
- Zag permanece a camada de máquinas de estado por baixo do Ark;
- consumo direto de `@zag-js/*` é exceção para capacidades que o Ark não exponha,
  documentada por componente e encapsulada em adapter fino;
- componentes simples com semântica HTML suficiente, como Button, continuam
  baseados em elementos nativos e não recebem uma máquina sem necessidade;
- vanilla CSS e os tokens `--ds-*` existentes estilizam as parts e estados; Tailwind,
  Panda CSS, Chakra UI e shadcn não são requisitos;
- o DS mantém nomes públicos, visual, testes, política de atualização e contrato
  de cada tecnologia;
- nenhum spike de provider vira componente público antes de brief, spec Figma e
  matriz de contrato aprovados.

Paridade multiplataforma significa preservar intenção, estados, acessibilidade,
tokens e documentação. Não significa compartilhar o mesmo binário ou esconder
diferenças legítimas entre frameworks.

shadcn pode distribuir source React sem se tornar provider de comportamento.
Quando usado pelo DS, seu registry é somente o canal de aquisição e atualização
do adapter React. A escolha entre HTML nativo, Ark UI ou acesso excepcional a
Zag continua sendo feita pelo contrato de cada componente, segundo esta ADR.

Uma implementação React com Base UI pode permanecer como trilha beta de
comparação, desde que declare o provider real, não seja apresentada como
substituição de Ark/Zag e não determine as implementações de Vue, Solid ou
Svelte. Sua promoção exige comparação componente a componente contra a opção
Ark/Zag e decisão arquitetural explícita; a existência de source validado no
registry, isoladamente, não altera o provider preferencial da vNext.

As versões de Ark são fixadas por linha de release e atualizadas somente com
changelog upstream, stories de interação, Axe e teste de consumo. Zag é transitivo
via Ark; dependência direta só entra quando a exceção acima for aprovada.

Performance é gate de release, não uma suposição baseada na quantidade de pacotes
instalados. Os adapters usam imports por subpath, mantêm o framework como peer
dependency e medem dois recortes com `npm run test:vnext:bundle`: o JavaScript
incremental do provider e o preview integrado com wrapper, Lucide, tokens e CSS.
Na referência inicial (`@ark-ui/react` 5.37.2), os limites gzip incrementais são
12 KiB para Accordion, 20 KiB para Dialog + Portal e 25 KiB para ambos. Os previews
integrados têm limites de 24 KiB, 32 KiB e 38 KiB, respectivamente. Componentes
pesados também devem admitir code splitting no consumidor. Esses orçamentos não
incluem React/ReactDOM, não representam o overhead do Storybook e não substituem
métricas de uma aplicação real, como INP e LCP.

O MCP oficial do Ark e os arquivos `llms*.txt` de Ark/Zag são ferramentas opcionais
para agentes. Não participam do runtime, build, CI nem fonte de verdade da API
instalada. Tipos do pacote, contrato aprovado e testes locais prevalecem.

### 4. Tokens e tema permanecem independentes da biblioteca de componentes

O JSON de tema é o contrato de entrada do motor de estilo. O mesmo tema pode gerar
artefatos próprios para React, CSS e outras tecnologias web no futuro.

Nesta etapa:

- `packages/theme-schema` formaliza a entrada suportada;
- `packages/theme-engine` expõe o motor atual de `js/theme` sem duplicá-lo;
- os exports públicos da v1 permanecem inalterados;
- extração física do motor para dentro do pacote só ocorrerá quando houver teste
  de compatibilidade do tarball da v1 e da vNext.

Flutter permanece uma integração separada. Pode consumir valores e semântica
compatíveis quando fizer sentido, mas não define a arquitetura web nem compartilha
componentes React.

### 5. Figma continua sendo superfície de design, não gerador automático de código

O Figma atual permanece associado à v1. A biblioteca vNext será criada em arquivo
separado, como cópia controlada da biblioteca original, depois da aprovação visual
e estrutural da primeira spec.

O futuro importador de tema:

- recebe JSON validado por `packages/theme-schema`;
- cria ou atualiza Variables na cópia da biblioteca;
- não cria modes para representar clientes diferentes;
- mantém um relatório de alterações e versão do schema;
- não publica nem atualiza bibliotecas sem ação explícita do owner.

### 6. Promoção para versão principal depende de evidência

A vNext só pode substituir a v1 como linha principal depois de provar:

1. cobertura mínima definida de componentes prioritários;
2. paridade visual aprovada no Figma;
3. contratos de acessibilidade e interação em Storybook;
4. consumo real em pelo menos uma aplicação;
5. documentação de migração e compatibilidade;
6. política de atualização de recipes e dependências upstream;
7. orçamentos de bundle e métricas de runtime aprovados.

Até esse gate, v1 e vNext são superfícies explícitas e não intercambiáveis.

## Consequências

### Positivas

- A v1 continua disponível sem reescrita ou quebra de rotas.
- A vNext reduz o risco de comportamento complexo artesanal.
- O mesmo modelo de comportamento pode ser implementado com adapters Ark nativos
  em React, Vue, Solid e Svelte.
- O styling permanece vanilla CSS orientado por tokens, sem Tailwind obrigatório.
- Tokens, tema e documentação deixam de depender de uma única biblioteca.
- O portal consegue apresentar diferenças reais por tecnologia.
- A promoção futura é baseada em evidência, não apenas em intenção arquitetural.

### Negativas

- Duas superfícies precisam ser mantidas durante a transição.
- Ark e Zag passam a ser dependências externas para componentes que os utilizam.
- O pacote Ark instala o catálogo de máquinas Zag suportadas, aumentando lockfile,
  disco e superfície de atualização no desenvolvimento, embora o browser receba
  somente os módulos preservados pelo bundle do consumidor.
- Cada adapter de framework continua exigindo implementação, teste e release próprios.
- Atualizações de Ark/Zag podem alterar anatomy, atributos ou comportamento e
  exigem revisão antes de serem absorvidas.
- Tecnologias sem adapter Ark precisam de uma estratégia específica.
- O pacote-ponte do motor de tema não é publicável isoladamente até a extração
  física de sua implementação.
- Conteúdo específico por tecnologia precisa de ownership e revisão próprios.

## Alternativas consideradas

### Reescrever a v1 imediatamente

Descartada. Eliminaria compatibilidade antes de a vNext provar cobertura e consumo.

### Continuar criando todos os componentes em CSS/JavaScript próprios

Descartada como padrão para a vNext. Preserva neutralidade, mas mantém o custo e a
fragilidade observados em componentes interativos complexos.

### Usar MUI como implementação canônica

Descartada para a vNext principal. MUI entrega maior completude imediata, mas impõe
API, theming e anatomia mais acoplados à biblioteca. Continua possível em produtos
que decidam consumi-la por integração específica.

### Usar shadcn com Base UI ou Radix como base canônica

Descartada como estratégia principal. É uma excelente receita para aplicações
React, mas prioriza aquisição de código React e frequentemente Tailwind. Não atende
tão diretamente ao objetivo atual de manter providers equivalentes em mais de uma
tecnologia web. Continua possível em aplicações consumidoras sem se tornar o core.

### Usar apenas Base UI

Descartada como provider principal porque sua superfície é React. Pode ser usada
por uma integração React específica quando houver ganho demonstrável.

### Usar Zag diretamente em todos os componentes

Descartada como padrão. Entrega o máximo de controle e lógica framework-agnostic,
mas transfere ao DS a composição de anatomy, parts e adapters que Ark já fornece.
Permanece como escape hatch controlado.

### Migrar toda a documentação estática para Astro em um único passo

Descartada. A migração progressiva preserva URLs e permite comparar conteúdo,
busca, acessibilidade e publicação antes de retirar a superfície antiga.

## Referências

- ADR-002 — Stack agnóstica: HTML + CSS + vanilla JS como base da v1.
- ADR-020 — Biblioteca consumível e contrato de readiness dos componentes.
- Documentação Starlight — i18n, tabs sincronizadas, table of contents e overrides.
- Documentação Storybook — React com Vite.
- Documentação Ark UI — componentes headless, adapters por framework, MCP e LLMs.txt.
- Documentação Zag — máquinas de estado, adapters e LLMs.txt.
