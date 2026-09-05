import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from "@angular/core";

let nextFieldId = 0;

/** Composition for a native control. Existing tis-input/select/textarea already include a field. */
@Component({
  selector: "tis-form-field",
  exportAs: "tisFormField",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-field",
    "data-tis-angular-form-field": "",
    "[class.ds-field--error]": "invalid()",
    "[class.ds-field--no-label]": "!showLabel()",
    "[class.ds-field--no-helper]": "!helperText()",
  },
  template: `
    <div class="ds-field__label-row">
      <label class="ds-field__label" [attr.for]="controlId()">{{ label() }}</label>
      @if (required()) {
        <span class="ds-field__required" aria-hidden="true">*</span>
      }
    </div>
    <ng-content />
    @if (invalid() && errorMessage()) {
      <span class="ds-field__error" [id]="errorId()" role="alert">{{ errorMessage() }}</span>
    }
    @if (helperText()) {
      <span class="ds-field__helper" [id]="helperId()">{{ helperText() }}</span>
    }
  `,
})
export class TisFormField {
  private readonly generatedId = `tis-form-field-${++nextFieldId}`;

  readonly label = input.required<string>();
  readonly for = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly showLabel = input(true, { transform: booleanAttribute });
  readonly helperText = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly ariaDescribedby = input<string | null>(null);

  /** Bind these values to the projected native control; its value/forms ownership stays with the consumer. */
  readonly controlId = computed(() => this.for() || this.generatedId);
  readonly helperId = computed(() => `${this.controlId()}-helper`);
  readonly errorId = computed(() => `${this.controlId()}-error`);
  readonly ariaLabel = computed(() => this.showLabel() ? null : this.label());
  readonly ariaInvalid = computed(() => this.invalid() ? "true" : null);
  readonly describedBy = computed(() => {
    const ids = [this.ariaDescribedby(), this.invalid() && this.errorMessage() ? this.errorId() : null,
      this.helperText() ? this.helperId() : null].filter(Boolean).join(" ").trim().split(/\s+/).filter(Boolean);
    return [...new Set(ids)].join(" ") || null;
  });
}
