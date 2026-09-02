# @tis/angular

Biblioteca Angular nativa do DS TIS. O pacote reutiliza as classes, anatomia e
tokens públicos do DS; não inclui nem duplica o CSS global.

```css
@import "ds-tis/css";
```

Use entrypoints independentes:

```ts
import { TisButton } from "@tis/angular/button";
import { TisAccordion, TisAccordionItem } from "@tis/angular/accordion";
import { TisPopover } from "@tis/angular/popover";
```

Os pilotos são standalone e usam Angular 21, Angular Aria/CDK 21 e RxJS 7 como
peer dependencies. O pacote permanece privado enquanto a saída estiver em beta e
não foi publicado.
