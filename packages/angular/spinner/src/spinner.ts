import { ChangeDetectionStrategy, Component, booleanAttribute, input } from "@angular/core";

export type TisSpinnerSize = "sm" | "md" | "lg";

@Component({
  selector: "tis-spinner",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: "display: contents",
  },
  template: `<span
    class="ds-spinner"
    data-tis-angular-spinner
    [attr.data-size]="size()"
    [attr.data-on-color]="onColor() ? '' : null"
    [class.ds-spinner--sm]="size() === 'sm'"
    [class.ds-spinner--md]="size() === 'md'"
    [class.ds-spinner--lg]="size() === 'lg'"
    [class.ds-spinner--on-color]="onColor()"
    [attr.role]="decorative() ? null : 'status'"
    [attr.aria-label]="decorative() ? null : label()"
    [attr.aria-hidden]="decorative() ? 'true' : null"
  ></span>`,
})
export class TisSpinner {
  readonly size = input<TisSpinnerSize>("md");
  readonly onColor = input(false, { transform: booleanAttribute });
  readonly decorative = input(false, { transform: booleanAttribute });
  readonly label = input("Carregando");
}
