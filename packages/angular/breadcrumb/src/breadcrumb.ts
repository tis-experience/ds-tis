import { Directive, input } from "@angular/core";

/** Native navigation: links retain href, RouterLink and browser keyboard behavior. */
@Directive({
  selector: "nav[tisBreadcrumb]",
  standalone: true,
  host: {
    class: "ds-breadcrumb",
    "data-tis-angular-breadcrumb": "",
    "[attr.aria-label]": "label()",
  },
})
export class TisBreadcrumb {
  readonly label = input("Breadcrumb");
}

@Directive({
  selector: "a[tisBreadcrumbLink]",
  standalone: true,
  host: { class: "ds-breadcrumb__item" },
})
export class TisBreadcrumbLink {}

@Directive({
  selector: "span[tisBreadcrumbCurrent]",
  standalone: true,
  host: { class: "ds-breadcrumb__item ds-breadcrumb__item--current", "aria-current": "page" },
})
export class TisBreadcrumbCurrent {}

@Directive({
  selector: "span[tisBreadcrumbSeparator]",
  standalone: true,
  host: { class: "ds-breadcrumb__separator", "aria-hidden": "true" },
})
export class TisBreadcrumbSeparator {}
