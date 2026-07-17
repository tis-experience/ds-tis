# Consumer smoke

Prova de consumo real do pacote `ds-tis` fora do site de docs.

## O que valida

1. `npm pack` gera um tarball instalável.
2. Um app consumidor instala esse tarball.
3. CSS público (`ds-tis/css`) aplica tokens.
4. Runtimes públicos (`combobox`, `modal`, `menu`) inicializam e respondem a interação.
5. Axe não encontra violações critical/serious na tela mínima.

## Como rodar

```bash
npm run test:consumer-smoke
```

O script cria um projeto temporário, instala o `.tgz` e executa Playwright + axe.
Não depende de GitHub Pages nem do CSS servido a partir da raiz do repo.
