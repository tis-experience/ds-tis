# Comparação e classificação

| Achado | Camada | Decisão |
|---|---|---|
| Clear Web sem comportamento | web-core | corrigir e testar sem mudar API |
| Opção `aria-disabled` selecionável no runtime Web | web-core | bloquear ponteiro e teclado |
| Collection e máquina de estado Ark | adapter-only | usar via Ark/Zag |
| Root e parts Base UI | adapter-only | usar somente na receita React |
| Multiple, async, creatable e virtualized | reject | adiar até existir contrato visual |
| Seletor de tecnologia | docs-only | mostrar as três saídas sem eleger provider |

As três saídas compartilham visual, semântica e requisitos de acessibilidade,
mas não compartilham source nem imports.

## Evidência executável

| Saída | Comportamento | Acessibilidade | Bundle gzip |
|---|---|---|---|
| HTML/CSS/JS | filtro, seleção, clear, foco e opção disabled | Axe no gate de navegador | sem provider adicional |
| Ark UI/Zag | story e rota isoladas; teclado, seleção, clear e Escape validados | Axe no portal e Storybook | adapter 32,03 KiB; preview 43,94 KiB |
| React/shadcn/Base UI | fixture instalou 22 componentes e gerou build Vite | interação e Axe no consumidor | registry 50,17 KiB; preview 61,45 KiB |

Os valores medem apenas a rota/componente com React e ReactDOM externos. O
consumidor não baixa as três implementações em conjunto.

## Evidência visual

O estado aberto com filtro `Bra` foi capturado na mesma viewport para comparação:

- `web-open-2026-08-28.png`
- `ark-open-2026-08-28.png`
- `react-open-2026-08-28.png`

O indicador de campo obrigatório foi alinhado entre os três exemplos após a comparação.
