# Ark/Zag para agentes

Este guia vale para spikes e futuras implementacoes vNext que usem Ark UI ou Zag.
Ele complementa `AGENTS.md`, a ADR-021 e os gates de componente; nao autoriza criar
API publica, alterar Figma ou copiar um exemplo upstream sem spec aprovada.

## Versoes de referencia

- `@ark-ui/react`: `5.37.2`, fixada no workspace `@tis/react`.
- `@ark-ui/mcp`: `1.2.1`, ferramenta opcional executada sob demanda.
- Zag: dependencias transitivas da versao Ark instalada. Pacotes `@zag-js/*`
  diretos exigem justificativa no contrato do componente.

Ao implementar, a ordem de autoridade e:

1. contrato e ADRs do DS;
2. tipos e exports da versao instalada;
3. stories, testes de interacao, Axe e teste de consumo;
4. documentacao oficial correspondente a versao;
5. respostas de MCP ou corpus LLM.

## MCP oficial do Ark

O MCP ajuda a descobrir componentes, exemplos, dependencies, data attributes e
CSS variables. Ele nao e dependencia de runtime ou fonte de verdade do DS.

Configuracao opt-in, com versao fixa:

```json
{
  "mcpServers": {
    "ark-ui": {
      "command": "npx",
      "args": ["-y", "@ark-ui/mcp@1.2.1"]
    }
  }
}
```

O cliente MCP precisa de Node e acesso ao registry na primeira execucao. Nao
adicione essa chamada ao build, aos testes, ao CI ou a qualquer aplicacao
consumidora. Clientes com sintaxe diferente devem preservar o mesmo comando e pin.

Ferramentas esperadas no MCP:

- `list_components`;
- `list_examples`;
- `get_example`;
- `styling_guide`.

## Corpus oficial para LLM

- Ark geral: `https://ark-ui.com/llms.txt`
- Ark completo: `https://ark-ui.com/llms-full.txt`
- Ark React: `https://ark-ui.com/llms-react.txt`
- Zag geral: `https://zagjs.com/llms.txt`
- Zag completo: `https://zagjs.com/llms-full.txt`
- Zag React: `https://zagjs.com/llms-react.txt`

Use o corpus especifico da tecnologia. Nao copie todo o corpus vendor para o repo:
registre links e mantenha nossos contratos locais pequenos, versionados e
verificaveis.

## Fluxo de uso

1. Classifique o componente e confirme se semantica HTML nativa basta.
2. Consulte a lista Ark para a tecnologia alvo.
3. Recupere anatomy, exemplo basico e styling guide.
4. Compare o resultado com os exports e tipos realmente instalados.
5. Mapeie `part/state -> token --ds-*` sem introduzir Tailwind ou Panda.
6. Implemente apenas o spike ou contrato aprovado.
7. Valide teclado, foco, dismiss, atributos, Axe, modo dark e consumo.
8. Use imports por subpath e rode `npm run test:vnext:bundle`.
9. Registre qualquer acesso direto a Zag e a razao pela qual Ark nao bastou.

Nunca exponha nomes Ark/Zag automaticamente na API publica do DS. O provider e uma
decisao interna; nomes, props e compatibilidade pertencem ao contrato TIS.
