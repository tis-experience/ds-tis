# Figma Build Report

- Status: pronto para Figma Auditor
- Componente/padrão: Accordion vNext
- Run: `docs/agents/runs/2026-07-29-vnext-accordion`
- Builder: Codex, role Figma Builder
- Data: 2026-07-29

## Entrada

- Brief: `01-brief.md`
- Spec: `02-figma-spec.md`
- Matriz de contrato: `evidence/accordion-contract-matrix.md`.
- `agents:validate-matrix --strict-exceptions`: passou com 12 linhas, `unmappedRows=0`, zero exceções.
- Snapshot Figma usado: leitura viva dos arquivos `VJtzLJV8Ie9yq7b00jfT2g` e `IE68amP9Hya5ieFw1rX8S8` em 2026-07-29.
- Aprovação do owner: Ark UI + Zag escolhidos e piloto autorizado na conversa.

## Alterações no Figma

- Arquivo criado: [DS TIS — vNext Pilot](https://www.figma.com/design/VJtzLJV8Ie9yq7b00jfT2g)
- Página: `2:6` `❖ Accordion`
- Root: `5:9` `Accordion`, único frame raiz. Suas dimensões são apenas evidência do canvas Figma, não requisito do Astro.
- Seções alteradas: `5:10` a `5:16`.
- Component sets criados: zero.
- Component set consumido: `Accordion Item`, key `7ef5c5fcc4bf4dd635a5534c5bc47de1452dd22a`.
- Instâncias principais: `9:165`, `9:178`, `9:199`, `9:219`, `9:240`, `9:259`.
- Variants exercitadas: Default/Open false, Default/Open true, Focus/Open false, Disabled/Open false.
- Slots: `Content Slot` preservado nas instâncias remotas.
- Tokens/variables criados: zero.
- Linhas da matriz executadas: single, multiple, open, closed, focus, disabled, leading icon, controlled/uncontrolled documentado, heading e landmark documentados.
- Não executadas no Figma: runtime controlled/uncontrolled, SSR/hydration, teclado e landmark; pertencem aos testes do wrapper.
- Correção pós-auditoria: contrato renomeado para `Contrato cross-stack`, `ReactNode` removido e `itemId` alinhado entre matriz, contrato e exemplo React.
- Correção pós-auditoria: 29 textos documentais vinculados a nove Text Styles publicados do DS TIS.

## Validação pós-escrita

- Estrutura lida de volta: `evidence/figma-draft-audit.md`.
- Bindings: nenhuma mudança na anatomia publicada; documentação usa Semantic remota; instâncias mantêm os bindings Component originais.
- Component properties: todas as seis instâncias mantêm `Title`, `Content`, `Content Slot`, `Show Leading Icon`, `Leading Icon`, `State` e `Open`.
- Foco: exemplo Focus usa a variant publicada; o risco de clipping da v1 permanece bloqueio do wrapper final.
- Ícones: nested instances remotas, sem glyph criado no piloto.
- Documentação: somente propriedades reais do component set ou capacidades explicitamente marcadas como contrato futuro.
- `verify:figma-structure`: não executado porque o arquivo piloto não foi exportado para o snapshot canônico e não altera a biblioteca original.
- Screenshot final: `evidence/figma-accordion-vnext-after-audit.png`.
- Modelos persistidos: `evidence/ds-tis-original-accordion.png`, `evidence/ds-tis-original-checkbox.png` e `evidence/ds-tis-original-select.png`.

## Pendências conhecidas

- O arquivo piloto referencia a biblioteca publicada; ainda não é uma cópia independente de todos os assets do DS.
- O draft documenta a API nova, mas não cria um novo component set vNext.
- A página Astro deve seguir sua própria arquitetura de informação e responsividade; não deve reproduzir o canvas ou a composição da página Figma.
- A migração Astro deve reaproveitar JSON, CSS, JS e conteúdo HTML já existentes, com Storybook como preview executável, evitando uma segunda implementação dos componentes.
- O wrapper final precisa corrigir focus clipping e provar `disabled`, 320 px, forced colors, React 18/19, SSR/hydration e tema JSON.
- O budget de 10,24 KiB gzip mede o provider; o entrypoint final ainda precisa ser medido.

## Status tripartite

- Contrato: `passou` para o draft — API neutra, defaults e limites documentados.
- Documentação: `passou` para o draft — sete seções e exemplos coerentes com a API proposta.
- Visual: `passou` para auditoria — screenshot comparado com três páginas maduras, sem clipping ou colapso estrutural.

## Status final

- Pronto para Figma Auditor: sim.
- Bloqueado antes de: repo sync público, implementação promovida, commit, push e publicação.
