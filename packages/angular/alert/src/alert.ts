import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  input,
} from "@angular/core";

export type TisAlertTone = "error" | "info" | "success" | "warning";
export type TisAlertVariant = "solid" | "subtle";
export type TisAlertRole = "alert" | "status";

@Component({
  selector: "tis-alert",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-alert",
    "data-tis-angular-alert": "",
    "[attr.data-tone]": "tone()",
    "[attr.data-variant]": "variant()",
    "[attr.role]": "effectiveRole()",
    "[class.ds-alert--error]": "tone() === 'error'",
    "[class.ds-alert--info]": "tone() === 'info'",
    "[class.ds-alert--success]": "tone() === 'success'",
    "[class.ds-alert--warning]": "tone() === 'warning'",
    "[class.ds-alert--solid]": "variant() === 'solid'",
    "[class.ds-alert--subtle]": "variant() === 'subtle'",
  },
  template: `<ng-content />`,
})
export class TisAlert {
  readonly tone = input<TisAlertTone>("info");
  readonly variant = input<TisAlertVariant>("subtle");
  readonly role = input<TisAlertRole | null>(null);
  protected readonly effectiveRole = computed<TisAlertRole>(() =>
    this.role() ?? (this.tone() === "error" ? "alert" : "status"),
  );
}

@Directive({
  selector: "[tisAlertIcon]",
  standalone: true,
  host: { class: "ds-alert__icon", "aria-hidden": "true" },
})
export class TisAlertIcon {}

@Directive({
  selector: "[tisAlertContent]",
  standalone: true,
  host: { class: "ds-alert__content" },
})
export class TisAlertContent {}

@Directive({
  selector: "[tisAlertTitle]",
  standalone: true,
  host: { class: "ds-alert__title" },
})
export class TisAlertTitle {}

@Directive({
  selector: "[tisAlertDescription]",
  standalone: true,
  host: { class: "ds-alert__description" },
})
export class TisAlertDescription {}

@Directive({
  selector: "[tisAlertActions]",
  standalone: true,
  host: { class: "ds-alert__actions" },
})
export class TisAlertActions {}

@Directive({
  selector: "button[tisAlertClose]",
  standalone: true,
  host: { class: "ds-alert__close", type: "button" },
})
export class TisAlertClose {}
