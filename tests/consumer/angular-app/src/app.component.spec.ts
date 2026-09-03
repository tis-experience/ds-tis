import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TestBed } from "@angular/core/testing";
import {
  TisAccordionHarness,
  TisButtonHarness,
  TisCheckboxHarness,
  TisInputHarness,
  TisModalHarness,
  TisPopoverHarness,
  TisRadioGroupHarness,
  TisSelectHarness,
  TisTabsHarness,
  TisTextareaHarness,
  TisToggleHarness,
  TisTooltipHarness,
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

  it("integra Input Text nativo com Angular Forms e required", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const input = await loader.getHarness(TisInputHarness);

    expect(await input.getValue()).toBe("");
    await input.setValue("ana@empresa.com");
    fixture.detectChanges();
    expect(await input.getValue()).toBe("ana@empresa.com");
    expect(fixture.componentInstance.email()).toBe("ana@empresa.com");

    fixture.componentInstance.email.set("");
    fixture.componentInstance.inputSubmitted.set(true);
    fixture.detectChanges();
    expect(await input.isInvalid()).toBe(true);
  });

  it("integra Textarea nativo com Angular Forms, required e contador", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const textarea = await loader.getHarness(TisTextareaHarness);

    expect(await textarea.getValue()).toBe("");
    await textarea.setValue("Contexto para revisão.");
    fixture.detectChanges();
    expect(await textarea.getValue()).toBe("Contexto para revisão.");
    expect(fixture.componentInstance.message()).toBe("Contexto para revisão.");
    expect(fixture.nativeElement.querySelector("tis-textarea .ds-field__counter")?.textContent.trim()).toBe("22/500");

    fixture.componentInstance.message.set("");
    fixture.componentInstance.textareaSubmitted.set(true);
    fixture.detectChanges();
    expect(await textarea.isInvalid()).toBe(true);
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

  it("integra Tabs com seleção, painéis e relações ARIA", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getHarness(TisTabsHarness);

    expect(await tabs.getTabCount()).toBe(3);
    expect(await tabs.getSelectedValue()).toBe("overview");
    expect(await tabs.getVisiblePanelCount()).toBe(1);

    await tabs.select("team");
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await tabs.getSelectedValue()).toBe("team");
    expect(await tabs.getVisiblePanelCount()).toBe(1);
    expect(fixture.componentInstance.selectedTab()).toBe("team");

    const tabElements = fixture.nativeElement.querySelectorAll("button[tisTab]");
    expect(tabElements[1].getAttribute("aria-controls")).toBeTruthy();
    expect(tabElements[2].getAttribute("aria-disabled")).toBe("true");
  });

  it("integra Tooltip com focus e aria-describedby", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tooltip = await loader.getHarness(TisTooltipHarness);

    expect(await tooltip.isOpen()).toBe(false);
    expect(await tooltip.getDescriptionId()).toMatch(/^tis-tooltip-/);
    await tooltip.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await tooltip.isOpen()).toBe(true);

    const descriptionId = await tooltip.getDescriptionId();
    const content = fixture.nativeElement.ownerDocument.getElementById(descriptionId);
    expect(content?.getAttribute("role")).toBe("tooltip");
    expect(content?.textContent?.trim()).toBe("Editar documento");
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
