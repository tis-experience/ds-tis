import { ComponentHarness } from "@angular/cdk/testing";

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
