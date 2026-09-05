import { ComponentHarness } from "@angular/cdk/testing";

export class TisPaginationHarness extends ComponentHarness {
  static readonly hostSelector = "tis-pagination";
  private readonly nav = this.locatorFor("nav[data-tis-angular-pagination]");
  private readonly pageLinks = this.locatorForAll("a.ds-pagination__page");
  private readonly navigationButtons = this.locatorForAll("nav[data-tis-angular-pagination] button");

  async getCurrentPage(): Promise<number> {
    return Number(await (await this.locatorFor('[aria-current="page"]')()).text());
  }

  async getLabel(): Promise<string | null> {
    return (await this.nav()).getAttribute("aria-label");
  }

  async goTo(page: number): Promise<void> {
    for (const link of await this.pageLinks()) {
      if ((await link.text()).trim() === String(page)) {
        await link.click();
        return;
      }
    }
    throw new Error(`Pagination page link not found: ${page}`);
  }

  async next(): Promise<void> {
    await (await this.navigationButtons())[1].click();
  }

  async previous(): Promise<void> {
    await (await this.navigationButtons())[0].click();
  }
}

export class TisSkeletonHarness extends ComponentHarness {
  static readonly hostSelector = "tis-skeleton";
  async getType(): Promise<string | null> { return (await this.host()).getAttribute("data-type"); }
  async isDecorative(): Promise<boolean> { return (await this.host()).getAttribute("aria-hidden").then(value => value === "true"); }
}

export class TisSpinnerHarness extends ComponentHarness {
  static readonly hostSelector = "[data-tis-angular-spinner]";
  async getLabel(): Promise<string | null> { return (await this.host()).getAttribute("aria-label"); }
  async getSize(): Promise<string | null> { return (await this.host()).getAttribute("data-size"); }
  async isDecorative(): Promise<boolean> { return (await this.host()).getAttribute("aria-hidden").then(value => value === "true"); }
}

export class TisTableHarness extends ComponentHarness {
  static readonly hostSelector = "table[data-tis-angular-table]";
  private readonly rows = this.locatorForAll("tbody tr");
  async getCaption(): Promise<string> { return (await this.locatorFor("caption")()).text(); }
  async getRowCount(): Promise<number> { return (await this.rows()).length; }
  async getSortDirection(): Promise<string | null> { return (await this.locatorFor("th[aria-sort]")()).getAttribute("aria-sort"); }
  async sort(): Promise<void> { await (await this.locatorFor("button[tisTableSort]")()).click(); }
}

export class TisBreadcrumbHarness extends ComponentHarness {
  static readonly hostSelector = "nav[tisBreadcrumb]";
  async getLabel(): Promise<string | null> { return (await this.host()).getAttribute("aria-label"); }
  async getLinks(): Promise<string[]> {
    return Promise.all((await this.locatorForAll("a[tisBreadcrumbLink]")()).map((link) => link.text()));
  }
  async getCurrentPage(): Promise<string> { return (await this.locatorFor("span[tisBreadcrumbCurrent]")()).text(); }
}

export class TisAlertHarness extends ComponentHarness {
  static readonly hostSelector = "tis-alert";
  private readonly closeButton = this.locatorForOptional("button[tisAlertClose]");

  async close(): Promise<void> {
    const button = await this.closeButton();
    if (!button) throw new Error("Alert close button not found");
    await button.click();
  }

  async getDescription(): Promise<string> {
    return (await this.locatorFor("[tisAlertDescription]")()).text().then((value) => value.trim());
  }

  async getRole(): Promise<string | null> {
    return (await this.host()).getAttribute("role");
  }

  async getTitle(): Promise<string> {
    return (await this.locatorFor("[tisAlertTitle]")()).text().then((value) => value.trim());
  }

  async getTone(): Promise<string | null> {
    return (await this.host()).getAttribute("data-tone");
  }

  async getVariant(): Promise<string | null> {
    return (await this.host()).getAttribute("data-variant");
  }
}

export class TisBadgeHarness extends ComponentHarness {
  static readonly hostSelector = "tis-badge";

  async getText(): Promise<string> {
    return (await this.host()).text().then((value) => value.trim());
  }

  async getTone(): Promise<string | null> {
    return (await this.host()).getAttribute("data-tone");
  }

  async getVariant(): Promise<string | null> {
    return (await this.host()).getAttribute("data-variant");
  }
}

export class TisButtonHarness extends ComponentHarness {
  static readonly hostSelector = "tis-button";
  private readonly button = this.locatorFor("button[data-tis-angular-button]");

  async click(): Promise<void> {
    await (await this.button()).click();
  }

  async isDisabled(): Promise<boolean> {
    return (await this.button()).getAttribute("disabled").then((value) => value !== null);
  }

  async isLoading(): Promise<boolean> {
    return (await this.button()).getAttribute("aria-busy").then((value) => value === "true");
  }
}

export class TisCardHarness extends ComponentHarness {
  static readonly hostSelector = "[tisCard]";

  async click(): Promise<void> {
    await (await this.host()).click();
  }

  async getTitle(): Promise<string> {
    return (await this.locatorFor("[tisCardTitle]")()).text().then((value) => value.trim());
  }

  async getVariant(): Promise<string | null> {
    return (await this.host()).getAttribute("data-variant");
  }

  async isSelected(): Promise<boolean> {
    return (await this.host()).getAttribute("aria-pressed").then((value) => value === "true");
  }
}

export class TisDividerHarness extends ComponentHarness {
  static readonly hostSelector = "hr[tisDivider]";

  async getOrientation(): Promise<string | null> {
    return (await this.host()).getAttribute("data-orientation");
  }

  async isDecorative(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute("aria-hidden")) === "true" &&
      (await host.getAttribute("role")) === "presentation";
  }
}

export class TisAccordionHarness extends ComponentHarness {
  static readonly hostSelector = "[tisAccordion]";
  private readonly triggers = this.locatorForAll("button[tisAccordionTrigger]");

  async getItemCount(): Promise<number> {
    return (await this.triggers()).length;
  }

  async isExpanded(index: number): Promise<boolean> {
    const trigger = (await this.triggers())[index];
    return (await trigger.getAttribute("aria-expanded")) === "true";
  }

  async toggle(index: number): Promise<void> {
    await (await this.triggers())[index].click();
  }
}

export class TisCheckboxHarness extends ComponentHarness {
  static readonly hostSelector = "tis-checkbox";
  private readonly input = this.locatorFor('input[type="checkbox"]');

  async toggle(): Promise<void> {
    await (await this.input()).click();
  }

  async isChecked(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>("checked");
  }

  async isIndeterminate(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>("indeterminate");
  }

  async isDisabled(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>("disabled");
  }

  async isInvalid(): Promise<boolean> {
    return (await this.input()).getAttribute("aria-invalid").then((value) => value === "true");
  }
}

export class TisComboboxHarness extends ComponentHarness {
  static readonly hostSelector = "tis-combobox";
  private readonly input = this.locatorFor("input.ds-combobox__input");
  private readonly options = this.locatorForAll(".ds-combobox__option");

  async getValue(): Promise<string> {
    return (await this.input()).getProperty<string>("value");
  }

  async setQuery(value: string): Promise<void> {
    const input = await this.input();
    await input.clear();
    await input.sendKeys(value);
  }

  async isOpen(): Promise<boolean> {
    return (await this.input()).getAttribute("aria-expanded").then((value) => value === "true");
  }

  async getActiveDescendant(): Promise<string | null> {
    return (await this.input()).getAttribute("aria-activedescendant");
  }

  async getVisibleOptionLabels(): Promise<string[]> {
    const labels: string[] = [];
    for (const option of await this.options()) {
      if (await option.getAttribute("hidden") === null) labels.push(await option.text());
    }
    return labels;
  }

  async select(label: string): Promise<void> {
    for (const option of await this.options()) {
      if ((await option.text()).trim() === label) {
        await option.click();
        return;
      }
    }
    throw new Error(`Combobox option not found: ${label}`);
  }

  async clear(): Promise<void> {
    await (await this.locatorFor("button.ds-combobox__clear")()).click();
  }

  async isInvalid(): Promise<boolean> {
    return (await this.input()).getAttribute("aria-invalid").then((value) => value === "true");
  }
}

export class TisInputHarness extends ComponentHarness {
  static readonly hostSelector = "tis-input";
  private readonly input = this.locatorFor("input.ds-input__field");

  async getValue(): Promise<string> {
    return (await this.input()).getProperty<string>("value");
  }

  async setValue(value: string): Promise<void> {
    const input = await this.input();
    await input.clear();
    await input.sendKeys(value);
  }

  async isDisabled(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>("disabled");
  }

  async isInvalid(): Promise<boolean> {
    return (await this.input()).getAttribute("aria-invalid").then((value) => value === "true");
  }
}

export class TisMenuHarness extends ComponentHarness {
  static readonly hostSelector = "[tisActionMenu]";
  private readonly trigger = this.locatorFor("button[tisMenuTrigger]");
  private readonly items = this.locatorForAll(
    "button[tisMenuItem], button[tisMenuCheckboxItem], button[tisMenuRadioItem]",
  );

  async open(): Promise<void> {
    if (!(await this.isOpen())) await (await this.trigger()).click();
  }

  async isOpen(): Promise<boolean> {
    return (await this.trigger()).getAttribute("aria-expanded").then((value) => value === "true");
  }

  async getItemCount(): Promise<number> {
    return (await this.items()).length;
  }

  async select(label: string): Promise<void> {
    for (const item of await this.items()) {
      if ((await item.text()).trim().includes(label)) {
        await item.click();
        return;
      }
    }
    throw new Error(`Menu item not found: ${label}`);
  }
}

export class TisRadioGroupHarness extends ComponentHarness {
  static readonly hostSelector = "tis-radio-group";
  private readonly fieldset = this.locatorFor("fieldset.ds-radio-group");
  private readonly inputs = this.locatorForAll('input[type="radio"]');

  async getOptionCount(): Promise<number> {
    return (await this.inputs()).length;
  }

  async getValue(): Promise<string | null> {
    for (const input of await this.inputs()) {
      if (await input.getProperty<boolean>("checked")) return input.getAttribute("value");
    }
    return null;
  }

  async select(value: string): Promise<void> {
    for (const input of await this.inputs()) {
      if (await input.getAttribute("value") === value) {
        await input.click();
        return;
      }
    }
    throw new Error(`Radio option not found: ${value}`);
  }

  async isInvalid(): Promise<boolean> {
    return (await this.fieldset()).getAttribute("aria-invalid").then((value) => value === "true");
  }
}

export class TisToggleHarness extends ComponentHarness {
  static readonly hostSelector = "tis-toggle";
  private readonly input = this.locatorFor('input[role="switch"]');

  async toggle(): Promise<void> {
    await (await this.input()).click();
  }

  async isChecked(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>("checked");
  }

  async isDisabled(): Promise<boolean> {
    return (await this.input()).getProperty<boolean>("disabled");
  }
}

export class TisSelectHarness extends ComponentHarness {
  static readonly hostSelector = "tis-select";
  private readonly select = this.locatorFor("select.ds-select__field");
  private readonly options = this.locatorForAll("option");

  async getValue(): Promise<string> {
    return (await this.select()).getProperty<string>("value");
  }

  async selectOption(value: string): Promise<void> {
    const options = await this.options();
    for (let index = 0; index < options.length; index += 1) {
      if (await options[index].getAttribute("value") === value) {
        await (await this.select()).selectOptions(index);
        return;
      }
    }
    throw new Error(`Select option not found: ${value}`);
  }

  async isDisabled(): Promise<boolean> {
    return (await this.select()).getProperty<boolean>("disabled");
  }

  async isInvalid(): Promise<boolean> {
    return (await this.select()).getAttribute("aria-invalid").then((value) => value === "true");
  }
}

export class TisTabsHarness extends ComponentHarness {
  static readonly hostSelector = "[tisTabs]";
  private readonly tabs = this.locatorForAll("button[tisTab]");
  private readonly panels = this.locatorForAll("[tisTabPanel]");

  async getTabCount(): Promise<number> {
    return (await this.tabs()).length;
  }

  async getSelectedValue(): Promise<string | null> {
    for (const tab of await this.tabs()) {
      if ((await tab.getAttribute("aria-selected")) === "true") {
        return tab.getAttribute("value");
      }
    }
    return null;
  }

  async select(value: string): Promise<void> {
    for (const tab of await this.tabs()) {
      if (await tab.getAttribute("value") === value) {
        await tab.click();
        return;
      }
    }
    throw new Error(`Tab not found: ${value}`);
  }

  async getVisiblePanelCount(): Promise<number> {
    let count = 0;
    for (const panel of await this.panels()) {
      if (await panel.getAttribute("hidden") === null) count += 1;
    }
    return count;
  }
}

export class TisTooltipHarness extends ComponentHarness {
  static readonly hostSelector = "tis-tooltip";
  private readonly trigger = this.locatorFor("[tisTooltipTrigger]");

  async focus(): Promise<void> {
    await (await this.trigger()).focus();
  }

  async isOpen(): Promise<boolean> {
    return (await this.host()).getAttribute("data-open").then((value) => value === "true");
  }

  async getDescriptionId(): Promise<string | null> {
    return (await this.trigger()).getAttribute("aria-describedby");
  }
}

export class TisToastHarness extends ComponentHarness {
  static readonly hostSelector = "tis-toast-region";
  private readonly toasts = this.locatorForAll("[data-tis-angular-toast]");
  private readonly titles = this.locatorForAll("[data-tis-angular-toast] .ds-toast__title");
  private readonly actionButtons = this.locatorForAll("[data-tis-angular-toast] .ds-toast__actions button");
  private readonly closeButtons = this.locatorForAll("[data-tis-angular-toast] .ds-toast__close");

  async getToastCount(): Promise<number> {
    return (await this.toasts()).length;
  }

  async getTitles(): Promise<string[]> {
    return Promise.all((await this.titles()).map(async (title) => (await title.text()).trim()));
  }

  async activateAction(index = 0): Promise<void> {
    await (await this.actionButtons())[index].click();
  }

  async dismiss(index = 0): Promise<void> {
    await (await this.closeButtons())[index].click();
  }
}

export class TisTextareaHarness extends ComponentHarness {
  static readonly hostSelector = "tis-textarea";
  private readonly textarea = this.locatorFor("textarea.ds-textarea__field");

  async getValue(): Promise<string> {
    return (await this.textarea()).getProperty<string>("value");
  }

  async setValue(value: string): Promise<void> {
    const textarea = await this.textarea();
    await textarea.clear();
    await textarea.sendKeys(value);
  }

  async isDisabled(): Promise<boolean> {
    return (await this.textarea()).getProperty<boolean>("disabled");
  }

  async isInvalid(): Promise<boolean> {
    return (await this.textarea()).getAttribute("aria-invalid").then((value) => value === "true");
  }
}

export class TisPopoverHarness extends ComponentHarness {
  static readonly hostSelector = "tis-popover";
  private readonly trigger = this.locatorFor("[data-tis-angular-popover-trigger]");

  async toggle(): Promise<void> {
    await (await this.trigger()).click();
  }

  async isOpen(): Promise<boolean> {
    return (await this.trigger()).getAttribute("aria-expanded").then((value) => value === "true");
  }
}

export class TisModalHarness extends ComponentHarness {
  static readonly hostSelector = "tis-modal";

  async isOpen(): Promise<boolean> {
    return (await this.getDialog()) !== null;
  }

  async close(): Promise<void> {
    const dialogId = await this.getDialogId();
    const button = await this.documentRootLocatorFactory()
      .locatorForOptional(`#${dialogId} .ds-modal__close`)();
    if (button) await button.click();
  }

  private async getDialog() {
    const dialogId = await this.getDialogId();
    return this.documentRootLocatorFactory().locatorForOptional(`#${dialogId}`)();
  }

  private async getDialogId(): Promise<string> {
    return (await (await this.host()).getAttribute("data-dialog-id")) ?? "tis-modal-missing";
  }
}
