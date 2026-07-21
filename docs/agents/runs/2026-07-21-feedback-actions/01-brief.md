- Status: Aguardando aprovação do owner
- Role: DS Architect
- Run: `docs/agents/runs/2026-07-21-feedback-actions`

# Brief proposto

- Nome: Feedback Actions (correção estrutural em Alert + Toast)
- Classe: Correção de anatomia / nested instance (não é componente novo de produto)
- Problema: No Figma, as Actions de Alert e Toast estão implementadas como FRAME + TEXT com padding/radius/font literais — sem component set, sem estados hover/pressed/focus/disabled, sem bindings reais. Isso diverge do brief original do Toast (Action = Button ghost/sm), do código (`ds-button--ghost ds-button--sm`) e da prática de DSs maduros (Polaris, Carbon, Material, Atlassian).
- Usar quando: Alert ou Toast precisa de 1–2 CTAs curtos abaixo da description (ex.: Desfazer, Retry, Ver detalhes).
- Nao usar quando: Ação principal da página (use Button no fluxo); navegação densa; mais de 2 actions; formulário dentro do feedback.
- Diferencas para componentes proximos:
  - **Button (produto):** átomo canônico; Feedback Actions **reusam** Button (opção A) ou um átomo interno derivado (opção B), não reinventam.
  - **Link:** não é o padrão desta run; CTAs de feedback são botões ghost/text.
  - **Close / dismiss:** continua icon-only separado; não conta como Action 1/2.
- Acessibilidade/semantica:
  - Actions são `<button>` / instâncias Button com foco visível (focus ring do Button).
  - Ordem de foco: conteúdo → Action 1 → Action 2 → Close.
  - Labels curtos (1–3 palavras); verbo no infinitivo/imperativo PT-BR.
  - Toast com action: sem auto-hide (já decidido na run Toast).
- Composicao DS:
  - **Opção A (default):** nested instance de **Button** `Style=Ghost` + `Size=Sm` dentro da fileira Actions.
  - **Opção B (escape):** átomo interno `.Feedback Action` (prefixo `.` = oculto no Assets) com Type×Style do host, states do Button, tokens `alert|toast/action/*` — só se A falhar o critério de escape.
  - Fileira `Actions`: Auto Layout horizontal; gap token; Hug; some por completo quando Show Action 1 = false (zero espaço).
- Variants/states candidatos:
  - Host (já existentes): Type × Style (Subtle | Solid) em Alert e Toast.
  - Actions: **não** viram variant do host; boolean Show Action 1/2 + Text labels.
  - States da action: herdados do Button (Default / Hover / Pressed / Focus / Disabled) — obrigatórios no Figma via nested set, não frame estático.
- Slots: nenhum slot livre; só booleans + labels (+ nested props expostas).
- Tokens:
  - Preferir tokens já existentes `alert/action/color/*` e `toast/action/color/*` aplicados via override limpo na instância (A) ou bindings nativos do átomo B.
  - Espaçamento da fileira: `alert|toast/actions/gap` (já no JSON Component).
  - Sem Foundation direto; Component → Semantic only.
- Docs Figma: atualizar `section-action` / anatomy / properties em Alert e Toast; sem página nova.
- Impacto repo: **congelado** nesta run até Figma Auditor + owner. Repo já tem Button ghost + classes de action; eventual alinhamento só após audit (wire label, cores Solid, docs se API mudar).
- Fora de escopo: novo componente de produto; Popover; Link como action; 3+ actions; redesign visual de Alert/Toast além da fileira Actions; bump/publish; commit/push sem pedido.
- Bloqueado antes de: qualquer `use_figma` / escrita Figma; qualquer mudança CSS/tokens/docs de produto; commit/push — até aprovação explícita deste brief + `02-figma-spec.md`.
- Aprovacao necessaria: (1) opção A como default; (2) critério de escape B; (3) máx. 2 actions abaixo da description; (4) Figma-first e freeze de repo até audit; (5) Alert e Toast no mesmo contrato.

## Estado atual isolado

- Preflight 2026-07-21: branch `feat/toast`, dirty (~35 arquivos — inclui trabalho prematuro de Actions no repo); snapshot Figma ~15min.
- Run Toast `2026-07-20-toast`: gates marcados approved, mas Actions no Figma ficaram como FRAME+TEXT (dívida admitida).
- Fora de escopo desta run: limpar/reverter o dirty do repo; só documentar e, após gates, alinhar o mínimo necessário.
- Trabalho desta role: apenas `01-brief.md` e `02-figma-spec.md`.

## Benchmark (Figma)

| Fonte | Aprendizado |
|-------|-------------|
| Polaris Banner | Nested Button plain/secondary; até 2 actions |
| Carbon Notification Actionable | Button real (ghost/tertiary); máx. 1; não frame local |
| Material Snackbar | Nested TextButton tipado; boolean hasAction |
| Atlassian Flag | Actions do kit, não desenho solto |
| Figma nested instances | Expor props do Button no parent; boolean + text |

Canvas de referência: `canvases/feedback-actions-figma-benchmark.canvas.tsx`.

## Classificação final

Correção estrutural de **nested atom** em dois hosts existentes (Alert, Toast). Não cria página nova nem SemVer próprio; pode acompanhar a minor Toast na release futura.

## Anatomia alvo (Actions)

```
Alert|Toast
└── Content
    ├── Title
    ├── Description
    └── Actions                    ← Hug; visible ↔ Show Action 1
        ├── Action 1               ← Instance Button Ghost/Sm  (ou .Feedback Action)
        └── Action 2               ← Instance Button Ghost/Sm  (visible ↔ Show Action 2)
```

## Critério de escape A → B

Builder **começa em A**. Escala para B **somente** se, após tentativa documentada, **qualquer** condição for verdadeira:

1. Contraste do label da action em Style=Solid (qualquer Type) < 4.5:1 no screenshot/cálculo, **e** override limpo de fill do texto na nested Button exige detach ou binding Foundation/Component→Component.
2. Não for possível expor `Label` do Button via nested instance properties no painel do Alert/Toast (label continua só editável abrindo a camada).
3. Estados Hover/Pressed/Focus/Disabled da action não aparecem no component set do Button nested (instância morta / detach).

Escalada B exige **nota no build report + aprovação rápida do owner** antes de criar o átomo `.Feedback Action`. Não improvisar frame+texto de volta.

## Decisões pedidas ao owner

1. Confirmar **Opção A** como default e o **critério de escape B** acima?
2. Confirmar máx. **2** actions, fileira **abaixo** da description, em Alert e Toast?
3. Confirmar **freeze de repo** até Figma Auditor + aprovação do gate `figma-audit`?
4. Se A passar: Action Label no painel = nested prop do Button (não TEXT órfão no parent)?

## Handoff bloqueado

- Próxima role após aprovação: **Figma Builder**
- Entrada: este brief + `02-figma-spec.md`
- Ordem sugerida: Alert Actions → Toast Actions (mesmo contrato) → screenshots vs Button + Alert page modelo
- Não escrever Figma até o owner aprovar este gate
