import { DOCUMENT } from "@angular/common";
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef,
} from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { Subscription } from "rxjs";

export type TisTooltipPlacement = "top" | "right" | "bottom" | "left";
export interface TisTooltipCloseEvent {
  reason: "api" | "escape" | "focusout" | "pointerleave" | "disabled" | "destroy";
}

@Directive({
  selector: "[tisTooltipTrigger]",
  standalone: true,
  exportAs: "tisTooltipTrigger",
  host: {
    "data-tis-angular-tooltip-trigger": "",
    "[attr.aria-describedby]": "describedBy()",
  },
})
export class TisTooltipTrigger {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly describedBy = signal<string | null>(
    this.element.nativeElement.getAttribute("aria-describedby"),
  );

  connect(id: string): void {
    const ids = (this.describedBy() ?? "").split(/\s+/).filter(Boolean);
    if (!ids.includes(id)) this.describedBy.set([...ids, id].join(" "));
  }

  disconnect(id: string): void {
    const ids = (this.describedBy() ?? "").split(/\s+/).filter((value) => value && value !== id);
    this.describedBy.set(ids.join(" ") || null);
  }
}

let nextTooltipId = 0;

@Component({
  selector: "tis-tooltip",
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-tooltip",
    "data-tis-angular-tooltip": "",
    "[class.ds-tooltip--top]": "placement() === 'top'",
    "[class.ds-tooltip--right]": "placement() === 'right'",
    "[class.ds-tooltip--bottom]": "placement() === 'bottom'",
    "[class.ds-tooltip--left]": "placement() === 'left'",
    "[attr.data-open]": "open() ? 'true' : null",
  },
  styles: `
    .tis-angular-tooltip-overlay.ds-tooltip {
      display: block;
    }

    .tis-angular-tooltip-overlay > .ds-tooltip__content {
      position: relative;
      inset: auto;
      display: block;
      margin: 0;
      transform: none;
    }

    .tis-angular-tooltip-overlay.ds-tooltip--no-arrow > .ds-tooltip__content::before {
      content: none;
    }
  `,
  template: `
    <ng-content select="[tisTooltipTrigger]" />

    <ng-template #tooltipTemplate>
      <span
        class="ds-tooltip tis-angular-tooltip-overlay"
        [class.ds-tooltip--top]="resolvedPlacement() === 'top'"
        [class.ds-tooltip--right]="resolvedPlacement() === 'right'"
        [class.ds-tooltip--bottom]="resolvedPlacement() === 'bottom'"
        [class.ds-tooltip--left]="resolvedPlacement() === 'left'"
        [class.ds-tooltip--no-arrow]="!showArrow()"
        data-open="true"
        (pointerenter)="handleContentPointerEnter()"
        (pointerleave)="handleContentPointerLeave()"
      >
        <span
          class="ds-tooltip__content"
          data-tis-angular-tooltip-content
          role="tooltip"
          [id]="tooltipId()"
        >{{ content() }}</span>
      </span>
    </ng-template>
  `,
})
export class TisTooltip {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly trigger = contentChild.required(TisTooltipTrigger);
  private readonly tooltipTemplate = viewChild.required<TemplateRef<unknown>>("tooltipTemplate");
  private overlayRef: OverlayRef | null = null;
  private overlaySubscriptions = new Subscription();
  private triggerCleanups: Array<() => void> = [];
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressUntilLeave = false;

  readonly content = input.required<string>();
  readonly placement = input<TisTooltipPlacement>("top");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showArrow = input(true, { transform: booleanAttribute });
  readonly openDelay = input(100);
  readonly closeDelay = input(100);
  readonly open = model(false);
  readonly tooltipId = input(`tis-tooltip-${++nextTooltipId}`);
  readonly resolvedPlacement = signal<TisTooltipPlacement>("top");
  readonly opened = output<void>();
  readonly closed = output<TisTooltipCloseEvent>();

  constructor() {
    effect((onCleanup) => {
      const trigger = this.trigger();
      const id = this.tooltipId();
      untracked(() => trigger.connect(id));
      this.bindTrigger(trigger.element.nativeElement);
      onCleanup(() => {
        this.unbindTrigger();
        untracked(() => trigger.disconnect(id));
      });
    });

    effect(() => {
      if (this.disabled()) {
        this.hide("disabled");
        return;
      }
      if (this.open()) this.attach();
      else this.detach();
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.unbindTrigger();
      this.detach("destroy");
      this.overlayRef?.dispose();
    });
  }

  show(): void {
    this.clearTimers();
    if (this.disabled() || this.suppressUntilLeave || this.open()) return;
    this.open.set(true);
    this.attach();
  }

  hide(reason: TisTooltipCloseEvent["reason"] = "api"): void {
    this.clearTimers();
    if (!this.open() && !this.overlayRef?.hasAttached()) return;
    this.open.set(false);
    this.detach(reason);
  }

  handleContentPointerEnter(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  handleContentPointerLeave(): void {
    this.scheduleHide("pointerleave");
  }

  private bindTrigger(element: HTMLElement): void {
    this.unbindTrigger();
    const on = <K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (event: HTMLElementEventMap[K]) => void,
    ) => {
      element.addEventListener(type, listener);
      this.triggerCleanups.push(() => element.removeEventListener(type, listener));
    };

    on("pointerenter", () => {
      this.suppressUntilLeave = false;
      this.scheduleShow();
    });
    on("pointerleave", () => {
      this.suppressUntilLeave = false;
      this.scheduleHide("pointerleave");
    });
    on("focusin", () => {
      if (!this.suppressUntilLeave) this.show();
    });
    on("focusout", () => {
      queueMicrotask(() => {
        if (element.contains(this.document.activeElement)) return;
        this.scheduleHide("focusout");
      });
    });
  }

  private unbindTrigger(): void {
    while (this.triggerCleanups.length) this.triggerCleanups.pop()?.();
  }

  private scheduleShow(): void {
    this.clearTimers();
    if (this.disabled() || this.suppressUntilLeave || this.open()) return;
    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      this.show();
    }, Math.max(0, this.openDelay()));
  }

  private scheduleHide(reason: TisTooltipCloseEvent["reason"]): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (!this.open()) return;
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (this.trigger().element.nativeElement.contains(this.document.activeElement)) return;
      if (this.overlayRef?.overlayElement.matches(":hover")) return;
      this.hide(reason);
    }, Math.max(0, this.closeDelay()));
  }

  private clearTimers(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.showTimer = null;
    this.hideTimer = null;
  }

  private attach(): void {
    if (this.disabled() || this.overlayRef?.hasAttached()) return;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.resolvedPlacement.set(this.placement());
    const positionStrategy = this.createPositionStrategy();
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      disposeOnNavigation: true,
      hasBackdrop: false,
      panelClass: "tis-angular-tooltip-pane",
    });
    this.overlaySubscriptions.unsubscribe();
    this.overlaySubscriptions = new Subscription();
    this.overlaySubscriptions.add(this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      this.suppressUntilLeave = true;
      this.hide("escape");
    }));
    this.overlaySubscriptions.add(positionStrategy.positionChanges.subscribe(({ connectionPair }) => {
      this.resolvedPlacement.set(this.placementFromPair(connectionPair));
    }));
    this.overlayRef.attach(new TemplatePortal(this.tooltipTemplate(), this.viewContainerRef));
    const overlayElement = this.overlayRef.overlayElement;
    const onPointerEnter = () => this.handleContentPointerEnter();
    const onPointerLeave = () => this.handleContentPointerLeave();
    overlayElement.addEventListener("pointerenter", onPointerEnter);
    overlayElement.addEventListener("pointerleave", onPointerLeave);
    this.overlaySubscriptions.add(() => {
      overlayElement.removeEventListener("pointerenter", onPointerEnter);
      overlayElement.removeEventListener("pointerleave", onPointerLeave);
    });
    this.opened.emit();
  }

  private detach(reason: TisTooltipCloseEvent["reason"] = "api"): void {
    if (!this.overlayRef?.hasAttached()) return;
    this.overlaySubscriptions.unsubscribe();
    this.overlayRef.detach();
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.closed.emit({ reason });
  }

  private createPositionStrategy(): FlexibleConnectedPositionStrategy {
    return this.overlay.position()
      .flexibleConnectedTo(this.trigger().element)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(this.readCssLength("--ds-space-lg"))
      .withPositions(this.positionsFor(this.placement(), this.readCssLength("--ds-space-sm")));
  }

  private readCssLength(property: string): number {
    const probe = this.document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.inlineSize = `var(${property})`;
    this.trigger().element.nativeElement.append(probe);
    const value = probe.getBoundingClientRect().width;
    probe.remove();
    return Number.isFinite(value) ? value : 0;
  }

  private positionsFor(preferred: TisTooltipPlacement, gap: number): ConnectedPosition[] {
    const all: Record<TisTooltipPlacement, ConnectedPosition> = {
      top: { originX: "center", originY: "top", overlayX: "center", overlayY: "bottom", offsetY: -gap },
      right: { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: gap },
      bottom: { originX: "center", originY: "bottom", overlayX: "center", overlayY: "top", offsetY: gap },
      left: { originX: "start", originY: "center", overlayX: "end", overlayY: "center", offsetX: -gap },
    };
    const opposite: Record<TisTooltipPlacement, TisTooltipPlacement> = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    };
    const remainder = (["top", "right", "bottom", "left"] as const)
      .filter((value) => value !== preferred && value !== opposite[preferred]);
    return [all[preferred], all[opposite[preferred]], ...remainder.map((value) => all[value])];
  }

  private placementFromPair(pair: ConnectedPosition): TisTooltipPlacement {
    if (pair.originY === "top" && pair.overlayY === "bottom") return "top";
    if (pair.originX === "end" && pair.overlayX === "start") return "right";
    if (pair.originY === "bottom" && pair.overlayY === "top") return "bottom";
    return "left";
  }
}
