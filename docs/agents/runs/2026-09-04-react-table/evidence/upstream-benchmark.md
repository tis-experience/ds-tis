# Upstream benchmark

- shadcn Table (Base): composição source-first sobre elementos table nativos e wrapper de overflow; não usa primitive Base UI.
- MDN table accessibility: caption e headers semânticos preservam relações estruturais para tecnologia assistiva.
- DS TIS Table Web: contrato visual e anatômico existente é a referência da implementação React.

Conclusão: adotar a estrutura source-first do shadcn, manter HTML nativo como comportamento e mapear integralmente as classes públicas TIS.
