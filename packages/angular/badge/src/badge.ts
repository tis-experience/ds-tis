import {
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";

export type TisBadgeTone =
  | "brand"
  | "error"
  | "info"
  | "neutral"
  | "success"
  | "warning";
export type TisBadgeVariant = "solid" | "subtle";

@Component({
  selector: "tis-badge",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-badge",
    "data-tis-angular-badge": "",
    "[attr.data-tone]": "tone()",
    "[attr.data-variant]": "variant()",
    "[class.ds-badge--brand]": "tone() === 'brand'",
    "[class.ds-badge--error]": "tone() === 'error'",
    "[class.ds-badge--info]": "tone() === 'info'",
    "[class.ds-badge--neutral]": "tone() === 'neutral'",
    "[class.ds-badge--success]": "tone() === 'success'",
    "[class.ds-badge--warning]": "tone() === 'warning'",
    "[class.ds-badge--solid]": "variant() === 'solid'",
    "[class.ds-badge--subtle]": "variant() === 'subtle'",
  },
  template: `<ng-content />`,
})
export class TisBadge {
  readonly tone = input<TisBadgeTone>("brand");
  readonly variant = input<TisBadgeVariant>("solid");
}
