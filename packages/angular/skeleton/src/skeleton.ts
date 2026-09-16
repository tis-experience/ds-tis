import { ChangeDetectionStrategy, Component, Directive, booleanAttribute, input } from "@angular/core";

export type TisSkeletonType = "text" | "circle" | "rectangle";

@Component({
  selector: "tis-skeleton",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-skeleton",
    "data-tis-angular-skeleton": "",
    "aria-hidden": "true",
    "[attr.data-type]": "type()",
    "[class.ds-skeleton--text]": "type() === 'text'",
    "[class.ds-skeleton--circle]": "type() === 'circle'",
    "[class.ds-skeleton--rectangle]": "type() === 'rectangle'",
    "[style.inline-size]": "width()",
  },
  template: "",
})
export class TisSkeleton {
  readonly type = input<TisSkeletonType>("text");
  readonly width = input<string | null>(null);
}

/** Applies the loading announcement to the region, while shapes remain decorative. */
@Directive({
  selector: "[tisSkeletonGroup]",
  standalone: true,
  host: {
    "data-tis-angular-skeleton-group": "",
    role: "status",
    "[attr.aria-label]": "label()",
    "[attr.aria-busy]": "busy() ? 'true' : 'false'",
  },
})
export class TisSkeletonGroup {
  readonly label = input.required<string>();
  readonly busy = input(true, { transform: booleanAttribute });
}
