# ADR-001: Migração da arquitetura de tokens para Foundation→Semantic→Component com DTCG + Style Dictionary

**Data:** 2026-04-14
**Status:** Aceita — superseded em parte por [ADR-014](ADR-014-action-tokens-role-style.md) (themes Default/Ocean/Forest removidos em 0.8.0; Brand virou paleta única customizável)

## Contexto

O DS foi construído com uma arquitetura Foundation→Brand→Theme onde:
- Foundation: 192 variáveis primitivas (cores, tipografia, spacing, radius, shadows, opacity)
- Brand: 13 variáveis como ponte entre 3 temas de marca (Default/Blue+Purple, Ocean/Cyan+Indigo, Forest/Emerald+Amber)
- Theme: 94 variáveis semânticas com modos Light e Dark

Os tokens eram definidos manualmente em arquivos CSS (foundation.css, theme-light.css, theme-dark.css, themes/). A camada Brand servia para testar diferentes combinações de cor, mas o DS será utilizado como marca única.

Problemas identificados:
1. A camada Brand perde propósito sem multi-marca
2. Não existe camada de tokens por componente — componentes consomem tokens semânticos diretamente sem abstração
3. Tokens em CSS manual não são portáveis para outras plataformas (iOS, Android, etc.)
4. Não há build pipeline — alterações exigem edição manual em CSS e sincronização manual com Figma Variables

## Decisão

Migrar para arquitetura Foundation→Semantic→Component com tokens definidos em JSON (formato DTCG) e transformados via Style Dictionary.

**Foundation** (primitivos): valores brutos sem opinião semântica. Cores com escala 50-950 (11 stops), tipografia, spacing (escala 4px), radius, shadows, opacity. Equivalente direto da Foundation atual.

**Semantic** (intenção): absorve o papel da camada Theme atual + os 13 tokens de Brand. Define: surface, text, border, feedback, state, space, radius. Com modos Light e Dark. Referencia Foundation via aliases.

**Component** (aplicação): NOVA camada. Tokens específicos por componente (button.background.default, input.border.error). Referencia Semantic. Usado diretamente no código e vinculado no Figma.

**Formato canônico:** JSON com spec DTCG ($value, $type, $description). Transformado pelo Style Dictionary + @tokens-studio/sd-transforms em CSS custom properties (--ds-*).

**Comunicação com Figma:** os JSONs de token são a fonte canônica. Figma Variables são mantidas em sync via scripts ou use_figma, preservando a mesma hierarquia (Foundation collection, Semantic collection, Component collection) e mapeamento de nomes (JSON dot-notation → Figma slash-separated).

## Consequências

- CSS custom properties passam a ser GERADAS, não escritas à mão
- O diretório `css/tokens/` passa a ser output do Style Dictionary, não editado diretamente
- A pasta `tokens/` na raiz do repo é a nova fonte canônica (JSONs)
- A coleção "Brand" no Figma pode ser removida ou renomeada para "Semantic"
- Os 3 temas (Default, Ocean, Forest) deixam de ser funcionalidade core — podem ser mantidos como exemplos em `tokens/examples/`
- Figma Variables precisam ser reestruturadas em 3 coleções: Foundation, Semantic, Component
- Todos os 18 componentes CSS precisam ser auditados para garantir que consomem tokens semânticos (não primitivos)
- O arquivo `package.json` precisa de scripts de build para Style Dictionary

## Alternativas consideradas

**Manter CSS manual:** Descartada porque não escala para multi-plataforma e exige sincronização manual com Figma.

**Tokens Studio plugin:** Avaliado como intermediário Figma↔Git. Descartado por enquanto porque adiciona dependência de plugin e complexidade para uma equipe de uma pessoa. O use_figma via Claude Code faz o sync de forma mais controlada. Pode ser reconsiderado quando houver mais designers na equipe.

**Cobalt UI (alternativa ao Style Dictionary):** Mais moderno, melhor suporte a DTCG nativo. Descartado por ser menos maduro e ter menos documentação/comunidade. Pode ser reconsiderado no futuro.
