import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from "@angular/aria/accordion";
import {
  Directive,
  booleanAttribute,
  computed,
  contentChild,
  inject,
} from "@angular/core";

export type TisAccordionMode = "single" | "multiple";

@Directive({
  selector: "[tisAccordion]",
  standalone: true,
  exportAs: "tisAccordion",
  hostDirectives: [{
    directive: AccordionGroup,
    inputs: [
      "disabled: groupDisabled",
      "multiExpandable",
      "softDisabled",
      "wrap",
    ],
  }],
  host: {
    class: "ds-accordion",
    "data-tis-angular-accordion": "",
    "[attr.data-accordion-mode]": "mode()",
  },
})
export class TisAccordion {
  private readonly ariaGroup = inject(AccordionGroup);
  protected readonly mode = computed<TisAccordionMode>(() => (
    this.ariaGroup.multiExpandable() ? "multiple" : "single"
  ));
}

@Directive({
  selector: "button[tisAccordionTrigger]",
  standalone: true,
  exportAs: "tisAccordionTrigger",
  hostDirectives: [{
    directive: AccordionTrigger,
    inputs: ["panel", "id", "disabled", "expanded"],
    outputs: ["expandedChange"],
  }],
  host: {
    class: "ds-accordion__trigger",
    ngAccordionTrigger: "",
    type: "button",
    "(pointerdown)": "handlePointerdown($event)",
  },
})
export class TisAccordionTrigger {
  private readonly ariaTrigger = inject(AccordionTrigger);

  readonly disabled = this.ariaTrigger.disabled;
  readonly expanded = this.ariaTrigger.expanded;
  readonly active = this.ariaTrigger.active;

  expand(): void {
    this.ariaTrigger.expand();
  }

  collapse(): void {
    this.ariaTrigger.collapse();
  }

  toggle(): void {
    this.ariaTrigger.toggle();
  }

  protected handlePointerdown(event: PointerEvent): void {
    if (event.button !== 0 || event.defaultPrevented || this.disabled()) return;

    // Angular Aria focuses the roving item programmatically during pointerdown.
    // In Chromium that makes :focus-visible persist after a mouse click. Keep
    // pointer interaction focus-neutral; Tab and the arrow keys still enter and
    // navigate the roving focus model with the expected visible focus ring.
    event.preventDefault();
    event.stopImmediatePropagation();
    this.ariaTrigger.toggle();
  }
}

@Directive({
  selector: "[tisAccordionItem]",
  standalone: true,
  host: {
    class: "ds-accordion__item",
    "[class.ds-accordion__item--disabled]": "disabled()",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[attr.data-state]": "state()",
  },
})
export class TisAccordionItem {
  private readonly trigger = contentChild(TisAccordionTrigger, { descendants: true });
  protected readonly disabled = computed(() => this.trigger()?.disabled() ?? false);
  protected readonly state = computed(() => this.trigger()?.expanded() ? "open" : "closed");
}

@Directive({
  selector: "[tisAccordionPanel]",
  standalone: true,
  exportAs: "tisAccordionPanel",
  hostDirectives: [{
    directive: AccordionPanel,
    inputs: ["id"],
  }],
  host: {
    class: "ds-accordion__panel",
    "[hidden]": "!ariaPanel.visible()",
  },
})
export class TisAccordionPanel {
  readonly ariaPanel = inject(AccordionPanel);
  readonly visible = this.ariaPanel.visible;

  expand(): void {
    this.ariaPanel.expand();
  }

  collapse(): void {
    this.ariaPanel.collapse();
  }

  toggle(): void {
    this.ariaPanel.toggle();
  }
}

@Directive({
  selector: "ng-template[tisAccordionContent]",
  standalone: true,
  hostDirectives: [AccordionContent],
})
export class TisAccordionContent {}

@Directive({
  selector: "[tisAccordionTitle]",
  standalone: true,
  host: { class: "ds-accordion__title" },
})
export class TisAccordionTitle {}

@Directive({
  selector: "[tisAccordionLeadingIcon]",
  standalone: true,
  host: { class: "ds-accordion__leading-icon ds-icon", "aria-hidden": "true" },
})
export class TisAccordionLeadingIcon {}

@Directive({
  selector: "[tisAccordionChevron]",
  standalone: true,
  host: { class: "ds-accordion__chevron ds-icon", "aria-hidden": "true" },
})
export class TisAccordionChevron {}
