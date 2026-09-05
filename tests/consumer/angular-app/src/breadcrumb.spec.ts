import { TestBed } from "@angular/core/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TisBreadcrumbHarness } from "@tis/angular/testing";
import { AppComponent } from "./app.component";

describe("Breadcrumb Angular", () => {
  it("preserva landmark, links nativos, separadores decorativos e página atual", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const harness = await TestbedHarnessEnvironment.loader(fixture).getHarness(TisBreadcrumbHarness);
    expect(await harness.getLabel()).toBe("Caminho do projeto");
    expect(await harness.getLinks()).toEqual(["Início", "Projetos"]);
    expect(await harness.getCurrentPage()).toBe("Design System");
    const nav = fixture.nativeElement.querySelector("nav[tisBreadcrumb]") as HTMLElement;
    expect(nav.classList.contains("ds-breadcrumb")).toBe(true);
    const current = nav.querySelector('[aria-current="page"]') as HTMLElement;
    expect(current.tagName).toBe("SPAN");
    expect(current.tabIndex).toBe(-1);
    expect(nav.querySelector("a")?.getAttribute("href")).toBe("#breadcrumb-home");
    expect(nav.querySelectorAll('[tisBreadcrumbSeparator][aria-hidden="true"]').length).toBe(2);
  });

  it("atualiza o texto atual sem criar link ou item tabulável", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    fixture.componentInstance.breadcrumbPage.set("Documentação");
    await fixture.whenStable();
    const nav = fixture.nativeElement.querySelector("nav[tisBreadcrumb]");
    expect(nav.querySelector('[aria-current="page"]').textContent).toBe("Documentação");
    expect(nav.querySelectorAll('[aria-current="page"]').length).toBe(1);
    expect(nav.querySelectorAll("a").length).toBe(2);
  });
});
