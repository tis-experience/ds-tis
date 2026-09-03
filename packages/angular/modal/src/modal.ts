import { DOCUMENT } from "@angular/common";
import { FocusMonitor, FocusTrap, FocusTrapFactory } from "@angular/cdk/a11y";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
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
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from "@angular/core";
import { Subscription } from "rxjs";

export type TisModalSize = "sm" | "md" | "lg";

export interface TisModalCloseEvent {
  reason: "api" | "close-button" | "escape" | "backdrop";
}

@Directive({
  selector: "[tisModalBody]",
  standalone: true,
  host: { class: "ds-modal__body" },
})
export class TisModalBody {}

@Directive({
  selector: "[tisModalFooter]",
  standalone: true,
  host: { class: "ds-modal__footer" },
})
export class TisModalFooter {}

@Directive({
  selector: "[tisModalInitialFocus]",
  standalone: true,
  host: { "data-tis-modal-initial-focus": "" },
})
export class TisModalInitialFocus {}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let nextModalId = 0;

@Component({
  selector: "tis-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    style: "display: contents",
    "[attr.data-open]": "open() ? 'true' : null",
    "[attr.data-dialog-id]": "dialogId()",
  },
  styles: `
    .cdk-overlay-backdrop.tis-angular-modal-backdrop {
      background-color: var(--ds-modal-overlay-bg-default);
    }

    .tis-angular-modal-pane {
      box-sizing: border-box;
      max-block-size: calc(100vh - (var(--ds-modal-overlay-padding-default) * 2));
    }

    .tis-angular-modal-pane--sm {
      inline-size: min(
        calc(100vw - (var(--ds-modal-overlay-padding-default) * 2)),
        var(--ds-modal-max-width-sm)
      );
    }

    .tis-angular-modal-pane--md {
      inline-size: min(
        calc(100vw - (var(--ds-modal-overlay-padding-default) * 2)),
        var(--ds-modal-max-width-md)
      );
    }

    .tis-angular-modal-pane--lg {
      inline-size: min(
        calc(100vw - (var(--ds-modal-overlay-padding-default) * 2)),
        var(--ds-modal-max-width-lg)
      );
    }

    .tis-angular-modal-pane > .ds-modal {
      box-sizing: border-box;
      inline-size: 100%;
      max-inline-size: none;
    }
  `,
  template: `
    <ng-template #modalTemplate>
      <div
        class="ds-modal"
        [class.ds-modal--sm]="size() === 'sm'"
        [class.ds-modal--md]="size() === 'md'"
        [class.ds-modal--lg]="size() === 'lg'"
        role="dialog"
        aria-modal="true"
        [id]="dialogId()"
        [attr.aria-labelledby]="titleId()"
        [attr.aria-describedby]="description() ? descriptionId() : null"
      >
        <header class="ds-modal__header">
          <div class="ds-modal__heading">
            <h2 class="ds-modal__title" tabindex="-1" [id]="titleId()">{{ title() }}</h2>
            @if (description()) {
              <p class="ds-modal__description" [id]="descriptionId()">{{ description() }}</p>
            }
          </div>
          <button
            class="ds-modal__close"
            type="button"
            [attr.aria-label]="closeLabel()"
            (click)="close('close-button')"
          >
            <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </header>
        <ng-content select="[tisModalBody]" />
        <ng-content select="[tisModalFooter]" />
      </div>
    </ng-template>
  `,
})
export class TisModal {
  private readonly overlay = inject(Overlay);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalTemplate = viewChild.required<TemplateRef<unknown>>("modalTemplate");
  private overlayRef: OverlayRef | null = null;
  private focusTrap: FocusTrap | null = null;
  private overlaySubscriptions = new Subscription();
  private previousFocus: HTMLElement | null = null;
  private paneSize: TisModalSize | null = null;

  readonly title = input.required<string>();
  readonly description = input("");
  readonly closeLabel = input("Fechar modal");
  readonly size = input<TisModalSize>("md");
  readonly open = model(false);
  readonly opened = output<void>();
  readonly closed = output<TisModalCloseEvent>();
  readonly dialogId = input(`tis-modal-dialog-${++nextModalId}`);
  readonly titleId = input(`tis-modal-title-${nextModalId}`);
  readonly descriptionId = input(`tis-modal-description-${nextModalId}`);

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const size = this.size();
      if (isOpen) {
        this.attach();
        this.syncPaneSize(size);
      } else if (this.overlayRef?.hasAttached()) {
        this.detach(true, "api");
      }
    });

    this.destroyRef.onDestroy(() => {
      this.detach(false);
    });
  }

  close(reason: TisModalCloseEvent["reason"] = "api"): void {
    if (!this.open() && !this.overlayRef?.hasAttached()) return;
    this.detach(true, reason);
    this.open.set(false);
  }

  private attach(): void {
    if (this.overlayRef?.hasAttached()) return;

    this.previousFocus = this.document.activeElement instanceof HTMLElement
      ? this.document.activeElement
      : null;
    this.paneSize = this.size();
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      disposeOnNavigation: true,
      hasBackdrop: true,
      backdropClass: "tis-angular-modal-backdrop",
      panelClass: ["tis-angular-modal-pane", `tis-angular-modal-pane--${this.paneSize}`],
    });

    this.overlaySubscriptions.unsubscribe();
    this.overlaySubscriptions = new Subscription();
    this.overlaySubscriptions.add(this.overlayRef.backdropClick().subscribe(() => {
      this.close("backdrop");
    }));
    this.overlaySubscriptions.add(this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      this.close("escape");
    }));

    this.overlayRef.attach(new TemplatePortal(this.modalTemplate(), this.viewContainerRef));
    const dialog = this.getDialog();
    if (dialog) this.focusTrap = this.focusTrapFactory.create(dialog);
    this.opened.emit();
    queueMicrotask(() => this.focusInitialElement());
  }

  private detach(returnFocus: boolean, reason: TisModalCloseEvent["reason"] = "api"): void {
    const overlayRef = this.overlayRef;
    if (!overlayRef) return;

    const returnTarget = this.previousFocus?.isConnected ? this.previousFocus : null;
    this.overlaySubscriptions.unsubscribe();
    this.focusTrap?.destroy();
    this.focusTrap = null;
    if (overlayRef.hasAttached()) overlayRef.detach();
    overlayRef.dispose();
    this.overlayRef = null;
    this.previousFocus = null;
    this.paneSize = null;

    if (returnFocus && returnTarget) this.focusMonitor.focusVia(returnTarget, "program");
    if (returnFocus) this.closed.emit({ reason });
  }

  private focusInitialElement(): void {
    const dialog = this.getDialog();
    if (!dialog || !this.overlayRef?.hasAttached()) return;

    const marker = dialog.querySelector<HTMLElement>("[data-tis-modal-initial-focus]");
    const markedTarget = marker?.matches(FOCUSABLE_SELECTOR)
      ? marker
      : marker?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    const initial = markedTarget
      ?? dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      ?? dialog.querySelector<HTMLElement>(".ds-modal__title");
    if (initial) this.focusMonitor.focusVia(initial, "program");
  }

  private getDialog(): HTMLElement | null {
    return this.overlayRef?.overlayElement.querySelector<HTMLElement>(".ds-modal") ?? null;
  }

  private syncPaneSize(size: TisModalSize): void {
    if (!this.overlayRef || this.paneSize === size) return;
    if (this.paneSize) this.overlayRef.removePanelClass(`tis-angular-modal-pane--${this.paneSize}`);
    this.overlayRef.addPanelClass(`tis-angular-modal-pane--${size}`);
    this.paneSize = size;
  }
}
