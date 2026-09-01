# ADR-023: Quatro saídas de implementação com Angular nativo

- **Status:** Aceita
- **Data:** 2026-08-28
- **Substitui parcialmente:** ADR-022, na quantidade de saídas públicas e no seletor documental
- **Relaciona:** ADR-002, ADR-003, ADR-019, ADR-020, ADR-021, ADR-022

## Contexto

A ADR-022 formalizou três saídas independentes para o DS TIS: HTML/CSS/JavaScript,
Ark/Zag e React com shadcn/Base UI. Essa decisão preservou o core visual
agnóstico, mas não oferece uma biblioteca nativa para aplicações Angular.

Angular possui primitives oficiais para este problema. Angular Aria entrega
diretivas headless para padrões WAI-ARIA, enquanto o Angular CDK fornece Overlay,
Portal e utilitários de acessibilidade. Usar essas ferramentas permite expor uma
API Angular legítima sem introduzir Angular Material visual, React, Ark/Zag,
Web Components ou uma cópia do CSS e dos tokens do DS.

## Decisão

### 1. O DS TIS passa a ter quatro saídas públicas coexistentes

| ID estável | Nome documental | Responsabilidade |
|---|---|---|
| `web-html-css-js` | HTML/CSS/JS | Implementação agnóstica e estável distribuída pelo pacote `ds-tis`. |
| `ark-zag` | Ark/Zag | Adapters headless por framework apoiados em Ark UI e Zag. |
| `react-shadcn-base-ui` | React · shadcn/Base UI | Source React distribuído pelo registry shadcn, com Base UI quando necessário. |
| `angular-native` | Angular | Biblioteca Angular nativa, com HTML nativo, Angular Aria e Angular CDK conforme o padrão. |

As quatro saídas são independentes. Nenhuma é provider universal, fallback ou
candidata automática a substituir outra. Cada componente declara o estado real
de cada saída: `estável`, `beta`, `planejada` ou `indisponível`.

### 2. A saída Angular é uma biblioteca Angular nativa

A saída usa o package futuro `@tis/angular`, componentes standalone, inputs e
outputs tipados, signals quando adequados, content projection e entrypoints
secundários tree-shakable.

As responsabilidades comportamentais seguem esta ordem:

1. HTML nativo quando a plataforma já cobre o comportamento;
2. `@angular/aria` para patterns headless oficialmente disponíveis;
3. Angular CDK, especialmente Overlay, Portal e A11y, para posicionamento,
   lifecycle de overlays, foco e comportamentos complementares.

Form controls Angular devem integrar Angular Forms e implementar
`ControlValueAccessor`. Esse requisito não se aplica a Button, Accordion ou
Popover porque nenhum deles representa um value-bearing form control.

Angular Material visual, Tailwind, React, Base UI, shadcn, Ark UI e Zag não fazem
parte dessa implementação. Angular Elements e Web Components não são usados como
camada principal.

### 3. Tokens, CSS e contrato visual permanecem compartilhados

O consumidor Angular importa o CSS público do DS:

```css
@import "ds-tis/css";
```

Os componentes Angular aplicam a anatomia e as classes públicas existentes,
como `ds-button`, `ds-accordion` e `ds-popover`. A biblioteca não duplica tokens,
não empacota uma segunda cópia do CSS global e não altera o contrato Web estável.

CSS local de adapter é permitido somente para adaptar uma diferença técnica do
framework, como o painel portalled do CDK Overlay. Esse CSS deve continuar
consumindo os tokens e as classes públicas existentes e não pode redefinir a
linguagem visual do componente.

### 4. Dependências e imports permanecem separados

Cada saída mantém source, dependências, instalação, API, testes, bundle e release
próprios. São proibidos imports cruzados entre as implementações.

A saída Angular declara Angular, Angular Aria e Angular CDK como peer
dependencies. O pacote `ds-tis` permanece uma dependência de consumo visual do
aplicativo, não uma cópia incorporada dentro de `@tis/angular`.

### 5. Storybook e documentação preservam o isolamento

Angular possui uma instância Storybook separada, com renderer Angular e build
estático próprio. O Storybook React não é convertido nem usado como renderer da
saída Angular.

O seletor documental passa a usar a ordem estável:

```txt
[ HTML/CSS/JS ] [ Ark/Zag ] [ React · shadcn/Base UI ] [ Angular ]
```

Uma saída Angular permanece `planejada` enquanto não houver, em conjunto, pacote
instalável, story funcional e consumer real validado. Após esses gates, pode ser
apresentada como `beta`; estabilidade exige decisão posterior de release.

## Consequências

### Positivas

- aplicações Angular recebem uma API nativa e tree-shakable;
- Angular Aria e CDK concentram comportamento complexo mantido pelo ecossistema
  oficial do framework;
- o HTML/CSS/JavaScript estável e as saídas React e Ark/Zag permanecem intactos;
- a identidade visual continua centralizada nos tokens, no CSS e no contrato TIS;
- testes e bundle podem ser avaliados por entrypoint e por tecnologia.

### Negativas

- uma quarta saída aumenta custo de manutenção, CI, documentação e atualização;
- `@storybook/angular-vite` ainda está em preview e precisa de acompanhamento;
- overlays portalled exigem uma adaptação CSS técnica, documentada e testada;
- Angular, Angular Aria e CDK precisam avançar em versões compatíveis entre si.

## Alternativas consideradas

### Reutilizar Angular Elements ou Web Components

Descartada. Entregaria uma camada de interoperabilidade, não uma biblioteca
Angular nativa com signals, content projection, forms e entrypoints legítimos.

### Usar Angular Material visual

Descartada. Introduziria outra linguagem visual e duplicaria decisões que já
pertencem ao DS TIS. Apenas os primitives headless do CDK são permitidos.

### Reutilizar Ark/Zag ou a implementação React dentro de Angular

Descartada. Criaria imports cruzados, APIs não idiomáticas e um provider universal
implícito, contrariando a coexistência independente.

### Manter Angular apenas como exemplo de consumo do HTML agnóstico

Descartada. Não atende distribuição, typing, lifecycle, Forms, signals nem
composição esperada por consumidores Angular.

## Referências

- ADR-022 — Três saídas de implementação coexistentes.
- Angular — Creating libraries: https://angular.dev/tools/libraries/creating-libraries
- Angular Aria — Accordion: https://angular.dev/guide/aria/accordion
- Angular CDK — https://material.angular.dev/cdk
- Storybook for Angular with Vite: https://storybook.js.org/docs/get-started/frameworks/angular-vite
