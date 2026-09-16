import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  output,
} from "@angular/core";

export type TisPaginationSize = "sm" | "md" | "lg";

type PageItem =
  | { key: string; kind: "ellipsis" }
  | { key: string; kind: "page"; page: number };

const defaultHref = (page: number) => `?page=${page}`;
const defaultPageLabel = (page: number) => `Página ${page}`;
const positiveInteger = (value: number) => Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1;

@Component({
  selector: "tis-pagination",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: "display: contents" },
  template: `
    <nav
      class="ds-pagination"
      data-tis-angular-pagination
      [class.ds-pagination--sm]="size() === 'sm'"
      [class.ds-pagination--lg]="size() === 'lg'"
      [attr.data-size]="size()"
      [attr.aria-label]="label()"
    >
      <ul class="ds-pagination__list">
        <li class="ds-pagination__item">
          <button
            type="button"
            [class]="buttonClasses()"
            [disabled]="current() === 1"
            [attr.aria-disabled]="current() === 1 ? 'true' : null"
            [attr.aria-label]="previousLabel()"
            (click)="select(current() - 1)"
          >
            <svg class="ds-button__icon ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </li>

        @for (item of items(); track item.key) {
          <li class="ds-pagination__item">
            @if (item.kind === 'ellipsis') {
              <span class="ds-pagination__ellipsis" aria-hidden="true">…</span>
            } @else if (item.page === current()) {
              <span class="ds-pagination__page ds-pagination__page--current"
                aria-current="page" [attr.aria-label]="pageLabel()(item.page)">{{ item.page }}</span>
            } @else {
              <a class="ds-pagination__page" [href]="hrefFor()(item.page)"
                [attr.aria-label]="pageLabel()(item.page)" (click)="select(item.page, $event)">{{ item.page }}</a>
            }
          </li>
        }

        <li class="ds-pagination__item">
          <button
            type="button"
            [class]="buttonClasses()"
            [disabled]="current() === total()"
            [attr.aria-disabled]="current() === total() ? 'true' : null"
            [attr.aria-label]="nextLabel()"
            (click)="select(current() + 1)"
          >
            <svg class="ds-button__icon ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class TisPagination {
  readonly currentPage = input(1, { transform: numberAttribute });
  readonly totalPages = input(1, { transform: numberAttribute });
  readonly size = input<TisPaginationSize>("md");
  readonly label = input("Paginação");
  readonly previousLabel = input("Página anterior");
  readonly nextLabel = input("Próxima página");
  readonly pageLabel = input<(page: number) => string>(defaultPageLabel);
  readonly hrefFor = input<(page: number) => string>(defaultHref);
  readonly pageChange = output<number>();

  protected readonly total = computed(() => positiveInteger(this.totalPages()));
  protected readonly current = computed(() => Math.min(this.total(), positiveInteger(this.currentPage())));
  protected readonly buttonClasses = computed(() => [
    "ds-button",
    "ds-button--ghost",
    "ds-button--icon-only",
    this.size() === "md" ? "" : `ds-button--${this.size()}`,
  ].filter(Boolean).join(" "));

  protected readonly items = computed<PageItem[]>(() => {
    const current = this.current();
    const total = this.total();
    const pages = total <= 7
      ? Array.from({ length: total }, (_, index) => index + 1)
      : [...new Set([1, current - 1, current, current + 1, total].filter((page) => page >= 1 && page <= total))].sort((a, b) => a - b);
    const items: PageItem[] = [];
    let previous = 0;
    for (const page of pages) {
      if (page - previous > 1) items.push({ key: `ellipsis-${previous}-${page}`, kind: "ellipsis" });
      items.push({ key: `page-${page}`, kind: "page", page });
      previous = page;
    }
    return items;
  });

  protected select(page: number, event?: MouseEvent): void {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    const next = Math.min(this.total(), Math.max(1, page));
    if (next !== this.current()) this.pageChange.emit(next);
  }
}
