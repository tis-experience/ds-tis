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

export type TisTextareaSize = "sm" | "md" | "lg";

let nextTextareaId = 0;

@Component({
  selector: "tis-textarea",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisTextarea),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TisTextarea),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-textarea": "",
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
        class="ds-textarea"
        [class.ds-textarea--sm]="size() === 'sm'"
        [class.ds-textarea--lg]="size() === 'lg'"
        [class.ds-textarea--filled]="hasValue()"
        [class.ds-textarea--error]="invalid()"
        [class.ds-textarea--disabled]="isDisabled()"
        [class.ds-textarea--readonly]="readonly()"
      >
        <textarea
          class="ds-textarea__field"
          [id]="resolvedId()"
          [name]="name()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="required()"
          [rows]="rows()"
          [attr.maxlength]="maxLength()"
          [attr.aria-label]="resolvedAriaLabel()"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.aria-required]="required() ? 'true' : null"
          (blur)="handleBlur()"
          (input)="handleInput($event)"
        ></textarea>
      </div>
      @if (showCounter() && maxLength() !== null) {
        <span
          class="ds-field__counter"
          [class.ds-field__counter--over]="overLimit()"
          [id]="counterId"
        >{{ value().length }}/{{ maxLength() }}</span>
      }
      @if (invalid() && errorMessage()) {
        <span class="ds-field__error" [id]="errorId" role="alert">{{ errorMessage() }}</span>
      }
      @if (helperText()) {
        <span class="ds-field__helper" [id]="helperId">{{ helperText() }}</span>
      }
    </div>
  `,
})
export class TisTextarea implements ControlValueAccessor, Validator {
  private readonly generatedId = `tis-textarea-${++nextTextareaId}`;
  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly ariaDescribedby = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string | null>(null);
  readonly helperText = input<string | null>(null);
  readonly id = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly label = input.required<string>();
  readonly maxLength = input<number | null>(null);
  readonly name = input<string | null>(null);
  readonly placeholder = input("");
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly rows = input(3);
  readonly showCounter = input(false, { transform: booleanAttribute });
  readonly showLabel = input(true, { transform: booleanAttribute });
  readonly size = input<TisTextareaSize>("md");
  readonly value = model("");

  protected readonly counterId = `${this.generatedId}-counter`;
  protected readonly errorId = `${this.generatedId}-error`;
  protected readonly helperId = `${this.generatedId}-helper`;
  protected readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.showCounter() && this.maxLength() !== null ? this.counterId : null,
    this.invalid() && this.errorMessage() ? this.errorId : null,
    this.helperText() ? this.helperId : null,
  ].filter(Boolean).join(" ") || null);
  protected readonly hasValue = computed(() => this.value().length > 0);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly overLimit = computed(() => this.maxLength() !== null && this.value().length > this.maxLength()!);
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
    const textareaElement = event.currentTarget as HTMLTextAreaElement;
    this.value.set(textareaElement.value);
    this.onChange(textareaElement.value);
  }
}
