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
  untracked,
  viewChild,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import {
  Combobox as AngularAriaCombobox,
  ComboboxInput,
  ComboboxPopupContainer,
} from "@angular/aria/combobox";
import {
  Listbox,
  Option,
} from "@angular/aria/listbox";

export type TisComboboxSize = "sm" | "md" | "lg";

export interface TisComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let nextComboboxId = 0;

@Directive({
  selector: "[tisComboboxIcon]",
  standalone: true,
  host: {
    class: "ds-combobox__icon ds-icon",
    "aria-hidden": "true",
  },
})
export class TisComboboxIcon {}

@Component({
  selector: "tis-combobox",
  standalone: true,
  imports: [
    AngularAriaCombobox,
    ComboboxInput,
    ComboboxPopupContainer,
    Listbox,
    Option,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TisCombobox),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TisCombobox),
      multi: true,
    },
  ],
  host: {
    style: "display: contents",
    "data-tis-angular-combobox": "",
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
        class="ds-combobox-anchor"
        ngCombobox
        filterMode="manual"
        [disabled]="isDisabled()"
        [readonly]="readonly()"
        [firstMatch]="firstMatch()"
        #combobox="ngCombobox"
        (focusout)="handleFocusOut($event)"
      >
        <div
          class="ds-combobox"
          [class.ds-combobox--sm]="size() === 'sm'"
          [class.ds-combobox--lg]="size() === 'lg'"
          [class.ds-combobox--filled]="hasValue()"
          [class.ds-combobox--open]="combobox.expanded()"
          [class.ds-combobox--error]="invalid()"
          [class.ds-combobox--disabled]="isDisabled() && !readonly()"
          [class.ds-combobox--readonly]="readonly()"
        >
          <ng-content select="[tisComboboxIcon]" />
          <input
            class="ds-combobox__input"
            ngComboboxInput
            type="text"
            autocomplete="off"
            [id]="resolvedId()"
            [name]="name()"
            [value]="query()"
            [disabled]="isDisabled()"
            [readOnly]="readonly()"
            [required]="required()"
            [placeholder]="placeholder()"
            [attr.aria-label]="resolvedAriaLabel()"
            [attr.aria-describedby]="describedBy()"
            [attr.aria-invalid]="invalid() ? 'true' : null"
            [attr.aria-required]="required() ? 'true' : null"
            (input)="handleNativeInput($event)"
            (focus)="open()"
          >
          @if (showClearButton()) {
            <button
              class="ds-combobox__clear"
              type="button"
              aria-label="Limpar seleção"
              [hidden]="!hasValue() || isDisabled() || readonly()"
              (pointerdown)="$event.preventDefault()"
              (click)="clear()"
            >
              <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          }
          <svg class="ds-combobox__chevron ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <ng-template ngComboboxPopupContainer>
          <ul
            class="ds-combobox__listbox"
            ngListbox
            focusMode="activedescendant"
            selectionMode="explicit"
            [wrap]="false"
            [softDisabled]="false"
            [disabled]="isDisabled()"
            [readonly]="readonly()"
            [values]="selectedValues()"
            (valuesChange)="handleSelection($event)"
          >
            @for (option of filteredOptions(); track option.value) {
              <li
                class="ds-combobox__option"
                ngOption
                [value]="option.value"
                [label]="option.label"
                [disabled]="option.disabled ?? false"
              >{{ option.label }}</li>
            }
          </ul>
        </ng-template>
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
export class TisCombobox implements ControlValueAccessor, Validator {
  private readonly generatedId = `tis-combobox-${++nextComboboxId}`;
  private readonly formDisabled = signal(false);
  private readonly ariaCombobox = viewChild(AngularAriaCombobox);
  private onChange: (value: string | null) => void = () => undefined;
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
  readonly options = input.required<readonly TisComboboxOption[]>();
  readonly placeholder = input("Busque uma opção");
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showClearButton = input(true, { transform: booleanAttribute });
  readonly showLabel = input(true, { transform: booleanAttribute });
  readonly size = input<TisComboboxSize>("md");
  readonly value = model<string | null>(null);
  readonly query = model("");

  protected readonly errorId = `${this.generatedId}-error`;
  protected readonly helperId = `${this.generatedId}-helper`;
  protected readonly resolvedId = computed(() => this.id() || this.generatedId);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly selectedValues = computed(() => this.value() ? [this.value() as string] : []);
  protected readonly selectedOption = computed(() => this.options().find((option) => option.value === this.value()) ?? null);
  protected readonly hasValue = computed(() => this.query().length > 0);
  protected readonly normalizedQuery = computed(() => this.query().trim().toLocaleLowerCase("pt-BR"));
  protected readonly filteredOptions = computed(() => {
    const query = this.normalizedQuery();
    return query
      ? this.options().filter((option) => option.label.toLocaleLowerCase("pt-BR").includes(query))
      : [...this.options()];
  });
  protected readonly firstMatch = computed(() => this.filteredOptions().find((option) => !option.disabled)?.value);
  protected readonly describedBy = computed(() => [
    this.ariaDescribedby(),
    this.invalid() && this.errorMessage() ? this.errorId : null,
    this.helperText() ? this.helperId : null,
  ].filter(Boolean).join(" ") || null);
  protected readonly resolvedAriaLabel = computed(() => this.ariaLabel() || (!this.showLabel() ? this.label() : null));

  constructor() {
    effect(() => {
      this.required();
      this.onValidatorChange();
    });

    effect(() => {
      const option = this.selectedOption();
      if (option && untracked(() => this.query()) !== option.label) this.query.set(option.label);
      if (!option && this.value() !== null) this.value.set(null);
    });
  }

  writeValue(value: unknown): void {
    const normalized = value === null || value === undefined || value === "" ? null : String(value);
    this.value.set(normalized);
    this.query.set(this.options().find((option) => option.value === normalized)?.label ?? "");
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
    return this.required() && !String(control.value ?? "") ? { required: true } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  open(): void {
    if (!this.isDisabled() && !this.readonly()) this.ariaCombobox()?.open();
  }

  close(): void {
    this.ariaCombobox()?.close();
  }

  clear(): void {
    if (this.isDisabled() || this.readonly()) return;
    this.value.set(null);
    this.query.set("");
    this.onChange(null);
    this.open();
  }

  protected handleQueryChange(query: string): void {
    this.query.set(query);
    const selected = this.selectedOption();
    if (selected && query !== selected.label) {
      this.value.set(null);
      this.onChange(null);
    }
  }

  protected handleNativeInput(event: Event): void {
    this.handleQueryChange((event.currentTarget as HTMLInputElement).value);
  }

  protected handleSelection(values: string[]): void {
    const selected = values.at(0) ?? null;
    if (selected === this.value()) return;
    this.value.set(selected);
    const option = this.options().find((item) => item.value === selected);
    this.query.set(option?.label ?? "");
    this.onChange(selected);
  }

  protected handleFocusOut(event: FocusEvent): void {
    const anchor = event.currentTarget as HTMLElement;
    if (!event.relatedTarget || !anchor.contains(event.relatedTarget as Node)) this.onTouched();
  }
}
