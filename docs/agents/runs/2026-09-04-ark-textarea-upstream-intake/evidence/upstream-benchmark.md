# Benchmark reproduzível

- `@ark-ui/react@5.37.2`, fixado em `packages/react/package.json`.
- Inspecionado `node_modules/@ark-ui/react/dist/components/factory.js`: forwardRef + props nativas; `mergeProps` vem de Zag.
- `ark.textarea` conserva textarea nativo. Não exige máquina de estado própria.
- [Ark Field](https://ark-ui.com/docs/components/field), consultado em 2026-09-04: Field.Textarea existe como composição com contexto de Field. Aqui o wrapper público TIS e a semântica nativa bastam; a saída de Form Field será integrada separadamente.
- [Carbon Text input / Text area](https://carbondesignsystem.com/components/text-input/usage/): consultado em 2026-09-04; referência de campo multilinha com label, helper, contador e resize vertical. Nenhum theme upstream foi copiado.
