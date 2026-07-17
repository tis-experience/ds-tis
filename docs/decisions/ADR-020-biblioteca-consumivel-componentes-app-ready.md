# ADR-020: Biblioteca consumível e contrato de readiness dos componentes

- **Status:** Aceita
- **Data:** 2026-07-16
- **Relaciona:** ADR-002, ADR-004, ADR-017, ADR-019

## Contexto

O DS TIS consolidou Figma, tokens DTCG, CSS, documentação e 23 componentes. O pacote público já entrega CSS, theme engine, templates e módulos JavaScript para Combobox, Modal e Action Menu.

Esse conjunto ainda não responde de forma objetiva à pergunta mais importante para um consumidor: "posso usar este componente em um fluxo real sem completar partes não declaradas por conta própria?".

O inventário anterior media existência de CSS, Figma, bindings, stories e docs. Essas evidências são necessárias para manter o design system, mas não representam prontidão de consumo. Accordion, Tabs e Tooltip, por exemplo, têm superfície visual documentada, porém não entregam no pacote o comportamento acessível descrito. Combobox, Modal e Menu possuem runtime público, mas ainda precisam de ciclo de vida e teste em um projeto consumidor antes de serem promovidos como completos.

Essa ambiguidade afeta dois públicos:

- desenvolvedores podem interpretar "componente documentado" como "componente pronto para aplicação";
- agents IA podem combinar classes, markup e comportamento de fontes diferentes e inventar uma API que o pacote não mantém.

Antes de criar adaptadores React, Flutter, shadcn, MUI ou outros, o núcleo stack-agnóstico precisa ser um produto consumível, verificável e honesto sobre seus limites.

## Decisão

### 1. Consumo do núcleo precede adaptadores por tecnologia

A prioridade arquitetural passa a ser:

```txt
núcleo consumível -> componentes app-ready -> adaptadores por demanda comprovada
```

Tokens multi-plataforma e wrappers de framework continuam possíveis conforme ADR-002, mas não são prioridade enquanto o pacote base não tiver um caminho de consumo completo e testado.

### 2. Readiness é contrato público

Todo componente do catálogo recebe exatamente um nível:

#### App-ready

API pública recomendada para aplicações. Anatomia, estados e responsabilidade de comportamento estão documentados. O componente usa semântica HTML nativa ou já concluiu o gate completo de runtime.

#### Composição

Padrão público e estável em que o DS entrega estrutura, visual e orientação de acessibilidade, enquanto a aplicação mantém orquestração, navegação, dados ou estado de negócio.

Composição não significa incompleto. Significa que a fronteira de responsabilidade é intencional e documentada.

#### Experimental

Contrato que ainda não concluiu o gate de runtime e consumo. Pode mudar e não deve sustentar fluxo crítico sem avaliação explícita do produto consumidor.

Readiness não substitui status de Figma, CSS, bindings ou docs. Esses eixos continuam existindo no inventário.

### 3. Responsabilidade de comportamento é explícita

Cada componente declara um modelo de comportamento:

- `native`: o browser fornece a interação primária; o DS mantém anatomia, estados e orientação semântica;
- `presentation`: não existe runtime reutilizável; o DS mantém visual e semântica aplicável;
- `consumer`: a aplicação mantém a orquestração entre elementos;
- `ds-runtime`: o DS mantém comportamento reutilizável de interação e acessibilidade em módulo público.

A regra operacional é:

> O DS mantém comportamento reutilizável e independente de negócio. A aplicação mantém dados, navegação, permissões e regras de produto.

Exemplos:

- Modal: o DS deve manter abertura, focus trap, Escape, inert e retorno de foco; a aplicação decide o que salvar ou excluir.
- Combobox: o DS deve manter listbox, teclado e seleção; a aplicação fornece opções, busca remota e regra de validação.
- Input: o DS mantém anatomia e estados de erro; a aplicação mantém valor e validação.
- Pagination: o DS mantém itens e estado visual; a aplicação mantém URL, carregamento e página atual.

### 4. Runtime necessário não é opcional

Quando a acessibilidade e a interação declaradas dependem de um módulo do DS, `runtime.level` deve ser `required`.

`optional` fica reservado para enhancement que não seja necessário para cumprir o contrato acessível. CSS isolado que apenas desenha um Modal ou Menu não é implementação funcional desses componentes.

### 5. Catálogo canônico e saída machine-readable

O catálogo interno compartilhado entre geradores é a única lista mantida manualmente para:

- identidade e arquivos do componente;
- readiness;
- modelo de responsabilidade;
- notas de limitação;
- runtime público.

`docs/api/components.json` e `docs/component-inventory.md` são derivados desse catálogo. Agents e ferramentas devem consultar os campos `readiness`, `readinessNotes`, `responsibility` e `runtime`, sem inferir prontidão pela existência de CSS ou página de docs.

### 6. Gate para promoção a App-ready

Um componente com HTML nativo ou apenas apresentação precisa:

1. anatomia e variantes públicas documentadas;
2. estados visuais e light/dark verificados;
3. semântica, teclado nativo, focus e ARIA aplicável validados;
4. contrato de import, empacotamento e uso público protegidos por testes;
5. contrato protegido por testes e CHANGELOG.

Um componente `ds-runtime` precisa adicionalmente:

1. módulo público exportado pelo pacote;
2. API de inicialização e destruição segura;
3. suporte previsível a renderização dinâmica, mount/unmount e hydration;
4. eventos públicos documentados;
5. testes DOM de teclado, foco, fechamento, limpeza e axe em projeto consumidor.

Até cumprir esse gate, o componente permanece Experimental mesmo que tenha CSS, Figma e runtime parcial.

### 7. Classificação (atualizada com evidências do gate)

| Readiness | Componentes |
|---|---|
| App-ready | Button, Input Text, Textarea, Select, Checkbox, Radio, Toggle, Badge, Alert, Card, Breadcrumb, Avatar, Divider, Spinner, Skeleton, Combobox, Modal, Menu, Accordion |
| Composição | Pagination, Form Field |
| Experimental | Tooltip, Tabs |

Promoção exige módulo público com init/destroy, eventos, teste DOM de ciclo de vida e evidência de consumo. Tabs e Tooltip permanecem Experimentais até terem módulo público.

### 8. Sequência de implementação

1. Publicar readiness e responsabilidade na API e no inventário.
2. Fazer o guia de consumo orientar devs e agents por readiness.
3. Distribuir o catálogo machine-readable e o contexto mínimo para agents junto ao pacote.
4. Criar projeto consumidor de smoke test com instalação do tarball real.
5. ~~Endurecer Combobox, Modal e Menu com ciclo de vida e testes DOM.~~
6. Publicar runtimes de Accordion, Tabs e Tooltip ou reduzir formalmente seus contratos.
7. Promover componentes individualmente quando todos os gates passarem.
8. Só então decidir adaptador oficial por tecnologia com base em demanda real.

## Consequências

### Positivas

- Desenvolvedores sabem o que o pacote mantém e o que pertence à aplicação.
- Agents IA recebem limites machine-readable e deixam de inferir completude pela aparência das docs.
- Componentes incompletos ficam visíveis sem desvalorizar composições intencionais.
- Integrações futuras partem de um contrato estável, reduzindo drift entre tecnologias.
- O roadmap passa a promover componentes por evidência, não por contagem de artefatos.

### Negativas

- Alguns componentes existentes passam a aparecer como Experimentais apesar de terem Figma, CSS e documentação.
- A promoção exige novos testes de consumidor e trabalho de ciclo de vida em runtimes.
- O catálogo adiciona metadados que precisam acompanhar mudanças na API pública.
- A estratégia adia adaptadores React, Flutter e ecossistemas similares.

## Alternativas consideradas

### Considerar todo componente com CSS e docs como pronto

Descartada. Essa classificação não captura comportamento, teclado, focus management, lifecycle nem consumo real do pacote.

### Publicar React + Radix primeiro

Descartada como prioridade. Radix pode acelerar comportamento React no futuro, mas criaria uma segunda superfície antes de o contrato stack-agnóstico estar completo.

### Usar shadcn ou MUI como implementação canônica

Descartada. Ambos introduzem APIs, anatomias e ciclos de atualização próprios. Podem receber integrações futuras, mas não resolvem a prontidão do núcleo atual.

### Manter readiness apenas em documentação textual

Descartada. Devs e agents precisam do mesmo contrato; a classificação deve ser derivada de uma fonte compartilhada e exposta em JSON.

## Referências

- ADR-002 — Stack agnóstica: HTML + CSS + vanilla JS como base.
- ADR-004 — WCAG 2.2 AA como padrão de acessibilidade.
- ADR-017 — Componentes CSS-only.
- ADR-019 — Component tokens como contrato anatômico.
- WAI-ARIA Authoring Practices Guide — padrões de Accordion, Combobox, Dialog, Menu, Tabs e Tooltip.
