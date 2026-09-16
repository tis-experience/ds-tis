import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TisFormField } from "@tis/angular/form-field";
import { AppComponent } from "./app.component";

@Component({
  imports: [TisFormField],
  template: `
    <tis-form-field #field="tisFormField" label="Nome" [for]="controlId()" [invalid]="invalid()"
      required="false" [showLabel]="visible()" [helperText]="helper()" errorMessage="Corrija o nome."
      ariaDescribedby="external external">
      <div class="ds-input"><input class="ds-input__field" [id]="field.controlId()"
        [attr.aria-label]="field.ariaLabel()" [attr.aria-invalid]="field.ariaInvalid()"
        [attr.aria-describedby]="field.describedBy()" [required]="field.required()"></div>
    </tis-form-field>
    <tis-form-field #other="tisFormField" label="Outro">
      <div class="ds-input"><input class="ds-input__field" [id]="other.controlId()"></div>
    </tis-form-field>
    <p id="external">Descrição externa</p>`,
})
class Host {
  readonly invalid = signal(false);
  readonly visible = signal(true);
  readonly helper = signal<string | null>("Ajuda");
  readonly controlId = signal<string | null>(null);
}

describe("Form Field Angular", () => {
  it("gera IDs distintos, preserva descrições externas e só referencia erro visível", async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [input, other] = Array.from(fixture.nativeElement.querySelectorAll("input") as NodeListOf<HTMLInputElement>);
    const label = fixture.nativeElement.querySelector("label") as HTMLLabelElement;
    expect(input.id).not.toBe(other.id);
    expect(label.htmlFor).toBe(input.id);
    expect(input.required).toBe(false);
    expect(input.getAttribute("aria-describedby")).toBe(`external ${input.id}-helper`);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    fixture.componentInstance.invalid.set(true);
    await fixture.whenStable();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(`external ${input.id}-error ${input.id}-helper`);
    expect(fixture.nativeElement.querySelector('[role="alert"]').id).toBe(`${input.id}-error`);
    fixture.componentInstance.invalid.set(false);
    fixture.componentInstance.helper.set(null);
    await fixture.whenStable();
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBe("external");
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it("atualiza ID explícito e nome acessível quando label fica oculto", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.controlId.set("contact-name");
    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    expect(input.id).toBe("contact-name");
    expect(input.getAttribute("aria-label")).toBe("Nome");
    expect(input.getAttribute("aria-describedby")).toBe("external contact-name-helper");
    fixture.componentInstance.controlId.set("renamed");
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    expect(input.id).toBe("renamed");
    expect(fixture.nativeElement.querySelector("label").htmlFor).toBe("renamed");
    expect(input.getAttribute("aria-label")).toBeNull();
  });

  it("mantém ngModel no controle projetado e remove erro depois da correção", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.fieldSubmitted.set(true);
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector("tis-form-field");
    const input = field.querySelector("input") as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    input.value = "Ana";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.contactName()).toBe("Ana");
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(field.querySelector('[role="alert"]')).toBeNull();
  });
});
