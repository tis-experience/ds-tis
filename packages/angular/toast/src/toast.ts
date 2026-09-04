import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injectable,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject } from "rxjs";

export type TisToastType = "error" | "info" | "success" | "warning";
export type TisToastStyle = "solid" | "subtle";
export type TisToastDismissReason =
  | "api"
  | "close"
  | "escape"
  | "overflow"
  | "replace"
  | "timeout";

export interface TisToastAction {
  label: string;
  onAction?: (event: TisToastActionEvent) => void;
}

export interface TisToastOptions {
  title: string;
  description?: string;
  type?: TisToastType;
  style?: TisToastStyle;
  id?: string;
  duration?: number | null;
  actions?: readonly TisToastAction[];
  actionLabel?: string;
  onAction?: (event: TisToastActionEvent) => void;
  dismissLabel?: string;
}

export interface TisToast {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly type: TisToastType;
  readonly style: TisToastStyle;
  readonly actions: readonly TisToastAction[];
  readonly dismissLabel: string;
}

export interface TisToastShowEvent {
  readonly id: string;
  readonly toast: TisToast;
}

export interface TisToastDismissEvent {
  readonly id: string;
  readonly reason: TisToastDismissReason;
  readonly toast: TisToast;
}

export interface TisToastActionEvent {
  readonly id: string;
  readonly actionIndex: number;
  readonly label: string;
  readonly toast: TisToast;
}

interface ToastTimer {
  remaining: number | null;
  startedAt: number | null;
  timer: ReturnType<typeof setTimeout> | null;
}

const DEFAULT_DURATION = 5000;
const MIN_ACTION_DURATION = 10000;
const DEFAULT_LIMIT = 5;
let nextToastId = 0;

@Injectable({ providedIn: "root" })
export class TisToastService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeToasts = signal<readonly TisToast[]>([]);
  private readonly timers = new Map<string, ToastTimer>();
  private readonly shownSubject = new Subject<TisToastShowEvent>();
  private readonly dismissedSubject = new Subject<TisToastDismissEvent>();
  private readonly actionedSubject = new Subject<TisToastActionEvent>();
  private limit = DEFAULT_LIMIT;

  readonly toasts = this.activeToasts.asReadonly();
  readonly shown = this.shownSubject.asObservable();
  readonly dismissed = this.dismissedSubject.asObservable();
  readonly actioned = this.actionedSubject.asObservable();

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const timer of this.timers.values()) this.clearTimer(timer);
      this.timers.clear();
      this.shownSubject.complete();
      this.dismissedSubject.complete();
      this.actionedSubject.complete();
    });
  }

  show(options: TisToastOptions): string {
    const title = String(options.title ?? "").trim();
    if (!title) throw new Error("TisToastService.show requires options.title");

    const id = options.id == null ? `tis-toast-${++nextToastId}` : String(options.id);
    if (this.find(id)) this.dismiss(id, "replace");

    const actions = this.normalizeActions(options);
    const toast: TisToast = {
      id,
      title,
      description: options.description == null || options.description === ""
        ? null
        : String(options.description),
      type: this.normalizeType(options.type),
      style: options.style === "solid" ? "solid" : "subtle",
      actions,
      dismissLabel: options.dismissLabel == null ? "Dispensar" : String(options.dismissLabel),
    };

    this.activeToasts.update((current) => [toast, ...current]);
    this.timers.set(id, {
      remaining: this.normalizeDuration(options.duration, actions.length > 0),
      startedAt: null,
      timer: null,
    });
    this.schedule(id);
    this.enforceLimit();
    this.shownSubject.next({ id, toast });
    return id;
  }

  dismiss(id: string, reason: TisToastDismissReason = "api"): boolean {
    const toast = this.find(id);
    if (!toast) return false;
    const timer = this.timers.get(id);
    if (timer) this.clearTimer(timer);
    this.timers.delete(id);
    this.activeToasts.update((current) => current.filter((item) => item.id !== id));
    this.dismissedSubject.next({ id, reason, toast });
    return true;
  }

  clear(reason: TisToastDismissReason = "api"): void {
    for (const toast of [...this.activeToasts()]) this.dismiss(toast.id, reason);
  }

  action(id: string, actionIndex: number): boolean {
    const toast = this.find(id);
    const action = toast?.actions[actionIndex];
    if (!toast || !action) return false;
    const event: TisToastActionEvent = { id, actionIndex, label: action.label, toast };
    this.actionedSubject.next(event);
    action.onAction?.(event);
    return true;
  }

  pause(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining == null || timer.timer == null) return;
    if (timer.startedAt != null) {
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    }
    this.clearTimer(timer);
  }

  resume(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining == null || timer.timer != null) return;
    this.schedule(id);
  }

  setLimit(value: number): void {
    this.limit = Math.max(1, Math.floor(Number.isFinite(value) ? value : DEFAULT_LIMIT));
    this.enforceLimit();
  }

  private find(id: string): TisToast | undefined {
    return this.activeToasts().find((toast) => toast.id === id);
  }

  private normalizeActions(options: TisToastOptions): readonly TisToastAction[] {
    if (Array.isArray(options.actions)) {
      return options.actions
        .filter((action) => action != null && String(action.label ?? "").trim() !== "")
        .slice(0, 2)
        .map((action) => ({ ...action, label: String(action.label) }));
    }
    if (options.actionLabel == null || String(options.actionLabel).trim() === "") return [];
    return [{ label: String(options.actionLabel), onAction: options.onAction }];
  }

  private normalizeType(value: TisToastType | undefined): TisToastType {
    return value === "error" || value === "success" || value === "warning" ? value : "info";
  }

  private normalizeDuration(value: number | null | undefined, hasAction: boolean): number | null {
    if (value == null) return hasAction ? null : DEFAULT_DURATION;
    const duration = Number(value);
    if (!Number.isFinite(duration) || duration <= 0) return null;
    return hasAction ? Math.max(duration, MIN_ACTION_DURATION) : duration;
  }

  private schedule(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining == null || timer.remaining <= 0) return;
    timer.startedAt = Date.now();
    timer.timer = setTimeout(() => {
      timer.timer = null;
      timer.startedAt = null;
      this.dismiss(id, "timeout");
    }, timer.remaining);
  }

  private clearTimer(timer: ToastTimer): void {
    if (timer.timer != null) clearTimeout(timer.timer);
    timer.timer = null;
    timer.startedAt = null;
  }

  private enforceLimit(): void {
    while (this.activeToasts().length > this.limit) {
      const oldest = this.activeToasts().at(-1);
      if (!oldest) return;
      this.dismiss(oldest.id, "overflow");
    }
  }
}

@Component({
  selector: "tis-toast-item",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-toast",
    "data-tis-angular-toast": "",
    "[attr.data-toast-id]": "toast().id",
    "[attr.data-type]": "toast().type",
    "[attr.data-style]": "toast().style",
    "[class.ds-toast--error]": "toast().type === 'error'",
    "[class.ds-toast--info]": "toast().type === 'info'",
    "[class.ds-toast--success]": "toast().type === 'success'",
    "[class.ds-toast--warning]": "toast().type === 'warning'",
    "[class.ds-toast--solid]": "toast().style === 'solid'",
    "[class.ds-toast--subtle]": "toast().style === 'subtle'",
    "(pointerenter)": "pause()",
    "(pointerleave)": "resume()",
    "(focusin)": "pause()",
    "(focusout)": "handleFocusOut($event)",
    "(keydown.escape)": "handleEscape($event)",
  },
  template: `
    <span class="ds-toast__icon" aria-hidden="true">
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        @switch (toast().type) {
          @case ("success") {
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 3 3 5-6" />
          }
          @case ("warning") {
            <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          }
          @case ("error") {
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          }
          @default {
            <circle cx="12" cy="12" r="10" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          }
        }
      </svg>
    </span>

    <div class="ds-toast__content">
      <p class="ds-toast__title">{{ toast().title }}</p>
      @if (toast().description) {
        <p class="ds-toast__description">{{ toast().description }}</p>
      }
      @if (toast().actions.length) {
        <div class="ds-toast__actions">
          @for (action of toast().actions; track $index) {
            <button
              class="ds-button ds-button--ghost ds-button--sm"
              type="button"
              (click)="activate($index)"
            ><span class="ds-button__label">{{ action.label }}</span></button>
          }
        </div>
      }
    </div>

    <button
      class="ds-toast__close"
      type="button"
      [attr.aria-label]="toast().dismissLabel"
      (click)="dismiss()"
    >
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  `,
})
export class TisToastItem {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly service = inject(TisToastService);

  readonly toast = input.required<TisToast>();

  activate(index: number): void {
    this.service.action(this.toast().id, index);
  }

  dismiss(): void {
    this.service.dismiss(this.toast().id, "close");
  }

  pause(): void {
    this.service.pause(this.toast().id);
  }

  resume(): void {
    this.service.resume(this.toast().id);
  }

  handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.host.nativeElement.contains(next)) this.resume();
  }

  handleEscape(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.service.dismiss(this.toast().id, "escape");
  }
}

@Component({
  selector: "tis-toast-region",
  standalone: true,
  imports: [TisToastItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: "tisToastRegion",
  host: {
    class: "ds-toast-region",
    "data-tis-angular-toast-region": "",
  },
  template: `
    <div class="ds-toast-region__polite" role="status" aria-live="polite" aria-relevant="additions">
      @for (toast of politeToasts(); track toast.id) {
        <tis-toast-item [toast]="toast" />
      }
    </div>
    <div class="ds-toast-region__assertive" role="alert" aria-live="assertive" aria-relevant="additions">
      @for (toast of assertiveToasts(); track toast.id) {
        <tis-toast-item [toast]="toast" />
      }
    </div>
  `,
})
export class TisToastRegion {
  readonly service = inject(TisToastService);
  readonly limit = input(DEFAULT_LIMIT, { transform: numberAttribute });
  readonly politeToasts = computed(() => this.service.toasts().filter((toast) => toast.type !== "error"));
  readonly assertiveToasts = computed(() => this.service.toasts().filter((toast) => toast.type === "error"));
  readonly shown = output<TisToastShowEvent>();
  readonly dismissed = output<TisToastDismissEvent>();
  readonly actioned = output<TisToastActionEvent>();

  constructor() {
    effect(() => this.service.setLimit(this.limit()));
    this.service.shown.pipe(takeUntilDestroyed()).subscribe((event) => this.shown.emit(event));
    this.service.dismissed.pipe(takeUntilDestroyed()).subscribe((event) => this.dismissed.emit(event));
    this.service.actioned.pipe(takeUntilDestroyed()).subscribe((event) => this.actioned.emit(event));
  }

  show(options: TisToastOptions): string {
    return this.service.show(options);
  }

  dismiss(id: string, reason: TisToastDismissReason = "api"): boolean {
    return this.service.dismiss(id, reason);
  }

  clear(): void {
    this.service.clear();
  }
}
