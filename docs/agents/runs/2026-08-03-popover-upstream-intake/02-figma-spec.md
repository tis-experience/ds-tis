- Status: Ready for owner review

# Resultado Figma proposto — sem mudança, com evidência

- Componente/padrao: Popover.
- Pagina Figma: `10333:817`; root `10333:818`; component set `10332:504`.
- Referencias DS Core consultadas: Modal `155:370`, Tooltip `194:39`, Menu
  `7983:87` e o próprio Popover vivo.
- Referencias externas consultadas: shadcn/Base UI, Ark UI e Zag Popover.

## Decisão proposta

Não editar o Figma neste gate. As diferenças upstream identificadas são de
comportamento, positioning e API de adapter. O contrato visual/anatômico atual
está consistente e não há lacuna comprovada que justifique alterar component set
ou documentação.

## Contrato preservado

- Root único da página, `clipsContent=false` e sete seções internas.
- Component set com quatro placements: `Bottom`, `Top`, `Left`, `Right`.
- 13 properties públicas para header, title, arrow, content text, Content Slot,
  close, actions e placement.
- Pares BOOLEAN → propriedade dependente preservados.
- Content Slot vazio e oculto por default.
- Title/Body com Text Styles e fields tipográficos bindados.
- Panel, close, arrow e actions usando bindings do contrato TIS.

## O que não vira Figma agora

- `align`, `alignOffset`, `sideOffset`, portal e positioning;
- controlled/uncontrolled, nested popovers e multiple triggers;
- SSR/hydration, lifecycle ou provider;
- nomes Base UI, Ark UI, Zag ou shadcn;
- states derivados de data attributes de um provider.

Esses itens pertencem à comparação de adapters. Só voltam ao Figma se a
implementação aprovada provar uma nova decisão visual pública, caso em que esta
spec deve ser reaberta.

## Evidência

- `evidence/figma-live-contract.md`;
- `evidence/figma-model-comparison.md`;
- `evidence/figma-popover-root-2026-08-03.png`;
- screenshots de Modal, Tooltip e Menu em `evidence/`;
- `evidence/upstream-benchmark.md`;
- `evidence/provider-comparison.md`.

## Validação do resultado

- Estrutura: passou em leitura viva; um root, set aninhado e zero nós soltos.
- Contrato: 13 properties e referências verificadas nos quatro variants.
- Documentação: API viva corresponde à tabela da página.
- Visual: comparado com três páginas modelo; diferença de largura/ordem é
  específica do conteúdo e não representa regressão.
- Tokens: nenhum token novo ou alteração proposta.

## Bloqueado antes de

- Figma write: não aplicável a este resultado; qualquer mudança reabre a spec.
- Repo/core/adapters: dependem de autorização específica para construir os dois
  saídas isoladas.
- Commit/push/release: não autorizados.
