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

export type TisSelectSize = "sm" | "md" | "lg";

let nextSelectId = 0;

@Directive({
  selector: "[tisSelectIcon]",
  standalone: true,
  host: {
    class: "ds-select__icon",
    "aria-hidden": "true",
  },
})
export class TisSelectIcon {}

@Component({
  selector: "tis-select",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisSelect),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TisSelect),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-select": "",
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
        class="ds-select"
        [class.ds-select--sm]="size() === 'sm'"
        [class.ds-select--lg]="size() === 'lg'"
        [class.ds-select--filled]="hasValue()"
        [class.ds-select--error]="invalid()"
        [class.ds-select--disabled]="isDisabled() && !readonly()"
        [class.ds-select--readonly]="readonly()"
      >
        <ng-content select="[tisSelectIcon]" />
        <select
          class="ds-select__field"
          [id]="resolvedId()"
          [name]="name()"
          [value]="value()"
          [disabled]="isDisabled()"
          [required]="required()"
          [attr.aria-label]="resolvedAriaLabel()"
          [attr.aria-describedby]="describedBy()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.aria-required]="required() ? 'true' : null"
          (blur)="handleBlur()"
          (change)="handleChange($event)"
        >
          @if (placeholder()) {
            <option value="" [disabled]="placeholderDisabled()">{{ placeholder() }}</option>
          }
          <ng-content />
        </select>
        <span class="ds-select__arrow" aria-hidden="true"></span>
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
export class TisSelect implements ControlValueAccessor, Validator {
  private readonly generatedId = `tis-select-${++nextSelectId}`;
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
  readonly name = input<string | null>(null);
  readonly placeholder = input<string | null>("Selecione…");
  readonly placeholderDisabled = input(true, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showLabel = input(true, { transform: booleanAttribute });
  readonly size = input<TisSelectSize>("md");
  readonly value = model("");

  protected readonly errorId = `${this.generatedId}-error`;
  protected readonly helperId = `${this.generatedId}-helper`;
  protected readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.invalid() && this.errorMessage() ? this.errorId : null,
    this.helperText() ? this.helperId : null,
  ].filter(Boolean).join(" ") || null);
  protected readonly hasValue = computed(() => this.value().length > 0);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled() || this.readonly());
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

  protected handleChange(event: Event): void {
    const select = event.currentTarget as HTMLSelectElement;
    this.value.set(select.value);
    this.onChange(select.value);
  }
}
