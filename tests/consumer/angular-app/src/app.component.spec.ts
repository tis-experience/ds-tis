import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TestBed } from "@angular/core/testing";
import { TisAccordionHarness, TisButtonHarness, TisPopoverHarness } from "@tis/angular/testing";

import { AppComponent } from "./app.component";

describe("DS TIS Angular consumer", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
  });

  it("submete pelo Button nativo e preserva loading/disabled", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const buttons = await loader.getAllHarnesses(TisButtonHarness);

    await buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted()).toBe(1);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(await buttons[2].isDisabled()).toBe(true);
    expect(await buttons[2].isLoading()).toBe(true);
  });

  it("mantém single mode, disabled e relações ARIA no Accordion", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const accordion = await loader.getHarness(TisAccordionHarness);

    expect(await accordion.getItemCount()).toBe(3);
    expect(await accordion.isExpanded(0)).toBe(true);
    await accordion.toggle(1);
    fixture.detectChanges();
    expect(await accordion.isExpanded(0)).toBe(false);
    expect(await accordion.isExpanded(1)).toBe(true);

    const disabled = fixture.nativeElement.querySelectorAll("button[tisAccordionTrigger]")[2];
    expect(disabled.disabled).toBe(true);
  });

  it("abre o Popover, fecha com Escape e retorna foco", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const popover = await loader.getHarness(TisPopoverHarness);

    await popover.toggle();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await popover.isOpen()).toBe(true);
    expect(document.querySelector(".tis-angular-popover-overlay")).not.toBeNull();

    document.querySelector(".ds-popover__panel")?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await popover.isOpen()).toBe(false);
    expect(fixture.componentInstance.lastCloseReason()).toBe("escape");
  });
});
