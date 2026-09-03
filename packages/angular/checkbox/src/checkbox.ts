import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from "@angular/forms";

export type TisCheckboxSize = "sm" | "md" | "lg";

let nextCheckboxId = 0;

@Component({
  selector: "tis-checkbox",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisCheckbox),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TisCheckbox),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-checkbox": "",
    "[class.ds-checkbox-group--error]": "invalid()",
  },
  template: `
    <label class="ds-checkbox-label" [attr.for]="resolvedId()">
      <input
        class="ds-checkbox"
        [class.ds-checkbox--sm]="size() === 'sm'"
        [class.ds-checkbox--lg]="size() === 'lg'"
        [id]="resolvedId()"
        [name]="name()"
        [value]="value()"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="isDisabled()"
        [required]="required()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        type="checkbox"
        (blur)="handleBlur()"
        (change)="handleChange($event)"
      >
      <span class="ds-checkbox__content">
        <span class="ds-checkbox__label"><ng-content /></span>
        @if (description()) {
          <span class="ds-checkbox__description" [id]="descriptionId">{{ description() }}</span>
        }
        @if (helperText()) {
          <span class="ds-checkbox__helper" [id]="helperId">{{ helperText() }}</span>
        }
      </span>
    </label>
    @if (invalid() && errorMessage()) {
      <span class="ds-checkbox-group__error" [id]="errorId">{{ errorMessage() }}</span>
    }
  `,
})
export class TisCheckbox implements ControlValueAccessor, Validator {
  private readonly generatedId = `tis-checkbox-${++nextCheckboxId}`;
  private readonly formDisabled = signal(false);
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly ariaDescribedby = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly checked = model(false);
  readonly description = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string | null>(null);
  readonly helperText = input<string | null>(null);
  readonly id = input<string | null>(null);
  readonly indeterminate = model(false);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly name = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly size = input<TisCheckboxSize>("md");
  readonly value = input("on");

  protected readonly descriptionId = `${this.generatedId}-description`;
  protected readonly errorId = `${this.generatedId}-error`;
  protected readonly helperId = `${this.generatedId}-helper`;
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly resolvedId = computed(() => this.id() || this.generatedId);
  protected readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.description() ? this.descriptionId : null,
    this.helperText() ? this.helperId : null,
    this.invalid() && this.errorMessage() ? this.errorId : null,
  ].filter(Boolean).join(" ") || null);

  constructor() {
    effect(() => {
      this.required();
      this.onValidatorChange();
    });
  }

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

  validate(control: AbstractControl): ValidationErrors | null {
    return this.required() && !Boolean(control.value) ? { required: true } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected handleChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    this.indeterminate.set(false);
    this.checked.set(input.checked);
    this.onChange(input.checked);
  }
}
