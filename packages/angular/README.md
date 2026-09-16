# @tis/angular

Biblioteca Angular nativa do DS TIS. O pacote reutiliza as classes, anatomia e
tokens públicos do DS; não inclui nem duplica o CSS global.

```css
@import "ds-tis/css";
```

Use entrypoints independentes:

```ts
import { TisAccordion, TisAccordionItem } from "@tis/angular/accordion";
import { TisAlert, TisAlertContent, TisAlertTitle } from "@tis/angular/alert";
import { TisBadge } from "@tis/angular/badge";
import { TisAvatar } from "@tis/angular/avatar";
import { TisBreadcrumb, TisBreadcrumbLink, TisBreadcrumbCurrent, TisBreadcrumbSeparator } from "@tis/angular/breadcrumb";
import { TisButton } from "@tis/angular/button";
import { TisCard, TisCardContainer, TisCardContent } from "@tis/angular/card";
import { TisCheckbox } from "@tis/angular/checkbox";
import { TisCombobox, TisComboboxIcon } from "@tis/angular/combobox";
import { TisDivider } from "@tis/angular/divider";
import { TisFormField } from "@tis/angular/form-field";
import { TisInput } from "@tis/angular/input";
import { TisActionMenu, TisMenu, TisMenuItem, TisMenuTrigger } from "@tis/angular/menu";
import { TisModal, TisModalBody, TisModalFooter } from "@tis/angular/modal";
import { TisPagination } from "@tis/angular/pagination";
import { TisPopover } from "@tis/angular/popover";
import { TisRadioGroup, TisRadioOption } from "@tis/angular/radio";
import { TisSelect, TisSelectIcon } from "@tis/angular/select";
import { TisSkeleton, TisSkeletonGroup } from "@tis/angular/skeleton";
import { TisSpinner } from "@tis/angular/spinner";
import { TisTable, TisTableBody, TisTableCell, TisTableHeader, TisTableHeaderCell, TisTableRegion, TisTableRow } from "@tis/angular/table";
import { TisTab, TisTabList, TisTabPanel, TisTabs } from "@tis/angular/tabs";
import { TisTextarea } from "@tis/angular/textarea";
import { TisToastRegion, TisToastService } from "@tis/angular/toast";
import { TisToggle } from "@tis/angular/toggle";
import { TisTooltip, TisTooltipTrigger } from "@tis/angular/tooltip";
```

Os componentes são standalone e usam Angular 21, Angular Forms, Angular Aria/CDK
21 e RxJS 7 como peer dependencies. O pacote permanece privado enquanto a saída
estiver em beta e não foi publicado.

## Avatar

`TisAvatar` usa `label` obrigatório, `size="sm|md|lg"` (padrão `md`),
`content="initials|image|icon"` (padrão `initials`), `initials`, `src` e
`decorative`. Uma imagem inválida cai para iniciais ou ícone, mantendo o tamanho
e o nome acessível. Trocar `src` permite carregar uma nova imagem.

```html
<tis-avatar label="Ana Lima" content="image" src="/ana.jpg" initials="AL" />
<tis-avatar label="Ana Lima" initials="AL" decorative /><span>Ana Lima</span>
```

Use `decorative` quando o texto adjacente já identifica a pessoa. Avatar não é
um controle interativo; ações pertencem a links e Buttons. O fallback automático
é implementado neste entrypoint Angular, sem depender do runtime Web.

## Breadcrumb

Use `nav[tisBreadcrumb]` com `label` (padrão `Breadcrumb`) para nomear a navegação.
`a[tisBreadcrumbLink]` mantém `href` e eventos nativos; o app pode aplicar seu
próprio `RouterLink`, sem dependência do router neste entrypoint.
`span[tisBreadcrumbCurrent]` identifica a única página atual por
`aria-current="page"`, fora da tabulação. `span[tisBreadcrumbSeparator]` oculta
separadores decorativos da árvore acessível. As diretivas não inferem rotas.

```html
<nav tisBreadcrumb label="Caminho do projeto">
  <a tisBreadcrumbLink href="/">Início</a>
  <span tisBreadcrumbSeparator>/</span>
  <a tisBreadcrumbLink href="/projetos">Projetos</a>
  <span tisBreadcrumbSeparator>/</span>
  <span tisBreadcrumbCurrent>Design System</span>
</nav>
```

O consumidor decide a política de overflow de trilhas longas. As stories usam
rolagem horizontal local, preservando os labels e o foco; não há truncamento
nem colapso automático no componente. `TisBreadcrumbHarness` está disponível
em `@tis/angular/testing` para consultar o nome, os links e a página atual.

## Pagination

`TisPagination` é controlado: o consumidor fornece `currentPage` e `totalPages`
e atualiza dados ou URL ao receber `pageChange`. `size="sm|md|lg"`, `label`,
labels de navegação, `pageLabel` e `hrefFor` permitem adaptar apresentação,
idioma e endereços sem alterar a semântica.

```html
<tis-pagination
  [currentPage]="page()"
  [totalPages]="10"
  label="Páginas dos resultados"
  (pageChange)="page.set($event)"
/>
```

Links numerados preservam `href`; anterior e próxima são Buttons nativos. A
página atual usa `aria-current="page"`, fica fora da tabulação e os limites
desabilitam o controle correspondente. Ellipsis é apenas visual.
`TisPaginationHarness` está disponível em `@tis/angular/testing`.

## Skeleton

`TisSkeleton` oferece `type="text|circle|rectangle"` e `width` opcional para
composição. Cada shape é sempre `aria-hidden="true"`. Aplique
`tisSkeletonGroup` no container, forneça `label` e mantenha `busy` ativo durante
o carregamento para anunciar a região uma única vez.

```html
<div tisSkeletonGroup label="Carregando perfil">
  <tis-skeleton type="circle" />
  <tis-skeleton type="text" width="60%" />
  <tis-skeleton type="rectangle" />
</div>
```

O CSS existente desativa a animação com `prefers-reduced-motion: reduce`.
`TisSkeletonHarness` consulta tipo e estado decorativo nos testes consumidores.

## Spinner

`TisSpinner` oferece `size="sm|md|lg"`, `onColor` e `label`. Por padrão o host
é um status nomeado; use `decorative` quando um Button ou uma região externa já
anunciar a operação, evitando mensagens duplicadas.

```html
<tis-spinner size="md" label="Carregando resultados" />
<tis-spinner decorative />
```

O CSS existente preserva o contrato visual e desativa a rotação com
`prefers-reduced-motion: reduce`. `TisSpinnerHarness` consulta nome, tamanho e
estado decorativo.

## Table

Table mantém os elementos HTML nativos e aplica o contrato visual por diretivas.
`TisTableRegion` concentra overflow, nome e foco; a aplicação continua responsável
por dados, ordenação, seleção e ações.

```html
<div tisTableRegion label="Tabela de clientes">
  <table tisTable size="md">
    <caption tisTableCaption>Clientes</caption>
    <thead tisTableHeader><tr tisTableRow><th tisTableHeaderCell>Cliente</th></tr></thead>
    <tbody tisTableBody><tr tisTableRow><td tisTableCell>Ana Silva</td></tr></tbody>
  </table>
</div>
```

`TisTableHarness` consulta caption, quantidade de linhas, ordenação e o controle
de sort mantendo a semântica de table, sem `role="grid"`.

## Form Field


`TisFormField` projeta um controle nativo/customizado e fornece label, required,
helper e erro. Não aninhe `tis-input`, `tis-select` ou `tis-textarea` nele: esses
componentes já incluem o field. O CSS permanece em `ds-tis/css`.

```html
<tis-form-field #field="tisFormField" label="Nome" required
  helperText="Use seu nome completo." [invalid]="invalid" errorMessage="Informe seu nome.">
  <div class="ds-input" [class.ds-input--error]="field.invalid()">
    <input class="ds-input__field" [id]="field.controlId()" [required]="field.required()"
      [attr.aria-label]="field.ariaLabel()" [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-describedby]="field.describedBy()">
  </div>
</tis-form-field>
```

Inputs: `label` (obrigatório), `for` (ID explícito do controle), `required`,
`invalid`, `showLabel` (padrão true), `helperText`, `errorMessage` e
`ariaDescribedby` (IDs externos preservados). Sem `for`, gera um ID por instância.
`controlId()`, `helperId()`, `errorId()`, `describedBy()`, `ariaInvalid()` e
`ariaLabel()` são sinais públicos. Vincule-os ao controle conforme o exemplo;
valor, disabled, eventos e Angular Forms continuam pertencendo ao controle.
