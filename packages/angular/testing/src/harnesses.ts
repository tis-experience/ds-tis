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
