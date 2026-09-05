import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, input, signal } from "@angular/core";

export type TisAvatarSize = "sm" | "md" | "lg";
export type TisAvatarContent = "image" | "initials" | "icon";

@Component({
  selector: "tis-avatar",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "ds-avatar",
    "data-tis-angular-avatar": "",
    "[attr.data-size]": "size()",
    "[attr.data-content]": "resolvedContent()",
    "[attr.role]": "decorative() ? null : 'img'",
    "[attr.aria-label]": "decorative() ? null : label()",
    "[attr.aria-hidden]": "decorative() ? 'true' : null",
    "[class.ds-avatar--sm]": "size() === 'sm'",
    "[class.ds-avatar--lg]": "size() === 'lg'",
    "[class.ds-avatar--icon]": "resolvedContent() === 'icon'",
  },
  template: `
    @if (resolvedContent() === 'image') {
      @for (imageSource of [src()]; track imageSource) {
        <img [src]="imageSource" alt="" aria-hidden="true" (error)="handleImageError(imageSource)">
      }
    } @else if (resolvedContent() === 'initials') {
      <span aria-hidden="true">{{ initials() }}</span>
    } @else {
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    }
  `,
})
export class TisAvatar {
  readonly label = input.required<string>();
  readonly content = input<TisAvatarContent>("initials");
  readonly initials = input("");
  readonly src = input<string | null>(null);
  readonly size = input<TisAvatarSize>("md");
  readonly decorative = input(false, { transform: booleanAttribute });
  private readonly failedSource = signal<string | null>(null);

  readonly resolvedContent = computed<TisAvatarContent>(() => {
    if (this.content() === "icon") return "icon";
    if (this.content() === "image" && this.src() && this.src() !== this.failedSource()) return "image";
    return this.initials().trim() ? "initials" : "icon";
  });

  constructor() {
    effect(() => { this.src(); this.failedSource.set(null); });
  }

  protected handleImageError(source: string | null): void {
    if (source === this.src()) this.failedSource.set(source);
  }
}
