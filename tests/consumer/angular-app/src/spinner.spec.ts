import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TisSpinner } from "@tis/angular/spinner";

@Component({
  standalone: true,
  imports: [TisSpinner],
  template: `<tis-spinner size="lg" onColor label="Carregando resultados" />
    <tis-spinner decorative data-testid="decorative" />`,
})
class HostComponent {}

describe("TisSpinner", () => {
  it("expõe um único status nomeado e as classes visuais", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.getAttribute("aria-label")).toBe("Carregando resultados");
    expect(status.classList.contains("ds-spinner--lg")).toBe(true);
    expect(status.classList.contains("ds-spinner--on-color")).toBe(true);
  });

  it("remove status e nome quando o spinner é decorativo", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('[data-testid="decorative"] [data-tis-angular-spinner]') as HTMLElement;
    expect(spinner.getAttribute("aria-hidden")).toBe("true");
    expect(spinner.hasAttribute("role")).toBe(false);
    expect(spinner.hasAttribute("aria-label")).toBe(false);
  });
});
