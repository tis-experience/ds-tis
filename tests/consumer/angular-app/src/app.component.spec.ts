import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TestBed } from "@angular/core/testing";
import {
  TisAccordionHarness,
  TisButtonHarness,
  TisCheckboxHarness,
  TisModalHarness,
  TisPopoverHarness,
  TisRadioGroupHarness,
  TisSelectHarness,
  TisToggleHarness,
} from "@tis/angular/testing";

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

  it("integra o Checkbox nativo com Angular Forms, required e indeterminate", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const checkbox = await loader.getHarness(TisCheckboxHarness);

    expect(await checkbox.isChecked()).toBe(false);
    await checkbox.toggle();
    fixture.detectChanges();
    expect(await checkbox.isChecked()).toBe(true);
    expect(fixture.componentInstance.weeklySummary()).toBe(true);

    fixture.componentInstance.weeklySummary.set(false);
    fixture.componentInstance.checkboxSubmitted.set(true);
    fixture.detectChanges();
    expect(await checkbox.isInvalid()).toBe(true);
  });

  it("integra Radio nativo com seleção exclusiva, Angular Forms e required", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const radio = await loader.getHarness(TisRadioGroupHarness);

    expect(await radio.getOptionCount()).toBe(3);
    expect(await radio.getValue()).toBeNull();
    await radio.select("sms");
    fixture.detectChanges();
    expect(await radio.getValue()).toBe("sms");
    expect(fixture.componentInstance.notificationChannel()).toBe("sms");

    fixture.componentInstance.notificationChannel.set(null);
    fixture.componentInstance.radioSubmitted.set(true);
    fixture.detectChanges();
    expect(await radio.isInvalid()).toBe(true);
  });

  it("integra Toggle nativo com role switch e Angular Forms", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const toggle = await loader.getHarness(TisToggleHarness);

    expect(await toggle.isChecked()).toBe(true);
    await toggle.toggle();
    fixture.detectChanges();
    expect(await toggle.isChecked()).toBe(false);
    expect(fixture.componentInstance.securityAlerts()).toBe(false);
  });

  it("integra Select nativo com Angular Forms e required", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(TisSelectHarness);

    expect(await select.getValue()).toBe("");
    await select.selectOption("cl");
    fixture.detectChanges();
    expect(await select.getValue()).toBe("cl");
    expect(fixture.componentInstance.country()).toBe("cl");

    fixture.componentInstance.country.set("");
    fixture.componentInstance.selectSubmitted.set(true);
    fixture.detectChanges();
    expect(await select.isInvalid()).toBe(true);
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

  it("abre e fecha o Modal pelo entrypoint instalado", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const modal = await loader.getHarness(TisModalHarness);
    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="modal-trigger"] button[data-tis-angular-button]',
    ) as HTMLButtonElement;

    expect(await modal.isOpen()).toBe(false);
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await modal.isOpen()).toBe(true);
    const dialog = document.querySelector(".tis-angular-modal-pane .ds-modal");
    expect(dialog?.getAttribute("role")).toBe("dialog");
    expect(dialog?.getAttribute("aria-modal")).toBe("true");

    await modal.close();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await modal.isOpen()).toBe(false);
    expect(fixture.componentInstance.lastModalCloseReason()).toBe("close-button");
  });
});
