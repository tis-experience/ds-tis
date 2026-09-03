import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
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

export type TisRadioSize = "sm" | "md" | "lg";

let nextRadioGroupId = 0;
let nextRadioOptionId = 0;

@Component({
  selector: "tis-radio-group",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisRadioGroup),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TisRadioGroup),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-radio-group": "",
  },
  template: `
    <fieldset
      class="ds-radio-group"
      [class.ds-radio-group--error]="invalid()"
      [disabled]="isDisabled()"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      (focusout)="handleFocusOut($event)"
    >
      <legend class="ds-radio-group__legend">{{ legend() }}</legend>
      <ng-content />
      @if (invalid() && errorMessage()) {
        <span class="ds-radio-group__error" [id]="errorId" role="alert">{{ errorMessage() }}</span>
      }
    </fieldset>
  `,
})
export class TisRadioGroup implements ControlValueAccessor, Validator {
  private readonly generatedId = `tis-radio-group-${++nextRadioGroupId}`;
  private readonly formDisabled = signal(false);
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly ariaDescribedby = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly legend = input.required<string>();
  readonly name = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly size = input<TisRadioSize>("md");
  readonly value = model<string | null>(null);

  readonly errorId = `${this.generatedId}-error`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly resolvedName = computed(() => this.name() || this.generatedId);
  readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.invalid() && this.errorMessage() ? this.errorId : null,
  ].filter(Boolean).join(" ") || null);

  constructor() {
    effect(() => {
      this.required();
      this.onValidatorChange();
    });
  }

  writeValue(value: unknown): void {
    this.value.set(value === null || value === undefined ? null : String(value));
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.required() && (control.value === null || control.value === undefined || control.value === "")
      ? { required: true }
      : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  select(value: string): void {
    if (this.isDisabled()) return;
    this.value.set(value);
    this.onChange(value);
  }

  handleFocusOut(event: FocusEvent): void {
    const fieldset = event.currentTarget as HTMLElement;
    if (!event.relatedTarget || !fieldset.contains(event.relatedTarget as Node)) this.onTouched();
  }
}

@Component({
  selector: "tis-radio-option",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    style: "display: contents",
    "data-tis-angular-radio-option": "",
  },
  template: `
    <label class="ds-radio-label" [attr.for]="resolvedId()">
      <input
        class="ds-radio"
        [class.ds-radio--sm]="resolvedSize() === 'sm'"
        [class.ds-radio--lg]="resolvedSize() === 'lg'"
        [id]="resolvedId()"
        [name]="group.resolvedName()"
        [value]="value()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [required]="group.required()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="group.invalid() ? 'true' : null"
        type="radio"
        (change)="handleChange($event)"
      >
      <span class="ds-radio__content">
        <span class="ds-radio__label"><ng-content /></span>
        @if (description()) {
          <span class="ds-radio__description" [id]="descriptionId">{{ description() }}</span>
        }
        @if (helperText()) {
          <span class="ds-radio__helper" [id]="helperId">{{ helperText() }}</span>
        }
      </span>
    </label>
  `,
})
export class TisRadioOption {
  readonly group = inject(TisRadioGroup);
  private readonly generatedId = `tis-radio-${++nextRadioOptionId}`;

  readonly ariaDescribedby = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly helperText = input<string | null>(null);
  readonly id = input<string | null>(null);
  readonly size = input<TisRadioSize | null>(null);
  readonly value = input.required<string>();

  readonly descriptionId = `${this.generatedId}-description`;
  readonly helperId = `${this.generatedId}-helper`;
  readonly checked = computed(() => this.group.value() === this.value());
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
  readonly resolvedId = computed(() => this.id() || this.generatedId);
  readonly resolvedSize = computed(() => this.size() || this.group.size());
  readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.description() ? this.descriptionId : null,
    this.helperText() ? this.helperId : null,
    this.group.describedBy(),
  ].filter(Boolean).join(" ") || null);

  handleChange(event: Event): void {
    if ((event.currentTarget as HTMLInputElement).checked) this.group.select(this.value());
  }
}
