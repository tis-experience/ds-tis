import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import {
  TisAccordionHarness,
  TisAlertHarness,
  TisBadgeHarness,
  TisButtonHarness,
  TisCardHarness,
  TisCheckboxHarness,
  TisComboboxHarness,
  TisInputHarness,
  TisMenuHarness,
  TisModalHarness,
  TisPopoverHarness,
  TisRadioGroupHarness,
  TisSelectHarness,
  TisTabsHarness,
  TisTextareaHarness,
  TisToastHarness,
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

  it("renderiza Badge apresentacional com tom, variante e conteúdo projetado", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const badges = await loader.getAllHarnesses(TisBadgeHarness);

    expect(badges).toHaveLength(3);
    expect(await badges[0].getText()).toBe("Aprovado");
    expect(await badges[0].getTone()).toBe("success");
    expect(await badges[0].getVariant()).toBe("subtle");
    expect(await badges[1].getText()).toBe("Pendente");
    expect(await badges[1].getTone()).toBe("warning");
    expect(await badges[1].getVariant()).toBe("solid");
    expect(await badges[2].getText()).toBe("Saudável");
  });

  it("renderiza Alert com live region contextual e fechamento controlado", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const alert = await loader.getHarness(TisAlertHarness);

    expect(await alert.getTitle()).toBe("Configuração salva");
    expect(await alert.getDescription()).toBe("As preferências já estão disponíveis.");
    expect(await alert.getTone()).toBe("success");
    expect(await alert.getVariant()).toBe("subtle");
    expect(await alert.getRole()).toBe("status");
    await alert.close();
    fixture.detectChanges();
    expect(fixture.componentInstance.alertVisible()).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-testid="alert-dismissed"]')?.textContent.trim()).toBe("Alerta dispensado.");
  });

  it("preserva semântica e seleção no Card interativo", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const cards = await loader.getAllHarnesses(TisCardHarness);

    expect(cards).toHaveLength(2);
    expect(await cards[0].getTitle()).toBe("Uso da organização");
    expect(await cards[0].getVariant()).toBe("outlined");
    expect(await cards[0].isSelected()).toBe(false);
    expect(await cards[1].getTitle()).toBe("Segurança");
    expect(await cards[1].getVariant()).toBe("interactive");
    expect(await cards[1].isSelected()).toBe(false);
    await cards[1].click();
    fixture.detectChanges();
    expect(await cards[1].isSelected()).toBe(true);
    expect(fixture.componentInstance.cardSelected()).toBe(true);
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

  it("integra Combobox com filtro, seleção, clear e Angular Forms", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const combobox = await loader.getHarness(TisComboboxHarness);

    expect(await combobox.getValue()).toBe("");
    await combobox.setQuery("Bra");
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await combobox.isOpen()).toBe(true);
    expect(await combobox.getVisibleOptionLabels()).toEqual(["Brasil"]);

    await combobox.select("Brasil");
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await combobox.getValue()).toBe("Brasil");
    expect(fixture.componentInstance.searchCountry()).toBe("br");

    await combobox.clear();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.searchCountry()).toBeNull();

    fixture.componentInstance.comboboxSubmitted.set(true);
    fixture.detectChanges();
    expect(await combobox.isInvalid()).toBe(true);
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

  it("integra Menu com abertura, item disabled e seleção", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const menu = await loader.getHarness(TisMenuHarness);

    expect(await menu.isOpen()).toBe(false);
    expect(await menu.getItemCount()).toBe(3);
    await menu.open();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await menu.isOpen()).toBe(true);

    const disabled = fixture.nativeElement.querySelector('button[tisMenuItem][aria-disabled="true"]');
    expect(disabled?.textContent).toContain("Transferir");
    await menu.select("Editar");
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await menu.isOpen()).toBe(false);
    expect(fixture.componentInstance.lastMenuAction()).toBe("edit");
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

  it("integra Toast com região live, action persistente e dismiss", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const toast = await loader.getHarness(TisToastHarness);

    fixture.componentInstance.showToast();
    fixture.detectChanges();
    expect(await toast.getToastCount()).toBe(1);
    expect(await toast.getTitles()).toEqual(["Alterações salvas"]);
    expect(fixture.nativeElement.querySelector(".ds-toast-region__polite")?.getAttribute("role")).toBe("status");
    expect(fixture.nativeElement.querySelector(".ds-toast-region__assertive")?.getAttribute("role")).toBe("alert");

    await toast.activateAction();
    fixture.detectChanges();
    expect(fixture.componentInstance.toastActionCount()).toBe(1);
    expect(await toast.getToastCount()).toBe(1);

    await toast.dismiss();
    fixture.detectChanges();
    expect(await toast.getToastCount()).toBe(0);
  });

  it("pausa e retoma o timeout do Toast sem perder o tempo restante", async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.loader(fixture);
      const toast = await loader.getHarness(TisToastHarness);
      const id = fixture.componentInstance.toastService.show({ title: "Temporário", duration: 100 });
      fixture.detectChanges();

      vi.advanceTimersByTime(40);
      fixture.componentInstance.toastService.pause(id);
      vi.advanceTimersByTime(100);
      fixture.detectChanges();
      expect(await toast.getToastCount()).toBe(1);

      fixture.componentInstance.toastService.resume(id);
      vi.advanceTimersByTime(60);
      fixture.detectChanges();
      expect(await toast.getToastCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
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
