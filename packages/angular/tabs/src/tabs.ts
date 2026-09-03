import { Tab, TabContent, TabList, TabPanel, Tabs } from "@angular/aria/tabs";
import { Directive, inject } from "@angular/core";

export type TisTabsOrientation = "horizontal" | "vertical";
export type TisTabsSelectionMode = "follow" | "explicit";
export type TisTabsFocusMode = "roving" | "activedescendant";

@Directive({
  selector: "[tisTabs]",
  standalone: true,
  exportAs: "tisTabs",
  hostDirectives: [Tabs],
  host: {
    class: "ds-tabs-root",
    "data-tis-angular-tabs": "",
  },
})
export class TisTabs {}

@Directive({
  selector: "[tisTabList]",
  standalone: true,
  exportAs: "tisTabList",
  hostDirectives: [{
    directive: TabList,
    inputs: [
      "orientation",
      "wrap",
      "softDisabled",
      "focusMode",
      "selectionMode",
      "selectedTab",
      "disabled",
    ],
    outputs: ["selectedTabChange"],
  }],
  host: {
    class: "ds-tabs",
    "data-tis-angular-tab-list": "",
  },
})
export class TisTabList {
  private readonly ariaTabList = inject(TabList);

  readonly selectedTab = this.ariaTabList.selectedTab;
  readonly orientation = this.ariaTabList.orientation;
  readonly disabled = this.ariaTabList.disabled;

  open(value: string): boolean {
    return this.ariaTabList.open(value);
  }
}

@Directive({
  selector: "button[tisTab]",
  standalone: true,
  exportAs: "tisTab",
  hostDirectives: [{
    directive: Tab,
    inputs: ["id", "disabled", "value"],
  }],
  host: {
    class: "ds-tab",
    type: "button",
    "[disabled]": "disabled()",
    "[class.ds-tab--active]": "selected()",
    "[class.ds-tab--disabled]": "disabled()",
  },
})
export class TisTab {
  private readonly ariaTab = inject(Tab);

  readonly active = this.ariaTab.active;
  readonly selected = this.ariaTab.selected;
  readonly disabled = this.ariaTab.disabled;

  open(): void {
    this.ariaTab.open();
  }
}

@Directive({
  selector: "[tisTabPanel]",
  standalone: true,
  exportAs: "tisTabPanel",
  hostDirectives: [{
    directive: TabPanel,
    inputs: ["id", "value"],
  }],
  host: {
    class: "ds-tab-panel",
    "[hidden]": "!visible()",
  },
})
export class TisTabPanel {
  private readonly ariaTabPanel = inject(TabPanel);
  readonly visible = this.ariaTabPanel.visible;
}

@Directive({
  selector: "ng-template[tisTabContent]",
  standalone: true,
  hostDirectives: [TabContent],
})
export class TisTabContent {}
