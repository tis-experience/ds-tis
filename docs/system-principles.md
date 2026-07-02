# System principles — Design System Core

> Este documento define como o design system opera como sistema.
> Não é sobre a marca (isso é `brand-principles.md`), nem sobre tokens (isso é `token-schema.md`).
> É sobre as regras que governam o sistema como um todo: como as partes se conectam,
> o que é fonte de verdade pra quê, e o que acontece quando algo desalinha.
>
> Leitura obrigatória antes de propor qualquer mudança estrutural no DS.
> Referências: ADR-001 a ADR-007, token-schema.md, component-inventory.md.

---

## 1. O sistema é uno, com três manifestações

O design system existe em três lugares ao mesmo tempo. Nenhum deles é o DS sozinho — o DS é a soma dos três, sincronizados:

| Manifestação | Papel | O que vive aqui |
|---|---|---|
| Figma | Origem visual. Onde componentes são desenhados, variantes definidas, e decisões visuais testadas. | Componentes, variáveis (Foundation, Semantic), text styles, páginas de documentação visual. |
| JSON (DTCG) | Convergência canônica. Onde todas as decisões de token se materializam em formato consumível por qualquer plataforma. | Arquivos em `tokens/foundation/` e `tokens/semantic/`. Transformados pelo Style Dictionary em CSS e futuramente em outros formatos. |
| Site de docs | Superfície de consumo. Onde designers e devs consultam uso, variantes, tokens, acessibilidade e exemplos. | Páginas HTML, bilíngues PT-BR + EN. |

Uma mudança em qualquer manifestação que não se propague para as outras duas é uma inconsistência, e inconsistência é defeito.

---

## 2. Hierarquia de verdade

Nem tudo tem a mesma fonte de verdade. Quando houver divergência, resolve-se por tipo:

| Tipo de informação | Fonte de verdade | As outras manifestações seguem |
|---|---|---|
| **Decisões arquiteturais** (camadas, naming, regras de referência, convenções) | **ADRs em `docs/decisions/`** | Todos os artefatos implementam. **ADR prevalece sobre tudo**, inclusive sobre Figma. |
| **Valores de token** (hex, alpha, qual shade, qual cor) | **Figma Variables** (revisada em ADR-003, 0.5.8) | JSON em `tokens/` espelha via sync manual. CSS é gerado. Site documenta. |
| **Arquitetura de token** (naming, camadas, referências — é uma instância do tipo anterior, mas merece destaque) | ADRs + JSON em Git como consolidação | Figma segue a arquitetura; Figma **não** pode criar camadas/naming que contradigam ADR. |
| **Design visual de componente** (layout, proporções, variantes, anatomy) | Figma | CSS reflete usando tokens semânticos. Site documenta. |
| **Documentação de uso** (quando usar, best practices, acessibilidade) | Site de docs em `docs/*.html` | Figma pode ter notas visuais complementares. |

Regras operacionais:

- **Arquitetura > valor**. Figma pode decidir "`brand.hover` é `blue.800` em vez de `blue.700`" (valor). Figma **não pode** decidir "vamos criar `semantic.brand.foreground`" se ADR-011 define que semantic de cor usa `brand.content.contrast` (arquitetura). Mudança arquitetural exige ADR antes da implementação.
- **Figma > JSON em valor**. Quando o Figma mostra `blue.800` pra `brand.hover` e o JSON mostra `blue.700`, o Figma prevalece — rodar `npm run sync:tokens-from-figma:write` pra consolidar.
- **Figma > CSS em design visual**. Se o Figma mostra um componente com border-radius de 8px e o CSS renderiza 6px, o Figma prevalece e o CSS deve ser corrigido.
- **JSON > Figma em consolidação**. JSON é a fonte que alimenta build-tokens.mjs. Nenhum pipeline consome Figma direto. Então mesmo que "Figma é autoridade de valor", **nada roda sem JSON atualizado**. O sync é a ponte.
- **Nunca editar `tokens/*.json` à mão** num commit normal. Fluxo: Figma → `sync:tokens-from-figma --write` → review do diff → PR. Duas exceções: (a) PRs do próprio script de sync, onde o JSON é gerado automaticamente; (b) categorias CSS-only definidas em [ADR-016](./decisions/ADR-016-tokens-sem-equivalencia-no-figma.md) — `motion.*`, `z.*`, `shadow.*` — que vivem só em JSON porque Figma não as representa como Variables.

---

## 3. Tokens são transversais

Um token não pertence a um componente. Ele pertence ao sistema.

Quando um token é criado, renomeado, removido ou tem seu valor alterado, o impacto deve ser avaliado contra todos os componentes que o consomem — não apenas o que está em foco no momento.

Na prática:

- Antes de alterar `semantic.brand.background.hover`, verificar quais componentes usam esse token (Button, Input, Select, Checkbox, Toggle, Tabs, links, etc.).
- Antes de criar um novo token semântico, verificar se o conceito é genuinamente reutilizável por múltiplos componentes. Se só um componente precisa, é token de componente — não semântico.
- Antes de propor tokens dimensionais (height, padding, font-size), auditar os componentes que compartilham estrutura similar. Exemplo: Button, Input, Select e Textarea compartilham controles interativos com sizes sm/md/lg — tokens dimensionais devem refletir isso (ver ADR-006).

A validação cruzada não é opcional. Tokens analisados isoladamente geram decisões que precisam ser refeitas quando outros componentes entram em escopo.

### Quando criar um token em Semantic

Critério operacional para decidir a camada de um novo token: a pergunta não é
"é sobre componentes?" — é "quantos componentes consomem essa intenção?".

- **Semantic** quando dois ou mais componentes consomem a mesma intenção. Mesmo
  que a categoria seja restrita a um tipo (ex: `semantic.size.control.*` se
  aplica só a controles interativos), o token mora em semantic porque expressa
  intenção compartilhada. Exemplos: `semantic.border.control.*` (ADR-009),
  `semantic.space.control.*` (ADR-006), `semantic.toned.*` (ADR-007).
- **Component** quando a decisão descreve anatomia pública de um componente
  (`target`, `box`, `track`, `thumb`, `icon`, `label`) e precisa ser consumida
  por CSS, Figma bindings ou docs como contrato do componente. Component tokens
  podem aliasar Semantic 1:1 quando isso melhora a leitura do contrato.

A motivação é operacional. Intenção compartilhada vivendo em component obriga
edição em N arquivos sem garantia de consistência. Anatomia de componente
vivendo só em semantic gera nomes falsamente genéricos e confunde variant de
componente com escala global. ADR-019 separa esses dois usos.

A regra "categoria restrita não desclassifica como semantic" continua válida:
`control.*` pode existir em Semantic quando o padrão é reutilizável entre
controles. Quando o conceito só faz sentido dentro da anatomia de um componente,
ele pertence a Component.

---

## 4. As três camadas de token têm regras de referência

```
Foundation (valores absolutos: hex, rem, px)
    ↑ referenciada por
Semantic (intenção: aliases pra foundation, modo light/dark)
    ↑ referenciada por
Component (contrato anatômico de componente)
```

Regras invioláveis (detalhadas em `token-schema.md`):

- Foundation é a única camada com valores absolutos.
- Semantic referencia foundation, nunca valores hardcoded.
- Component referencia semantic sempre que houver intenção reutilizável; exceções específicas precisam de ADR explícita.
- Consumidores finais (CSS, Figma bindings e docs de componente) consomem component tokens quando o componente já foi migrado; durante a transição, semantic direto ainda é permitido.
- Textos em componentes Figma usam text styles; não devem bindar typography variables diretamente.
- Novos tokens que criam categorias ou quebram hierarquia exigem ADR.

---

## 5. Sincronização entre manifestações

### Fluxo de mudança por tipo

**Mudança de token (valor, nome, estrutura):**
1. Ajustar Figma Variables quando a mudança é visual ou de valor
2. Rodar Style Dictionary → CSS gerado
3. Consolidar JSON em `tokens/` via fluxo de sync Figma → JSON
4. Validar que componentes CSS e Figma renderizam igual
5. Atualizar site de docs se afeta página de tokens ou componente

**Mudança visual de componente (layout, variante, proporção):**
1. Ajustar no Figma (fonte de verdade visual)
2. Se a mudança implica novo token ou alteração de token → atualizar JSON primeiro, depois CSS
3. Se é só CSS → atualizar CSS pra refletir o Figma
4. Atualizar site de docs

**Nova decisão arquitetural:**
1. Redigir ADR em `docs/decisions/`
2. Implementar em JSON
3. Propagar pra Figma e CSS
4. Atualizar docs internos (token-schema.md, component-inventory.md, CLAUDE.md)
5. Atualizar site de docs se afeta conteúdo público

### Checklist de sincronização

Após qualquer mudança significativa, validar:

- [ ] JSON reflete a decisão
- [ ] CSS gerado pelo Style Dictionary está correto
- [ ] Figma Variables estão alinhadas com JSON (mesmos nomes, mesmos valores por modo)
- [ ] Componentes Figma usam as variáveis corretas (binding, não hardcoded)
- [ ] Componentes CSS renderizam igual ao Figma
- [ ] Site de docs reflete o estado atual
- [ ] ADR existe se a mudança é estrutural

---

## 6. Decisões exigem registro

Se uma decisão arquitetural não está registrada como ADR, ela não foi tomada. Discussões em chat, acordos verbais ou "ficou implícito" não contam.

### O que exige ADR

- Nova camada ou categoria de token
- Mudança em regra de referência entre camadas
- Adoção ou troca de ferramenta no pipeline (Style Dictionary, Tokens Studio, etc.)
- Mudança de convenção de naming
- Exceção a qualquer regra inviolável
- Decisão que afeta todos os componentes (ex: normalização dimensional)

### O que não exige ADR

- Adição de token seguindo convenções existentes
- Novo componente que segue os patterns estabelecidos
- Correção de bug ou inconsistência
- Atualização de documentação

### ADRs existentes

| ADR | Decisão | Status |
|-----|---------|--------|
| 001 | Migração para DTCG + Style Dictionary | Aceita |
| 002 | Stack-agnostic (HTML + CSS + vanilla JS) | Aceita |
| 003 | Figma = autoridade de valor de token, Git/JSON = consolidação canônica | Aceita (revisada em 0.5.8) |
| 004 | WCAG 2.2 AA como piso de acessibilidade | Aceita |
| 005 | Brand como foundation, `-default` explícito, focus ring outline | Aceita |
| 006 | Semantic control tokens (dimensões compartilhadas entre controles) | Aceita |
| 007 | Toned color system (overlays coloridos) | Aceita |
| 008 | Recalibração das paletas foundation `green` e `amber` | Aceita |
| 009 | Separação de `border.default` (decorativa) e `border.control` (funcional) | Aceita |
| 010 | Remoção de `foundation.color.white` e `foundation.color.black` puros | Aceita |
| 011 | Reestruturação do naming de tokens semânticos de cor (`color/primary/*` → `brand/*`; `text/*` → `content/*`) | Aceita |

---

## 7. Princípios operacionais

1. **Agnóstico de stack.** CSS puro, tokens em JSON DTCG, sem acoplamento a framework. A migração futura pra React/Vue/SwiftUI será de implementação, não de redesign.
2. **ADR é autoridade arquitetural; Figma é autoridade de valor; JSON é consolidação.** Quando divergem, resolve por tipo: arquitetura → ADR; valor de token → Figma (sync manual consolida no JSON); design visual → Figma. **JSON nunca origina valor**, mas **nada roda sem JSON** — ele é o ponto de consumo do pipeline.
3. **Consistência acima de velocidade.** Componente mal especificado gera retrabalho em Figma, JSON, CSS e docs. Definir API (variantes, estados, tokens) antes de implementar.
4. **Acessibilidade desde o início.** WCAG 2.2 AA é piso, não teto. Contrastes calculados, focus ring funcional, navegação por teclado e screen reader testados.
5. **Decisão sem registro não existe.** Se não virou ADR, não foi decidido.
6. **Versionamento obrigatório.** Toda alteração significativa: Figma Changelog (node 195:153), Figma Cover (node 185:3), package.json version bump.

---

## 8. Glossário operacional

| Termo | Significado neste DS |
|---|---|
| Manifestação | Uma das três formas do DS: Figma, JSON, site de docs. |
| Fonte canônica | O artefato que prevalece quando há divergência (JSON pra tokens, Figma pra visual). |
| Transversal | Que afeta múltiplos componentes. Tokens são transversais por definição. |
| Binding | Vincular uma variável Figma a uma propriedade de componente (fill, stroke, padding, radius). |
| Hardcoded | Valor absoluto onde deveria haver referência a token. Defeito em qualquer camada exceto foundation. |
| ADR | Architecture Decision Record. Registro formal de decisão em `docs/decisions/`. |
| Pipeline | Fluxo JSON → Style Dictionary → CSS gerado. |
| Control token | Token semântico dimensional compartilhado entre controles interativos (Button, Input, Select, etc.). Ver ADR-006. |
