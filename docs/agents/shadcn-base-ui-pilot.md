# Piloto React: DS TIS com shadcn e Base UI

## Status

Beta. Esta integração não substitui a v1 nem transforma shadcn em fonte de
verdade. Ela implementa a integração React específica permitida pela ADR-021 e
é distribuída como source por um canal público versionado.

## Decisão operacional

| Camada | Responsabilidade |
|---|---|
| Figma + tokens DTCG | Contrato visual e semântico do DS TIS |
| `ds-tis/css` | CSS público, Component tokens e light/dark |
| Base UI `1.6.0` | Estado, foco, portal e ARIA em React |
| Adapter TIS fino | Setas/Home/End do Accordion e layout tokenizado do Dialog |
| shadcn registry | Distribuição do source code para a aplicação |
| Aplicação consumidora | Ownership do código instalado e das regras de produto |

O piloto não exige Tailwind para estilizar os componentes. O registry injeta o
import público `ds-tis/css`; os sources usam apenas as classes anatômicas do DS e
um adapter CSS mínimo para separar Backdrop e Viewport do Dialog Base UI.

## Benchmark curto

- O registry oficial shadcn oferece distribuição de source code, target aliases,
  `registry:base` e validação de catálogo. Isso serve como modelo de entrega.
- Base UI oferece primitives React headless; sua API de Accordion usa arrays em
  `defaultValue` e sua API de Dialog separa Backdrop, Viewport e Popup. O
  Accordion Base UI não cobre as setas/Home/End já publicadas pelo DS; o wrapper
  TIS preserva esse contrato sem assumir o estado de expansão.
- O DS TIS já possui contratos visuais de Button, Accordion e Modal. O piloto os
  reutiliza em vez de copiar o visual dos presets shadcn.

## Escopo do piloto

- `tis-base`: dependências, provider fixado e import do CSS estável;
- `button`: primitive necessária para composição idiomática dos exemplos;
- `accordion`: comparação direta com o spike Ark/Zag existente;
- `dialog`: valida portal, inert, foco, Escape, close e retorno de foco.

Select/Combobox fica fora deste incremento. Ele só entra depois que o piloto
provar instalação, atualização, bundle e acessibilidade em consumidor real.

## Consumo esperado

Configure o namespace público no `components.json`:

```json
{
  "registries": {
    "@tis": "https://tis-experience.github.io/ds-tis/registry/v1/{name}.json"
  }
}
```

Depois, instale somente os itens marcados como `beta` em
`docs/api/components.json`:

```bash
npx shadcn@latest add @tis/button @tis/accordion @tis/dialog
```

Durante desenvolvimento local, use `shadcn registry validate` e gere payloads
efêmeros com `shadcn build`; o output não é fonte de verdade e não deve ser
commitado.

### Ordem do import CSS

Depois da instalação, mantenha `@import "ds-tis/css";` como o primeiro
`@import` do CSS global da aplicação, antes de `@fontsource`, Tailwind ou outros
stylesheets. O entrypoint do pacote carrega as fontes antes dos tokens e
componentes, mas o bundler só preserva imports CSS externos quando todos os
`@import` aparecem antes de regras emitidas por outros arquivos.

## Gates para promoção

1. Registry schema e paths válidos pela CLI oficial.
2. Instalação real em projeto Vite/React temporário.
   O build deve passar com `ds-tis/css` como primeiro import global e sem warning
   de ordem de `@import`.
3. Accordion e Dialog navegáveis por teclado e sem violações Axe serious/critical.
4. Paridade visual com os contratos existentes do DS.
5. Bundle incremental medido com o mesmo método do spike Ark/Zag. Accordion e o
   combinado preservam os limites de 12/25 KiB; Dialog Base UI admite 21 KiB
   porque a referência `1.6.0` mede 20,12 KiB, contra o limite Ark de 20 KiB.
6. Política de atualização Base UI e diff de recipes documentada.
7. Consumo por pelo menos uma aplicação antes de qualquer API React pública.

O registry beta passou os gates de schema, instalação, build, browser, teclado,
responsividade, bundle e Axe. `packages/react/src/index.js` continua sem exports:
o contrato público é o source instalado pelo registry, não `@tis/react`.

O plano completo de expansão e o status por componente ficam em
`docs/agents/shadcn-base-ui-implementation-plan.md`.
