import { Directive, booleanAttribute, input, numberAttribute } from "@angular/core";

export type TisTableSize = "sm" | "md";
export type TisTableAlign = "start" | "end";
export type TisTableSortDirection = "none" | "ascending" | "descending";

@Directive({
  selector: "[tisTableRegion]",
  standalone: true,
  host: {
    class: "ds-table-region",
    "data-tis-angular-table-region": "",
    role: "region",
    "[attr.aria-label]": "label()",
    "[attr.tabindex]": "tabIndex()",
  },
})
export class TisTableRegion {
  readonly label = input.required<string>();
  readonly tabIndex = input(0, { transform: numberAttribute });
}

@Directive({
  selector: "table[tisTable]",
  standalone: true,
  host: {
    class: "ds-table",
    "data-tis-angular-table": "",
    "[attr.data-size]": "size()",
    "[class.ds-table--md]": "size() === 'md'",
    "[class.ds-table--fixed]": "fixed()",
    "[class.ds-table--nowrap]": "nowrap()",
  },
})
export class TisTable {
  readonly size = input<TisTableSize>("sm");
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly nowrap = input(false, { transform: booleanAttribute });
}

@Directive({ selector: "caption[tisTableCaption]", standalone: true, host: { class: "ds-table__caption" } })
export class TisTableCaption {}

@Directive({ selector: "thead[tisTableHeader]", standalone: true, host: { class: "ds-table__header" } })
export class TisTableHeader {}

@Directive({
  selector: "th[tisTableHeaderCell]",
  standalone: true,
  host: {
    class: "ds-table__header-cell",
    scope: "col",
    "[class.ds-table__header-cell--sortable]": "sortable()",
    "[class.ds-table__header-cell--end]": "align() === 'end'",
    "[attr.aria-sort]": "sortable() ? sort() : null",
  },
})
export class TisTableHeaderCell {
  readonly sortable = input(false, { transform: booleanAttribute });
  readonly sort = input<TisTableSortDirection>("none");
  readonly align = input<TisTableAlign>("start");
}

@Directive({ selector: "tbody[tisTableBody]", standalone: true, host: { class: "ds-table__body" } })
export class TisTableBody {}

@Directive({
  selector: "tr[tisTableRow]",
  standalone: true,
  host: {
    class: "ds-table__row",
    "[class.ds-table__row--selected]": "selected()",
    "[attr.data-selected]": "selected() ? 'true' : null",
  },
})
export class TisTableRow {
  readonly selected = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "td[tisTableCell]",
  standalone: true,
  host: {
    class: "ds-table__cell",
    "[class.ds-table__cell--control]": "control()",
    "[class.ds-table__cell--end]": "align() === 'end'",
    "[class.ds-table__cell--truncate]": "truncate()",
  },
})
export class TisTableCell {
  readonly control = input(false, { transform: booleanAttribute });
  readonly align = input<TisTableAlign>("start");
  readonly truncate = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "button[tisTableSort]",
  standalone: true,
  host: { class: "ds-table__sort", type: "button", "[class.ds-table__sort--end]": "align() === 'end'" },
})
export class TisTableSort {
  readonly align = input<TisTableAlign>("start");
}

@Directive({ selector: "[tisTableSortIcon]", standalone: true, host: { class: "ds-table__sort-icon", "aria-hidden": "true" } })
export class TisTableSortIcon {}
