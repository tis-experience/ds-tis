import { Directive, input } from "@angular/core";

export type TisDividerOrientation = "horizontal" | "vertical";

@Directive({
  selector: "hr[tisDivider]",
  standalone: true,
  host: {
    class: "ds-divider",
    "data-tis-angular-divider": "",
    "[attr.data-orientation]": "orientation()",
    "[attr.role]": "decorative() ? 'presentation' : null",
    "[attr.aria-hidden]": "decorative() ? 'true' : null",
    "[attr.aria-orientation]": "!decorative() && orientation() === 'vertical' ? 'vertical' : null",
    "[class.ds-divider--vertical]": "orientation() === 'vertical'",
  },
})
export class TisDivider {
  readonly decorative = input(false);
  readonly orientation = input<TisDividerOrientation>("horizontal");
}
