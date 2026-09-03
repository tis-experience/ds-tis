import { DOCUMENT } from "@angular/common";
import { Menu, MenuItem, MenuTrigger } from "@angular/aria/menu";
import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
} from "@angular/core";

export type TisMenuAlign = "start" | "end";
export type TisMenuSize = "sm" | "md" | "lg";
export type TisMenuItemValue = string | number;

@Directive({
  selector: "[tisActionMenu]",
  standalone: true,
  exportAs: "tisActionMenu",
  host: {
    class: "ds-action-menu",
    "data-tis-angular-action-menu": "",
    "[class.ds-action-menu--start]": "align() === 'start'",
  },
})
export class TisActionMenu {
  readonly align = input<TisMenuAlign>("end");
}

@Directive({
  selector: "button[tisMenuTrigger]",
  standalone: true,
  exportAs: "tisMenuTrigger",
  hostDirectives: [{
    directive: MenuTrigger,
    inputs: ["menu", "disabled", "softDisabled"],
  }],
  host: {
    class: "ds-button ds-action-menu__trigger",
    type: "button",
    "data-tis-angular-menu-trigger": "",
    "[class.ds-button--sm]": "size() === 'sm'",
    "[class.ds-button--md]": "size() === 'md'",
    "[class.ds-button--lg]": "size() === 'lg'",
    "[class.ds-button--brand]": "variant() === 'brand'",
    "[class.ds-button--danger]": "variant() === 'danger'",
    "[class.ds-button--ghost]": "variant() === 'ghost'",
    "[class.ds-button--outline]": "variant() === 'outline'",
    "[class.ds-button--secondary]": "variant() === 'secondary'",
    "(click)": "focusFirstItemAfterOpen()",
  },
})
export class TisMenuTrigger {
  private readonly ariaTrigger = inject(MenuTrigger<TisMenuItemValue>);
  private readonly document = inject(DOCUMENT);

  readonly size = input<TisMenuSize>("md");
  readonly variant = input<"brand" | "danger" | "ghost" | "outline" | "secondary">("outline");
  readonly expanded = this.ariaTrigger.expanded;
  readonly disabled = this.ariaTrigger.disabled;

  open(): void {
    this.ariaTrigger.open();
  }

  close(): void {
    this.ariaTrigger.close();
  }

  focusFirstItemAfterOpen(): void {
    const view = this.document.defaultView;
    if (!view) return;
    view.requestAnimationFrame(() => view.requestAnimationFrame(() => {
      const item = this.ariaTrigger.menu()?.element.querySelector<HTMLElement>("[tabindex='0']");
      if (this.expanded()) item?.focus();
    }));
  }
}

@Directive({
  selector: "[tisMenu]",
  standalone: true,
  exportAs: "tisMenu",
  hostDirectives: [{
    directive: Menu,
    inputs: ["id", "wrap", "typeaheadDelay", "disabled"],
    outputs: ["itemSelected"],
  }],
  host: {
    class: "ds-menu ds-action-menu__content",
    "data-tis-angular-menu": "",
    "[attr.hidden]": "visible() ? null : ''",
    "[attr.data-open]": "visible() ? 'true' : null",
    "[style.display]": "visible() ? null : 'none'",
    "[style.min-inline-size]": "'min(var(--ds-size-layout-xs), calc(100vw - (var(--ds-space-md) * 2)))'",
    "[style.max-inline-size]": "'calc(100vw - (var(--ds-space-md) * 2))'",
    "[class.ds-menu--sm]": "size() === 'sm'",
    "[class.ds-menu--lg]": "size() === 'lg'",
    "[class.ds-menu--full]": "fullWidth()",
  },
})
export class TisMenu {
  private readonly ariaMenu = inject(Menu<TisMenuItemValue>);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  /** Primitive Angular Aria usado para conectar o trigger ao menu. */
  readonly primitive = this.ariaMenu;
  readonly size = input<TisMenuSize>("md");
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly visible = this.ariaMenu.visible;

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.element.nativeElement.style.translate = "";
        return;
      }
      const view = this.document.defaultView;
      if (!view) return;
      view.requestAnimationFrame(() => view.requestAnimationFrame(() => {
        this.keepInsideViewport();
        const activeItem = this.element.nativeElement.querySelector<HTMLElement>("[tabindex='0']");
        activeItem?.focus();
      }));
    });
  }

  close(): void {
    this.ariaMenu.close();
  }

  private keepInsideViewport(): void {
    const element = this.element.nativeElement;
    const view = this.document.defaultView;
    if (!view) return;

    element.style.translate = "";
    const rect = element.getBoundingClientRect();
    const margin = this.readCssLength("--ds-space-md");
    const viewportWidth = this.document.documentElement.clientWidth;
    let offset = 0;
    if (rect.left < margin) offset = margin - rect.left;
    if (rect.right + offset > viewportWidth - margin) {
      offset -= rect.right + offset - (viewportWidth - margin);
    }
    if (offset) element.style.translate = `${offset}px`;
  }

  private readCssLength(property: string): number {
    const probe = this.document.createElement("span");
    probe.style.position = "fixed";
    probe.style.visibility = "hidden";
    probe.style.inlineSize = `var(${property})`;
    this.document.body.append(probe);
    const value = probe.getBoundingClientRect().width;
    probe.remove();
    return Number.isFinite(value) ? value : 0;
  }
}

@Directive({
  selector: "button[tisMenuItem]",
  standalone: true,
  exportAs: "tisMenuItem",
  hostDirectives: [{
    directive: MenuItem,
    inputs: ["id", "value", "disabled", "searchTerm", "submenu"],
  }],
  host: {
    class: "ds-menu__item",
    type: "button",
    "data-tis-angular-menu-item": "",
    "[class.ds-menu__item--destructive]": "destructive()",
  },
})
export class TisMenuItem {
  private readonly ariaItem = inject(MenuItem<TisMenuItemValue>);

  readonly destructive = input(false, { transform: booleanAttribute });
  readonly active = this.ariaItem.active;
  readonly disabled = this.ariaItem.disabled;
}

@Directive({
  selector: "button[tisMenuCheckboxItem]",
  standalone: true,
  exportAs: "tisMenuCheckboxItem",
  hostDirectives: [{
    directive: MenuItem,
    inputs: ["id", "value", "disabled", "searchTerm", "submenu"],
  }],
  host: {
    class: "ds-menu__item",
    type: "button",
    role: "menuitemcheckbox",
    "data-tis-angular-menu-checkbox-item": "",
    "[attr.aria-checked]": "checked()",
    "[class.ds-menu__item--destructive]": "destructive()",
    "(click)": "toggle()",
  },
})
export class TisMenuCheckboxItem {
  private readonly ariaItem = inject(MenuItem<TisMenuItemValue>);

  readonly checked = model(false);
  readonly destructive = input(false, { transform: booleanAttribute });
  readonly checkedChangeByUser = output<boolean>();
  readonly disabled = this.ariaItem.disabled;

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.checkedChangeByUser.emit(next);
  }
}

@Directive({
  selector: "[tisMenuRadioGroup]",
  standalone: true,
  exportAs: "tisMenuRadioGroup",
  host: {
    class: "ds-menu__group",
    role: "group",
    "data-tis-angular-menu-radio-group": "",
  },
})
export class TisMenuRadioGroup {
  readonly value = model<TisMenuItemValue | null>(null);

  select(value: TisMenuItemValue): void {
    this.value.set(value);
  }
}

@Directive({
  selector: "button[tisMenuRadioItem]",
  standalone: true,
  exportAs: "tisMenuRadioItem",
  hostDirectives: [{
    directive: MenuItem,
    inputs: ["id", "value", "disabled", "searchTerm", "submenu"],
  }],
  host: {
    class: "ds-menu__item",
    type: "button",
    role: "menuitemradio",
    "data-tis-angular-menu-radio-item": "",
    "[attr.aria-checked]": "checked()",
    "[class.ds-menu__item--destructive]": "destructive()",
    "(click)": "select()",
  },
})
export class TisMenuRadioItem {
  private readonly ariaItem = inject(MenuItem<TisMenuItemValue>);
  private readonly group = inject(TisMenuRadioGroup);

  readonly destructive = input(false, { transform: booleanAttribute });
  readonly disabled = this.ariaItem.disabled;
  readonly checked = computed(() => this.group.value() === this.ariaItem.value());

  select(): void {
    if (!this.disabled()) this.group.select(this.ariaItem.value());
  }
}

@Directive({ selector: "[tisMenuItemLabel]", standalone: true, host: { class: "ds-menu__item-label" } })
export class TisMenuItemLabel {}

@Directive({ selector: "[tisMenuItemDescription]", standalone: true, host: { class: "ds-menu__item-description" } })
export class TisMenuItemDescription {}

@Directive({ selector: "[tisMenuItemIcon]", standalone: true, host: { class: "ds-menu__icon", "aria-hidden": "true" } })
export class TisMenuItemIcon {}

@Directive({ selector: "[tisMenuItemCheck]", standalone: true, host: { class: "ds-menu__check", "aria-hidden": "true" } })
export class TisMenuItemCheck {}

@Directive({ selector: "[tisMenuShortcut]", standalone: true, host: { class: "ds-menu__shortcut", "aria-hidden": "true" } })
export class TisMenuShortcut {}

@Directive({ selector: "[tisMenuSeparator]", standalone: true, host: { class: "ds-menu__separator", role: "separator" } })
export class TisMenuSeparator {}

@Directive({ selector: "[tisMenuGroup]", standalone: true, host: { class: "ds-menu__group", role: "group" } })
export class TisMenuGroup {}

@Directive({ selector: "[tisMenuGroupLabel]", standalone: true, host: { class: "ds-menu__label" } })
export class TisMenuGroupLabel {}
