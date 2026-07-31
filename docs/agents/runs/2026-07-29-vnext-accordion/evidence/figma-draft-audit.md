# Evidência objetiva — draft Figma Accordion vNext

- Arquivo: `VJtzLJV8Ie9yq7b00jfT2g`
- Página: `2:6`
- Root: `5:9`
- Data da leitura viva: 2026-07-29

## Estrutura

| Verificação | Resultado |
|---|---:|
| Filhos diretos da página | 1 |
| Frames raiz | 1 |
| Seções dentro do root | 7 |
| Ordem das seções correta | sim |
| Frames com `clipsContent=true` | 0 |
| Frames colapsados para 1 px | 0 |
| Frames placeholder | 0 |
| Textos documentais sem auto-height | 0 |
| Componentes locais soltos no canvas | 0 |

## Instâncias

| Verificação | Resultado |
|---|---:|
| Instâncias principais de Accordion | 6 |
| Nested instances remotas | 7 |
| Instâncias detached | 0 |
| Component set publicado usado | `Accordion Item` |
| Key | `7ef5c5fcc4bf4dd635a5534c5bc47de1452dd22a` |

## Comparação visual

| Artefato | Node | Evidência persistida |
|---|---|---|
| Accordion vNext após correções | `5:9` | `figma-accordion-vnext-after-audit.png` |
| Accordion original | `8519:3603` | `ds-tis-original-accordion.png` |
| Checkbox original | `135:8` | `ds-tis-original-checkbox.png` |
| Select original | `146:20` | `ds-tis-original-select.png` |

O draft preserva o frame raiz único, a documentação em seções, os exemplos de estados, a API e os critérios de acessibilidade. A largura do canvas e a organização em cards são específicas do Figma e não definem o layout Astro nem alteram os componentes publicados.

## Correções da primeira auditoria

- `ReactNode` removido do contrato cross-stack.
- `itemId` alinhado entre contrato, matriz e exemplo React.
- 29 textos documentais vinculados a Text Styles publicados do DS TIS.
- Matriz de 12 linhas validada com `unmappedRows=0`.
- Screenshots do alvo e dos três modelos persistidos nesta run.
