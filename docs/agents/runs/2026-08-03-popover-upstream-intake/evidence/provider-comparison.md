# Matriz de paridade das três saídas — Popover

- Status: implementações independentes validadas localmente; release pendente
- Regra: HTML/CSS/JS, Ark/Zag e React/shadcn/Base UI coexistem, usam os mesmos
  cenários de paridade e permanecem em sources separados

| Dimensão | TIS atual | shadcn/Base UI | Ark/Zag | Classificação/decisão |
|---|---|---|---|---|
| Anatomia e classes públicas | `ds-popover*`, close, arrow, content e actions | adapter TIS sobre Base UI | adapter TIS sobre Ark/Zag | Web preservado; adapters mantêm contrato visual sem imports cruzados |
| ARIA e semântica | `role=dialog`, `aria-haspopup`, `controls`, `expanded` | Title/Description nativos | Title/Description e máquina Zag | `adapter-only`: mapear sem renomear TIS |
| Foco inicial e retorno | primeiro foco/panel + retorno | provider controla | configurável no provider | `adapter-only`; validar mesma regra TIS |
| Escape e click externo | implementados no runtime | provider controla | props explícitas | `adapter-only`; preservar defaults TIS |
| Controlled/uncontrolled | runtime imperativo + eventos | Root Base UI | Root/usePopover | `adapter-only`; intenção comum com APIs próprias |
| Portal e positioning | absoluto no root, collision simples | Portal/Positioner, side/align | Portal/Positioner, anchor/sameWidth | `adapter-only`; não alterar core agora |
| Nested/multiple triggers | não contratado | não evidenciado no recipe | suporte documentado | `reject` na v1; avaliar somente como capacidade vNext |
| Lifecycle e eventos TIS | exports/eventos públicos | exige ponte | exige ponte | `adapter-only`; nomes TIS permanecem |
| Tokens e dark mode | contrato TIS completo | descartar recipe visual | headless | `web-core`: consumir apenas tokens/classes TIS |
| RTL/logical side | CSS usa logical inset, placement público físico | recipe Base cobre logical sides | positioning suporta direção | `docs-only/adapter-only`; testar antes de propor API |
| Figma | 13 properties, 4 placements, estrutura madura | nenhuma autoridade | nenhuma autoridade | `figma-core`: sem mudança proposta |
| SSR/hydration | não aplicável ao core atual | Storybook, docs e consumer Vite passaram | Storybook e docs passaram | validado no escopo atual; SSR de framework consumidor permanece responsabilidade da integração |
| Bundle/dependências | baseline Web existente | preview 55,44 KiB gzip | preview 40,38 KiB gzip | dentro dos budgets, medidos isoladamente |
| Portabilidade | Web estável | React específico | Ark por tecnologia | diferença legítima; nenhuma saída elimina outra |
| Consumer real | Web existente | 22 componentes instalados via registry | adapter carregado por subpath/story | passou sem misturar providers |

## Comparação Figma

O alvo vivo foi comparado com Modal (`155:370`), Tooltip (`194:39`) e Menu
(`7983:87`). Todas as páginas usam um root único, `clipsContent=false`, header,
divider e seções internas; largura e ordem variam legitimamente conforme o
padrão. O Popover mantém o mesmo vocabulário visual e documenta propriedades,
exemplo, variants, acessibilidade e diferenças sem nós soltos.

Resultado proposto: **Figma sem mudança, com evidência**. O upstream trouxe
capacidades comportamentais, não uma lacuna visual/anatômica comprovada.

## Resultado local

- As três saídas abrem, posicionam e fecham o Popover sem overflow em desktop e
  390px.
- Ark/Zag e React/Base UI mantêm close icônico no cabeçalho e ação textual no
  rodapé; o browser gate diferencia os dois controles por nome acessível.
- Escape, retorno de foco, dark mode, Axe e consumer real passaram.
- Apenas commit, push, PR e release ainda dependem de autorização específica.
