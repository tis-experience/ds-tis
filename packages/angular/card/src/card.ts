import {
  Directive,
  input,
} from "@angular/core";

export type TisCardVariant = "default" | "elevated" | "interactive" | "outlined";

@Directive({
  selector: "[tisCard]",
  standalone: true,
  host: {
    class: "ds-card",
    "data-tis-angular-card": "",
    "[attr.data-variant]": "variant()",
    "[attr.data-selected]": "selected() || null",
    "[attr.aria-pressed]": "variant() === 'interactive' ? selected() : null",
    "[class.ds-card--default]": "variant() === 'default'",
    "[class.ds-card--elevated]": "variant() === 'elevated'",
    "[class.ds-card--interactive]": "variant() === 'interactive'",
    "[class.ds-card--outlined]": "variant() === 'outlined'",
    "[class.ds-card--selected]": "selected()",
  },
})
export class TisCard {
  readonly variant = input<TisCardVariant>("default");
  readonly selected = input(false);
}

@Directive({
  selector: "[tisCardMedia]",
  standalone: true,
  host: { class: "ds-card__media" },
})
export class TisCardMedia {}

@Directive({
  selector: "[tisCardContainer]",
  standalone: true,
  host: { class: "ds-card__container" },
})
export class TisCardContainer {}

@Directive({
  selector: "[tisCardHeader]",
  standalone: true,
  host: { class: "ds-card__header" },
})
export class TisCardHeader {}

@Directive({
  selector: "[tisCardTitle]",
  standalone: true,
  host: { class: "ds-card__title" },
})
export class TisCardTitle {}

@Directive({
  selector: "[tisCardDescription]",
  standalone: true,
  host: { class: "ds-card__description" },
})
export class TisCardDescription {}

@Directive({
  selector: "[tisCardContent]",
  standalone: true,
  host: { class: "ds-card__body" },
})
export class TisCardContent {}

@Directive({
  selector: "[tisCardFooter]",
  standalone: true,
  host: { class: "ds-card__footer" },
})
export class TisCardFooter {}
