# Princípios da marca — Design System TIS

> Este documento define a expressão de marca do **Design System TIS**. Ele não
> substitui diretrizes institucionais corporativas; traduz a identidade disponível
> no repositório em regras operacionais para produto, documentação e componentes.

## Missão

Dar a designers, developers e agents IA uma base visual e comportamental
confiável para construir produtos TIS consistentes, acessíveis e sustentáveis,
sem acoplar a experiência a um framework específico.

## Princípios de design

### 1. Clareza antes de ornamentação

Cada decisão visual deve tornar hierarquia, estado ou próxima ação mais fácil
de entender. Cor, espaçamento e motion têm função; decoração sem informação
não deve competir com o conteúdo.

**Exemplo concreto:** um Button destructive combina label explícita, cor de
feedback e focus ring visível; a cor não é o único sinal.

**Anti-padrão:** criar superfícies, sombras ou badges apenas para preencher
espaço ou simular hierarquia que o conteúdo não sustenta.

### 2. Acessibilidade é parte da identidade

WCAG 2.2 AA é o piso do sistema. Contraste, semântica, teclado, foco, target e
motion reduzida fazem parte do componente desde o primeiro estado; não são uma
camada adicionada depois.

**Exemplo concreto:** componentes interativos preservam foco perceptível nos
modos light, dark e forced colors, com comportamento de teclado documentado.

**Anti-padrão:** remover outline, depender apenas de hover ou usar texto brand
sem validar o fundo real em que ele aparece.

### 3. Contratos explícitos, composição flexível

Tokens, anatomia pública, readiness e responsabilidade de runtime devem ser
legíveis por pessoas e máquinas. O núcleo permanece stack-agnostic e
intrinsic-first; cada produto pode compor layouts e wrappers locais sem
inventar APIs oficiais do DS.

**Exemplo concreto:** um agent consulta `ds-tis/metadata/components`, monta a
anatomia documentada e inicializa o runtime público quando ele é obrigatório.

**Anti-padrão:** copiar uma aparência com classes internas, omitir estados ou
apresentar um wrapper de framework local como componente oficial.

## Tom de voz

### Atributos

- **Claro:** usa termos específicos e explica a próxima ação.
- **Direto:** evita introduções longas, jargão desnecessário e promessas vagas.
- **Responsável:** descreve limites, estados e riscos sem culpar a pessoa usuária.

### Isso, não aquilo

| Isso ✓ | Não isso ✗ | Por quê |
|---|---|---|
| "Digite um e-mail no formato nome@empresa.com." | "Entrada inválida." | Explica como corrigir. |
| "Salve as alterações." | "OK" | A ação fica previsível. |
| "Este componente exige `ds-tis/modal`." | "O comportamento é automático." | Explicita a responsabilidade do runtime. |
| "Ainda não há publicação nesta versão." | "Em breve." | Registra o limite verificável. |

## Identidade visual

### Cor

A paleta brand padrão é azul e pode ser substituída pelo contrato white-label.
Componentes não consomem Foundation diretamente: usam tokens Semantic ou
Component conforme a anatomia.

| Role | Token canônico | Valor atual | Uso |
|---|---|---|---|
| Brand fill | `foundation.color.brand.600` | `#0065ED` | CTA e superfícies brand com foreground de contraste. |
| Brand content | `foundation.color.brand.700` | `#0050DA` | Texto e links sobre fundos claros, via Semantic. |
| Brand dark | `foundation.color.brand.400` | `#56A7FA` | Conteúdo brand em superfícies dark, via Semantic. |
| Neutral canvas | `foundation.color.neutral.50` | `#F8FAFC` | Base clara; consumidores usam o Semantic correspondente. |

O seed do Theme Playground é `#0056E0`; o engine gera a escala completa e
audita os pares de contraste antes da exportação.

### Tipografia

| Role | Família | Fallback | Uso |
|---|---|---|---|
| Display e headings | Inter | system-ui, Segoe UI, Roboto, sans-serif | Títulos e hierarquia editorial. |
| Body e controls | Inter | system-ui, Segoe UI, Roboto, sans-serif | Texto corrido, labels e controles. |
| Code | DM Mono | JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace | Snippets, tokens e dados técnicos. |

Use apenas os tokens de tipografia publicados. Não simule bold ou italic e
não comprima a fonte para acomodar labels.

### Logo

- **Versão principal:** `docs/assets/logo-tis.svg`, para contextos com espaço horizontal.
- **Versão reduzida:** `docs/assets/logo-tis-mark.svg`, para topbar, avatar de produto e favicon.
- **Cor:** o mark reduzido é branco e deve ficar sobre uma superfície que garanta contraste; não recolorir pontos individualmente.
- **Área de segurança:** preservar ao redor do mark no mínimo o diâmetro de um ponto do símbolo (`1x`).
- **Tamanho digital mínimo:** `24px` para o mark; a topbar da documentação usa `36px`.
- **Uso indevido:** não distorcer, girar, alterar proporção, remontar os pontos ou aplicar efeitos que reduzam legibilidade.

## Acessibilidade como princípio

A marca do Design System TIS se compromete com WCAG 2.2 AA como mínimo:

- contrastes validados nos modos light e dark;
- navegação por teclado funcional em todos os componentes interativos;
- semântica e estados anunciáveis por screen readers;
- motion reduzida respeitada via `prefers-reduced-motion`;
- focus visible nunca removido ou escondido;
- forced colors preservado para controles e estados essenciais.

Exceções precisam estar registradas, ter impacto conhecido e não podem ser
apresentadas como comportamento aprovado do sistema.
