import {
  ChangeDetectionStrategy,
  Component,
  Directive,
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

export type TisInputSize = "sm" | "md" | "lg";
export type TisInputType = "email" | "number" | "password" | "search" | "tel" | "text" | "url";

let nextInputId = 0;

@Directive({
  selector: "[tisInputIconStart]",
  standalone: true,
  host: {
    class: "ds-input__icon",
    "aria-hidden": "true",
  },
})
export class TisInputIconStart {}

@Directive({
  selector: "[tisInputIconEnd]",
  standalone: true,
  host: {
    class: "ds-input__icon",
    "aria-hidden": "true",
  },
})
export class TisInputIconEnd {}

@Component({
  selector: "tis-input",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisInput),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TisInput),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-input": "",
  },
  template: `
    <div
      class="ds-field"
      [class.ds-field--error]="invalid()"
      [class.ds-field--no-label]="!showLabel()"
      [class.ds-field--no-helper]="!helperText()"
    >
      <div class="ds-field__label-row">
        <label class="ds-field__label" [attr.for]="resolvedId()">{{ label() }}</label>
        @if (required()) {
          <span class="ds-field__required" aria-hidden="true">*</span>
        }
      </div>
      <div
        class="ds-input"
        [class.ds-input--sm]="size() === 'sm'"
        [class.ds-input--lg]="size() === 'lg'"
        [class.ds-input--filled]="hasValue()"
        [class.ds-input--error]="invalid()"
        [class.ds-input--disabled]="isDisabled()"
        [class.ds-input--readonly]="readonly()"
      >
        <ng-content select="[tisInputIconStart]" />
        <input
          class="ds-input__field"
          [id]="resolvedId()"
          [name]="name()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="required()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputMode()"
          [attr.maxlength]="maxLength()"
          [attr.minlength]="minLength()"
          [attr.pattern]="pattern()"
          [attr.aria-label]="resolvedAriaLabel()"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.aria-required]="required() ? 'true' : null"
          (blur)="handleBlur()"
          (input)="handleInput($event)"
        >
        <ng-content select="[tisInputIconEnd]" />
      </div>
      @if (invalid() && errorMessage()) {
        <span class="ds-field__error" [id]="errorId" role="alert">{{ errorMessage() }}</span>
      }
      @if (helperText()) {
        <span class="ds-field__helper" [id]="helperId">{{ helperText() }}</span>
      }
    </div>
  `,
})
export class TisInput implements ControlValueAccessor, Validator {
  private readonly generatedId = `tis-input-${++nextInputId}`;
  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly ariaDescribedby = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string | null>(null);
  readonly helperText = input<string | null>(null);
  readonly id = input<string | null>(null);
  readonly inputMode = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly label = input.required<string>();
  readonly maxLength = input<number | null>(null);
  readonly minLength = input<number | null>(null);
  readonly name = input<string | null>(null);
  readonly pattern = input<string | null>(null);
  readonly placeholder = input("");
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showLabel = input(true, { transform: booleanAttribute });
  readonly size = input<TisInputSize>("md");
  readonly type = input<TisInputType>("text");
  readonly value = model("");

  protected readonly errorId = `${this.generatedId}-error`;
  protected readonly helperId = `${this.generatedId}-helper`;
  protected readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.invalid() && this.errorMessage() ? this.errorId : null,
    this.helperText() ? this.helperId : null,
  ].filter(Boolean).join(" ") || null);
  protected readonly hasValue = computed(() => this.value().length > 0);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly resolvedAriaLabel = computed(() => this.ariaLabel() || (!this.showLabel() ? this.label() : null));
  protected readonly resolvedId = computed(() => this.id() || this.generatedId);

  constructor() {
    effect(() => {
      this.required();
      this.onValidatorChange();
    });
  }

  writeValue(value: unknown): void {
    this.value.set(value == null ? "" : String(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.required() && !String(control.value ?? "") ? { required: true } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected handleInput(event: Event): void {
    const inputElement = event.currentTarget as HTMLInputElement;
    this.value.set(inputElement.value);
    this.onChange(inputElement.value);
  }
}
