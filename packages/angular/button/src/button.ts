import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

export type TisButtonVariant =
  | "brand"
  | "toned"
  | "outline"
  | "ghost"
  | "success"
  | "danger";
export type TisButtonSize = "sm" | "md" | "lg";
export type TisButtonType = "button" | "submit" | "reset";

@Component({
  selector: "tis-button",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    style: "display: contents",
  },
  template: `
    <button
      data-tis-angular-button
      class="ds-button"
      [class]="classes()"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-busy]="loading() ? 'true' : null"
    >
      <ng-content select="[tisButtonIconStart]" />
      @if (!iconOnly()) {
        <span class="ds-button__label"><ng-content /></span>
      }
      <ng-content select="[tisButtonIconEnd]" />
      @if (loading()) {
        <span class="ds-button__spinner">
          <span class="ds-spinner ds-spinner--sm" aria-hidden="true"></span>
          <span class="ds-sr-only">{{ loadingLabel() }}</span>
        </span>
      }
    </button>
  `,
})
export class TisButton {
  readonly variant = input<TisButtonVariant>("brand");
  readonly size = input<TisButtonSize>("md");
  readonly type = input<TisButtonType>("button");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  readonly loadingLabel = input("A carregar");

  protected readonly classes = computed(() => [
    "ds-button",
    `ds-button--${this.variant()}`,
    `ds-button--${this.size()}`,
    this.iconOnly() ? "ds-button--icon-only" : "",
    this.fullWidth() ? "ds-button--full" : "",
    this.loading() ? "ds-button--loading" : "",
  ].filter(Boolean).join(" "));
}

@Directive({
  selector: "[tisButtonIconStart]",
  standalone: true,
  host: { class: "ds-button__icon ds-icon", "aria-hidden": "true" },
})
export class TisButtonIconStart {}

@Directive({
  selector: "[tisButtonIconEnd]",
  standalone: true,
  host: { class: "ds-button__icon ds-icon", "aria-hidden": "true" },
})
export class TisButtonIconEnd {}
