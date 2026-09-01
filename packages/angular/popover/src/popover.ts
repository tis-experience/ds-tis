import { DOCUMENT } from "@angular/common";
import { FocusMonitor } from "@angular/cdk/a11y";
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
  Directive,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { Subscription } from "rxjs";

export type TisPopoverPlacement = "bottom" | "top" | "left" | "right";
export interface TisPopoverCloseEvent {
  reason: "api" | "trigger" | "close-button" | "escape" | "outside" | "another-popover" | "destroy";
}

@Directive({
  selector: "[tisPopoverContent]",
  standalone: true,
})
export class TisPopoverContent {}

@Directive({
  selector: "[tisPopoverActions]",
  standalone: true,
  host: {
    class: "tis-angular-popover-actions",
  },
})
export class TisPopoverActions {}

const FOCUSABLE_SELECTOR = [
  "[data-tis-popover-initial-focus]",
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let nextPopoverId = 0;

@Component({
  selector: "tis-popover",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "ds-popover",
    "[class.ds-popover--bottom]": "placement() === 'bottom'",
    "[class.ds-popover--top]": "placement() === 'top'",
    "[class.ds-popover--left]": "placement() === 'left'",
    "[class.ds-popover--right]": "placement() === 'right'",
    "[class.ds-popover--no-arrow]": "!showArrow()",
    "[attr.data-open]": "open() ? 'true' : null",
  },
  styles: `
    .tis-angular-popover-overlay.ds-popover {
      display: block;
    }

    .tis-angular-popover-overlay > .ds-popover__panel {
      position: relative;
      inset: auto;
      transform: none;
    }

    .tis-angular-popover-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ds-popover-actions-gap-default);
    }

    .tis-angular-popover-overlay.ds-popover--bottom::before,
    .tis-angular-popover-overlay.ds-popover--bottom::after {
      inset-block: auto calc(100% - var(--ds-popover-panel-border-width-default));
    }

    .tis-angular-popover-overlay.ds-popover--top::before,
    .tis-angular-popover-overlay.ds-popover--top::after {
      inset-block: calc(100% - var(--ds-popover-panel-border-width-default)) auto;
    }

    .tis-angular-popover-overlay.ds-popover--left::before,
    .tis-angular-popover-overlay.ds-popover--left::after {
      inset-inline: calc(100% - var(--ds-popover-panel-border-width-default)) auto;
    }

    .tis-angular-popover-overlay.ds-popover--right::before,
    .tis-angular-popover-overlay.ds-popover--right::after {
      inset-inline: auto calc(100% - var(--ds-popover-panel-border-width-default));
    }

    .tis-angular-popover-overlay:has(> .ds-popover__panel)::before,
    .tis-angular-popover-overlay:has(> .ds-popover__panel)::after {
      content: "";
    }

    .tis-angular-popover-overlay.ds-popover.ds-popover--no-arrow::before,
    .tis-angular-popover-overlay.ds-popover.ds-popover--no-arrow::after {
      content: none;
    }
  `,
  template: `
    <button
      #trigger
      data-tis-angular-popover-trigger
      class="ds-button ds-button--outline ds-button--sm ds-popover__trigger"
      type="button"
      [disabled]="disabled()"
      [attr.aria-controls]="panelId()"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
    >
      <ng-content select="[tisPopoverTriggerIcon]" />
      <span class="ds-button__label">{{ triggerLabel() }}</span>
    </button>

    <ng-template #panelTemplate>
      <div
        class="ds-popover tis-angular-popover-overlay"
        [class.ds-popover--bottom]="resolvedPlacement() === 'bottom'"
        [class.ds-popover--top]="resolvedPlacement() === 'top'"
        [class.ds-popover--left]="resolvedPlacement() === 'left'"
        [class.ds-popover--right]="resolvedPlacement() === 'right'"
        [class.ds-popover--no-arrow]="!showArrow()"
        data-open="true"
      >
        <div
          class="ds-popover__panel"
          role="dialog"
          tabindex="-1"
          [id]="panelId()"
          [attr.aria-labelledby]="titleId()"
        >
          <div class="ds-popover__header">
            <h3 class="ds-popover__title" [id]="titleId()">{{ title() }}</h3>
          </div>
          <button
            class="ds-popover__close"
            type="button"
            [attr.aria-label]="closeLabel()"
            (click)="close('close-button')"
          >
            <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <div class="ds-popover__body">
            <div class="ds-popover__content">
              <ng-content select="[tisPopoverContent]" />
            </div>
          </div>
          <div class="ds-popover__actions">
            <ng-content select="[tisPopoverActions]" />
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class TisPopover {
  private static readonly openInstances = new Set<TisPopover>();

  private readonly overlay = inject(Overlay);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>("panelTemplate");
  private overlayRef: OverlayRef | null = null;
  private overlaySubscriptions = new Subscription();
  private previousFocus: HTMLElement | null = null;

  readonly title = input.required<string>();
  readonly triggerLabel = input("Abrir popover");
  readonly closeLabel = input("Fechar popover");
  readonly placement = input<TisPopoverPlacement>("bottom");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showArrow = input(true, { transform: booleanAttribute });
  readonly open = model(false);
  readonly opened = output<void>();
  readonly closed = output<TisPopoverCloseEvent>();
  readonly panelId = input(`tis-popover-panel-${++nextPopoverId}`);
  readonly titleId = input(`tis-popover-title-${nextPopoverId}`);
  readonly resolvedPlacement = signal<TisPopoverPlacement>("bottom");

  constructor() {
    effect(() => {
      if (this.open()) this.attach();
      else this.detach(false);
    });
    this.destroyRef.onDestroy(() => {
      this.detach(false, "destroy");
      this.overlayRef?.dispose();
      this.focusMonitor.stopMonitoring(this.trigger().nativeElement);
      TisPopover.openInstances.delete(this);
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.open()) this.close("trigger");
    else this.open.set(true);
  }

  close(reason: TisPopoverCloseEvent["reason"] = "api"): void {
    if (!this.open() && !this.overlayRef?.hasAttached()) return;
    this.detach(true, reason);
    this.open.set(false);
  }

  private attach(): void {
    if (this.disabled() || this.overlayRef?.hasAttached()) return;
    for (const instance of TisPopover.openInstances) {
      if (instance !== this) instance.close("another-popover");
    }
    TisPopover.openInstances.add(this);
    this.previousFocus = this.document.activeElement instanceof HTMLElement
      ? this.document.activeElement
      : this.trigger().nativeElement;

    const positionStrategy = this.createPositionStrategy();
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      disposeOnNavigation: true,
      hasBackdrop: false,
      panelClass: "tis-angular-popover-pane",
    });
    this.overlaySubscriptions.unsubscribe();
    this.overlaySubscriptions = new Subscription();
    this.overlaySubscriptions.add(this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close("escape");
      }
    }));
    this.overlaySubscriptions.add(this.overlayRef.outsidePointerEvents().subscribe((event) => {
      if (this.trigger().nativeElement.contains(event.target as Node)) return;
      this.close("outside");
    }));
    this.overlaySubscriptions.add(positionStrategy.positionChanges.subscribe(({ connectionPair }) => {
      this.resolvedPlacement.set(this.placementFromPair(connectionPair));
    }));
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.opened.emit();
    queueMicrotask(() => this.focusInitialElement());
  }

  private detach(returnFocus: boolean, reason: TisPopoverCloseEvent["reason"] = "api"): void {
    if (!this.overlayRef?.hasAttached()) return;
    this.overlaySubscriptions.unsubscribe();
    this.overlayRef.detach();
    TisPopover.openInstances.delete(this);
    if (returnFocus) {
      const target = this.previousFocus?.isConnected ? this.previousFocus : this.trigger().nativeElement;
      this.focusMonitor.focusVia(target, "program");
      this.closed.emit({ reason });
    }
    this.previousFocus = null;
  }

  private focusInitialElement(): void {
    const panel = this.overlayRef?.overlayElement.querySelector<HTMLElement>(".ds-popover__panel");
    if (!panel) return;
    const initial = panel.querySelector<HTMLElement>("[data-tis-popover-initial-focus]")
      ?? panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ?? panel;
    this.focusMonitor.focusVia(initial, "program");
  }

  private createPositionStrategy(): FlexibleConnectedPositionStrategy {
    const arrowGap = this.showArrow() ? this.readArrowGap() : 0;
    const positions = this.positionsFor(this.placement(), arrowGap);
    return this.overlay.position()
      .flexibleConnectedTo(this.trigger())
      .withFlexibleDimensions(true)
      .withPush(true)
      .withViewportMargin(this.readViewportMargin())
      .withPositions(positions);
  }

  private readArrowGap(): number {
    return this.readCssLength("--ds-popover-arrow-base-default") / 2;
  }

  private readViewportMargin(): number {
    return this.readCssLength("--ds-popover-panel-padding-x-default") / 2;
  }

  private readCssLength(property: string): number {
    const probe = this.document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.inlineSize = `var(${property})`;
    this.trigger().nativeElement.append(probe);
    const value = probe.getBoundingClientRect().width;
    probe.remove();
    return Number.isFinite(value) ? value : 0;
  }

  private positionsFor(preferred: TisPopoverPlacement, gap: number): ConnectedPosition[] {
    const all: Record<TisPopoverPlacement, ConnectedPosition> = {
      bottom: { originX: "center", originY: "bottom", overlayX: "center", overlayY: "top", offsetY: gap },
      top: { originX: "center", originY: "top", overlayX: "center", overlayY: "bottom", offsetY: -gap },
      left: { originX: "start", originY: "center", overlayX: "end", overlayY: "center", offsetX: -gap },
      right: { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: gap },
    };
    const opposite: Record<TisPopoverPlacement, TisPopoverPlacement> = {
      bottom: "top",
      top: "bottom",
      left: "right",
      right: "left",
    };
    const remainder = (["bottom", "top", "left", "right"] as const)
      .filter((value) => value !== preferred && value !== opposite[preferred]);
    return [all[preferred], all[opposite[preferred]], ...remainder.map((value) => all[value])];
  }

  private placementFromPair(pair: ConnectedPosition): TisPopoverPlacement {
    if (pair.originY === "bottom" && pair.overlayY === "top") return "bottom";
    if (pair.originY === "top" && pair.overlayY === "bottom") return "top";
    if (pair.originX === "start" && pair.overlayX === "end") return "left";
    return "right";
  }
}
