# Benchmark oficial — 2026-09-05

- [Ark Composition / Factory](https://ark-ui.com/docs/guides/composition): Factory permite elementos nativos e composição. Foram inspecionados os exports e `dist/components/factory.js`/`factory.d.ts` do pacote instalado `@ark-ui/react@5.37.2`; Zag transitivo `1.41.2`. Badge usa span sem machine, sem dependência direta Zag e sem recipe visual upstream.
- [Carbon Tag](https://carbondesignsystem.com/components/tag/usage/): a variante read-only categoriza e rotula sem interação; variantes selecionável/removível pertencem a outro contrato. Aplicação: preservar Badge informativo e label curto.
- [Atlassian Lozenge](https://atlassian.design/components/lozenge/usage): label compacto sinaliza atributo relevante ao objeto. Aplicação: mostrar o Badge junto do conteúdo que qualifica, sem importar as cores ou API Atlassian.

As referências orientam a classificação, não substituem tokens e CSS TIS. A URL inicialmente tentada `/react/docs/utilities/factory` não foi acessível; a referência canônica acima foi localizada pela busca oficial.
