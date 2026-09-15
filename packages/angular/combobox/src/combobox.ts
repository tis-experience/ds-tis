import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
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
            #comboboxInput
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
              [attr.aria-label]="clearLabel()"
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
            [attr.hidden]="!combobox.expanded() || null"
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
export class TisCombobox implements ControlValueAccessor, Validator, OnDestroy {
  private readonly generatedId = `tis-combobox-${++nextComboboxId}`;
  private readonly formDisabled = signal(false);
  private readonly ariaCombobox = viewChild(AngularAriaCombobox);
  private readonly comboboxInputEl = viewChild<ElementRef<HTMLInputElement>>("comboboxInput");
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  readonly ariaDescribedby = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly clearLabel = input("Limpar seleção");
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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * `Escape` nativo do `@angular/aria` (`ComboboxPattern.onKeydown`, ligado
   * via host binding no `ngCombobox`) chama `close()` do pattern
   * DIRECTAMENTE — não passa por `TisCombobox.close()` (o método público
   * acima), por isso a correcção nesse método sozinha não protege este
   * caminho. `filterMode="manual"` limpa a selecção sempre que o `<input>`
   * não bate com o `searchTerm` de nenhum item; como `open()` limpa a query
   * ao reabrir sobre um valor já seleccionado (para mostrar a lista
   * completa), o `<input>` fica vazio e a selecção perdia-se ao premir
   * Escape sem ter escrito nada. Fase de CAPTURA no próprio host do
   * componente, acima do `div` onde o Angular ARIA regista o seu handler:
   * intercepta o Escape antes de esse handler correr, repõe query/valor
   * (mesma lógica de `close()`) e delega o fecho a `close()`, já seguro.
   */
  private readonly interceptEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || this.isDisabled() || this.readonly()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.close();
  };

  /**
   * O mesmo problema do Escape (ver `interceptEscape`) acontece ao sair por
   * completo do combobox por qualquer outro caminho — clicar fora, Tab para
   * o próximo campo. `Combobox` (`@angular/aria`) regista o seu próprio
   * `focusout` no `div.ds-combobox-anchor`, em fase de bolha; intercepta-se
   * aqui, no host, em fase de captura, antes de esse handler correr.
   * Substitui o binding de template `(focusout)="handleFocusOut($event)"`
   * que existia antes nesse `div` (nunca chegaria a correr de qualquer
   * forma, com a propagação interrompida mais acima) — a chamada a
   * `onTouched()` que esse método fazia está replicada aqui.
   */
  private readonly interceptFocusOut = (event: FocusEvent) => {
    const related = event.relatedTarget as Node | null;
    if (related && this.host.nativeElement.contains(related)) return;
    event.stopImmediatePropagation();
    this.close();
    this.onTouched();
  };

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

    this.host.nativeElement.addEventListener("keydown", this.interceptEscape, true);
    this.host.nativeElement.addEventListener("focusout", this.interceptFocusOut, true);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.removeEventListener("keydown", this.interceptEscape, true);
    this.host.nativeElement.removeEventListener("focusout", this.interceptFocusOut, true);
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

  /**
   * Reabrir sobre um valor já seleccionado limpa a query, para a lista
   * completa aparecer outra vez (o utilizador não devia ter de apagar o
   * texto à mão para poder escolher outra opção). Só limpa quando a query
   * ainda reflecte a opção seleccionada (nada digitado entretanto) — não
   * destrói uma pesquisa em curso se open() for chamado de novo enquanto o
   * popup já está aberto.
   */
  open(): void {
    if (this.isDisabled() || this.readonly()) return;
    const option = this.selectedOption();
    if (option && this.query() === option.label) this.query.set("");
    this.ariaCombobox()?.open();
  }

  /**
   * `ngCombobox` usa filterMode="manual": o `close()` do Angular ARIA limpa
   * a selecção sempre que o `<input>` não bate com o `searchTerm` de nenhum
   * item. Como `open()` (acima) limpa a query para mostrar a lista completa,
   * fechar sem escolher nada de novo deixava o `<input>` vazio e perdia a
   * selecção — mesmo sem o utilizador ter tocado em nada. Antes de delegar o
   * fecho ao Angular ARIA, repõe a query (modelo E o valor real do elemento
   * nativo — o ARIA lê `inputEl().value` directamente, não o signal, que só
   * seria escrito no DOM no próximo ciclo de change detection) para o label
   * da opção seleccionada, para o Angular ARIA encontrar a correspondência e
   * não limpar nada.
   */
  close(): void {
    const option = this.selectedOption();
    if (option && this.query() !== option.label) {
      this.query.set(option.label);
      const input = this.comboboxInputEl()?.nativeElement;
      if (input) input.value = option.label;
    }
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
}
