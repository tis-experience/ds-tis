# @tis/angular

Biblioteca Angular nativa do DS TIS. O pacote reutiliza as classes, anatomia e
tokens públicos do DS; não inclui nem duplica o CSS global.

```css
@import "ds-tis/css";
```

Use entrypoints independentes:

```ts
import { TisAccordion, TisAccordionItem } from "@tis/angular/accordion";
import { TisButton } from "@tis/angular/button";
import { TisCheckbox } from "@tis/angular/checkbox";
import { TisCombobox, TisComboboxIcon } from "@tis/angular/combobox";
import { TisInput } from "@tis/angular/input";
import { TisActionMenu, TisMenu, TisMenuItem, TisMenuTrigger } from "@tis/angular/menu";
import { TisModal, TisModalBody, TisModalFooter } from "@tis/angular/modal";
import { TisPopover } from "@tis/angular/popover";
import { TisRadioGroup, TisRadioOption } from "@tis/angular/radio";
import { TisSelect, TisSelectIcon } from "@tis/angular/select";
import { TisTab, TisTabList, TisTabPanel, TisTabs } from "@tis/angular/tabs";
import { TisTextarea } from "@tis/angular/textarea";
import { TisToggle } from "@tis/angular/toggle";
import { TisTooltip, TisTooltipTrigger } from "@tis/angular/tooltip";
```

Os componentes são standalone e usam Angular 21, Angular Forms, Angular Aria/CDK
21 e RxJS 7 como peer dependencies. O pacote permanece privado enquanto a saída
estiver em beta e não foi publicado.
