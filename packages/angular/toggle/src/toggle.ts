import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export type TisToggleSize = "sm" | "md" | "lg";

let nextToggleId = 0;

@Component({
  selector: "tis-toggle",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisToggle),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-toggle": "",
  },
  template: `
    <label class="ds-toggle-label" [attr.for]="resolvedId()">
      <input
        class="ds-toggle"
        [class.ds-toggle--sm]="size() === 'sm'"
        [class.ds-toggle--lg]="size() === 'lg'"
        [id]="resolvedId()"
        [name]="name()"
        [value]="value()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="describedBy()"
        role="switch"
        type="checkbox"
        (blur)="handleBlur()"
        (change)="handleChange($event)"
      >
      <span class="ds-toggle__content">
        <span class="ds-toggle__label"><ng-content /></span>
        @if (description()) {
          <span class="ds-toggle__description" [id]="descriptionId">{{ description() }}</span>
        }
        @if (helperText()) {
          <span class="ds-toggle__helper" [id]="helperId">{{ helperText() }}</span>
        }
      </span>
    </label>
  `,
})
export class TisToggle implements ControlValueAccessor {
  private readonly generatedId = `tis-toggle-${++nextToggleId}`;
  private readonly formDisabled = signal(false);
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly ariaDescribedby = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly checked = model(false);
  readonly description = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly helperText = input<string | null>(null);
  readonly id = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly size = input<TisToggleSize>("md");
  readonly value = input("enabled");

  readonly descriptionId = `${this.generatedId}-description`;
  readonly helperId = `${this.generatedId}-helper`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly resolvedId = computed(() => this.id() || this.generatedId);
  readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.description() ? this.descriptionId : null,
    this.helperText() ? this.helperId : null,
  ].filter(Boolean).join(" ") || null);

  writeValue(value: unknown): void {
    this.checked.set(Boolean(value));
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  handleBlur(): void {
    this.onTouched();
  }

  handleChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    this.checked.set(input.checked);
    this.onChange(input.checked);
  }
}
