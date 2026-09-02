import { getComponent } from './component-source.mjs';
import { getReactComponents } from './react-component-catalog.mjs';

export type DocumentationTechnology = 'web' | 'ark' | 'react' | 'angular';
export type DocumentationLocale = 'pt-br' | 'en';
export type DocumentationSlug = 'accordion' | 'button' | 'checkbox' | 'combobox' | 'menu' | 'modal' | 'popover' | 'radio' | 'select' | 'tabs' | 'toast' | 'toggle' | 'tooltip';

interface LocalizedText {
  pt: string;
  en: string;
}

interface ComponentDocumentationConfig {
  description: LocalizedText;
  descriptions?: Partial<Record<DocumentationTechnology, LocalizedText>>;
  examples?: Partial<Record<DocumentationTechnology, Array<{
    description: LocalizedText;
    size?: 'compact' | 'medium' | 'large';
    storyId: string;
    title: LocalizedText;
  }>>>;
  previewSize?: 'compact' | 'medium' | 'large';
  usageGuidance?: {
    avoidWhen: LocalizedText[];
    note?: LocalizedText;
    useWhen: LocalizedText[];
  };
  ark?: {
    adapterImport: string;
  };
  angular?: {
    imports: string;
    markup: string;
    primitive: string;
  };
  web: {
    imports: string;
    markup: string;
    storyId: string;
  };
}

const configs: Record<DocumentationSlug, ComponentDocumentationConfig> = {
  accordion: {
    description: {
      pt: 'Organiza conteúdo relacionado em seções que podem ser expandidas ou recolhidas.',
      en: 'Organizes related content into sections that can be expanded or collapsed.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém estado, teclado e relações ARIA.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains state, keyboard behavior, and ARIA relationships.',
      },
      angular: {
        pt: 'Diretivas standalone que preservam o DOM público e usam Angular Aria para estado, teclado e relações ARIA.',
        en: 'Standalone directives that preserve the public DOM and use Angular Aria for state, keyboard behavior, and ARIA relationships.',
      },
    },
    ark: {
      adapterImport: `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@tis/react/ark/accordion'`,
    },
    angular: {
      primitive: '@angular/aria/accordion',
      imports: `import {
  TisAccordion,
  TisAccordionItem,
  TisAccordionPanel,
  TisAccordionTitle,
  TisAccordionTrigger,
} from '@tis/angular/accordion'`,
      markup: `<div tisAccordion [multiExpandable]="false" [softDisabled]="false">
  <div tisAccordionItem>
    <button tisAccordionTrigger [panel]="panel.ariaPanel">
      <span tisAccordionTitle>Faturamento</span>
    </button>
    <div tisAccordionPanel #panel="tisAccordionPanel">
      Consulte faturas e dados fiscais.
    </div>
  </div>
</div>`,
    },
    web: {
      storyId: 'components-accordion--playground',
      imports: `import 'ds-tis/css'
import { initAccordions } from 'ds-tis/accordion'

initAccordions()`,
      markup: `<div class="ds-accordion" data-accordion-mode="single">
  <div class="ds-accordion__item" data-state="open">
    <button
      class="ds-accordion__trigger"
      type="button"
      id="billing-trigger"
      aria-expanded="true"
      aria-controls="billing-panel"
    >
      <span class="ds-accordion__title">Faturamento</span>
    </button>
    <div
      class="ds-accordion__panel"
      id="billing-panel"
      role="region"
      aria-labelledby="billing-trigger"
    >
      Gerencie formas de pagamento e dados fiscais.
    </div>
  </div>
</div>`,
    },
  },
  button: {
    description: {
      pt: 'Dispara ações, confirma decisões e avança processos com hierarquia clara.',
      en: 'Triggers actions, confirms decisions, and advances processes with clear hierarchy.',
    },
    previewSize: 'compact',
    angular: {
      primitive: 'HTML button',
      imports: `import { TisButton } from '@tis/angular/button'`,
      markup: `<form (submit)="guardar()">
  <tis-button type="submit" variant="brand">
    Guardar alterações
  </tis-button>
</form>`,
    },
    descriptions: {
      angular: {
        pt: 'Componente standalone com button nativo, inputs tipados, signals e content projection.',
        en: 'Standalone component with a native button, typed inputs, signals, and content projection.',
      },
      ark: {
        pt: 'Adapter React independente sobre Ark Factory. O Button usa semântica e teclado nativos, por isso não requer máquina Zag.',
        en: 'An independent React adapter built on Ark Factory. Button uses native semantics and keyboard behavior, so it does not require a Zag machine.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Button TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Button classes and tokens.',
      },
    },
    ark: {
      adapterImport: `import { Button } from '@tis/react/ark/button'`,
    },
    web: {
      storyId: 'components-button--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<button class="ds-button ds-button--brand ds-button--md" type="button">
  <span class="ds-button__label">Continuar</span>
</button>`,
    },
  },
  checkbox: {
    description: {
      pt: 'Permite selecionar opções independentes e comunica seleção parcial quando necessário.',
      en: 'Selects independent options and communicates partial selection when needed.',
    },
    previewSize: 'compact',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém checked, mixed, foco e formulário.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains checked, mixed, focus, and form behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Checkbox TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Checkbox classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        {
          pt: 'Zero, uma ou várias opções independentes podem ser selecionadas.',
          en: 'Zero, one, or multiple independent options may be selected.',
        },
        {
          pt: 'Uma opção binária possui label visível e será confirmada em formulário.',
          en: 'A binary option has a visible label and will be confirmed in a form.',
        },
      ],
      avoidWhen: [
        {
          pt: 'Somente uma opção do grupo pode ser escolhida; use Radio.',
          en: 'Only one option in a group may be selected; use Radio.',
        },
        {
          pt: 'A mudança liga ou desliga uma configuração imediatamente; use Toggle.',
          en: 'The change immediately turns a setting on or off; use Toggle.',
        },
      ],
    },
    ark: {
      adapterImport: `import {
  Checkbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxIndicator,
  CheckboxLabel,
} from '@tis/react/ark/checkbox'`,
    },
    web: {
      storyId: 'components-form-checkbox--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<label class="ds-checkbox-label">
  <input class="ds-checkbox" type="checkbox" name="notifications" value="enabled" />
  <span class="ds-checkbox__content">
    <span class="ds-checkbox__label">Receber novidades</span>
  </span>
</label>`,
    },
  },
  radio: {
    description: {
      pt: 'Permite selecionar exatamente uma opção entre alternativas visíveis e relacionadas.',
      en: 'Selects exactly one option among visible, related alternatives.',
    },
    previewSize: 'compact',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém seleção exclusiva, roving focus, teclado e formulário.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains exclusive selection, roving focus, keyboard, and form behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Radio TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Radio classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        {
          pt: 'Exatamente uma opção deve ser escolhida entre duas a sete alternativas visíveis.',
          en: 'Exactly one option must be selected among two to seven visible alternatives.',
        },
        {
          pt: 'Comparar as alternativas antes de escolher ajuda a tomar a decisão.',
          en: 'Comparing the alternatives before choosing supports the decision.',
        },
      ],
      avoidWhen: [
        {
          pt: 'Zero, uma ou várias opções podem ser escolhidas; use Checkbox.',
          en: 'Zero, one, or multiple options may be selected; use Checkbox.',
        },
        {
          pt: 'Há muitas alternativas ou pouco espaço; use Select.',
          en: 'There are many alternatives or limited space; use Select.',
        },
      ],
    },
    ark: {
      adapterImport: `import {
  RadioGroup,
  RadioGroupContent,
  RadioGroupHiddenInput,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
} from '@tis/react/ark/radio'`,
    },
    web: {
      storyId: 'components-form-radio--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<fieldset class="ds-radio-group">
  <legend class="ds-radio-group__legend">Preferência de contato</legend>
  <label class="ds-radio-label">
    <input class="ds-radio" type="radio" name="contact" value="email" checked />
    <span class="ds-radio__content">
      <span class="ds-radio__label">E-mail</span>
    </span>
  </label>
</fieldset>`,
    },
  },
  combobox: {
    description: {
      pt: 'Filtra e seleciona uma opção em conjuntos extensos, preservando valor de formulário e navegação por teclado.',
      en: 'Filters and selects an option from large sets while preserving form value and keyboard navigation.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém filtro, seleção, foco e teclado.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains filtering, selection, focus, and keyboard behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Combobox TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Combobox classes and tokens.',
      },
    },
    ark: {
      adapterImport: `import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
} from '@tis/react/ark/combobox'`,
    },
    web: {
      storyId: 'components-form-combobox--playground',
      imports: `import 'ds-tis/css'
import { initComboboxes } from 'ds-tis/combobox'

initComboboxes()`,
      markup: `<div class="ds-field">
  <label class="ds-field__label" for="country">País</label>
  <div class="ds-combobox-anchor">
    <div class="ds-combobox ds-combobox--md">
      <input id="country" class="ds-combobox__input" role="combobox" aria-expanded="false" aria-controls="country-list" aria-autocomplete="list" />
      <button class="ds-combobox__clear" type="button" aria-label="Limpar seleção">…</button>
    </div>
    <ul id="country-list" class="ds-combobox__listbox" role="listbox" hidden>
      <li class="ds-combobox__option" role="option">Brasil</li>
    </ul>
  </div>
</div>`,
    },
  },
  select: {
    description: {
      pt: 'Seleciona um único valor de uma lista conhecida sem aceitar entrada de texto.',
      en: 'Selects a single value from a known list without accepting text input.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém valor, typeahead, foco e teclado.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains value, typeahead, focus, and keyboard behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Select TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Select classes and tokens.',
      },
    },
    ark: {
      adapterImport: `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tis/react/ark/select'`,
    },
    web: {
      storyId: 'components-form-select--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<div class="ds-field">
  <label class="ds-field__label" for="country">País</label>
  <div class="ds-select ds-select--md">
    <select class="ds-select__field" id="country" name="country">
      <option value="" disabled selected>Selecione um país</option>
      <option value="br">Brasil</option>
      <option value="cl">Chile</option>
    </select>
    <span class="ds-select__arrow" aria-hidden="true"></span>
  </div>
</div>`,
    },
  },
  menu: {
    description: {
      pt: 'Oferece uma lista curta de comandos contextuais a partir de um Button.',
      en: 'Offers a short list of contextual commands from a Button.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém abertura, foco, typeahead e teclado.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains open state, focus, typeahead, and keyboard behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Menu TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Menu classes and tokens.',
      },
    },
    ark: {
      adapterImport: `import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from '@tis/react/ark/menu'`,
    },
    web: {
      storyId: 'components-menu--action-menu',
      imports: `import 'ds-tis/css'
import { initActionMenus } from 'ds-tis/menu'

initActionMenus()`,
      markup: `<div class="ds-action-menu">
  <button class="ds-button ds-button--outline ds-action-menu__trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="project-menu">
    <span class="ds-button__label">Ações do projeto</span>
  </button>
  <div class="ds-menu ds-action-menu__content" id="project-menu" role="menu">
    <button class="ds-menu__item" role="menuitem" type="button">
      <span class="ds-menu__item-label">Editar detalhes</span>
    </button>
  </div>
</div>`,
    },
  },
  modal: {
    description: {
      pt: 'Mantém uma tarefa curta e reversível em foco sem retirar a pessoa do contexto atual.',
      en: 'Keeps a short, reversible task in focus without removing the person from the current context.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém foco, teclado, estado e bloqueio do conteúdo externo.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains focus, keyboard behavior, state, and outside-content blocking.',
      },
    },
    usageGuidance: {
      useWhen: [
        {
          pt: 'Uma edição curta ou revisão precisa terminar antes de retornar ao contexto anterior.',
          en: 'A short edit or review must finish before returning to the previous context.',
        },
        {
          pt: 'O conteúdo exige atenção concentrada, mas ainda não justifica uma página dedicada.',
          en: 'The content requires focused attention but does not justify a dedicated page.',
        },
      ],
      avoidWhen: [
        {
          pt: 'A tarefa é longa, possui várias etapas ou precisa continuar visível junto da página.',
          en: 'The task is long, has multiple steps, or must remain visible alongside the page.',
        },
        {
          pt: 'A confirmação é destrutiva ou crítica; esse caso pertence ao contrato separado de Alert Dialog.',
          en: 'The confirmation is destructive or critical; that case belongs to the separate Alert Dialog contract.',
        },
      ],
      note: {
        pt: 'Mudar a cor do botão não transforma um Modal comum em Alert Dialog.',
        en: 'Changing the button color does not turn a regular Modal into an Alert Dialog.',
      },
    },
    ark: {
      adapterImport: `import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  ModalTitle,
  ModalTrigger,
} from '@tis/react/ark/modal'`,
    },
    web: {
      storyId: 'components-modal--playground',
      imports: `import 'ds-tis/css'
import { initModals } from 'ds-tis/modal'

initModals()`,
      markup: `<button type="button" data-ds-modal-open="review-modal">Revisar alterações</button>
<div class="ds-modal-overlay" id="review-modal" hidden>
  <div class="ds-modal ds-modal--md" role="dialog" aria-modal="true" aria-labelledby="review-title">
    <div class="ds-modal__header">
      <h2 class="ds-modal__title" id="review-title">Revisar alterações</h2>
      <button class="ds-modal__close" type="button" aria-label="Fechar modal">…</button>
    </div>
    <div class="ds-modal__body">Confira os dados antes de continuar.</div>
  </div>
</div>`,
    },
  },
  popover: {
    description: {
      pt: 'Exibe conteúdo contextual breve em uma camada não modal ancorada a um trigger.',
      en: 'Displays concise contextual content in a non-modal layer anchored to a trigger.',
    },
    previewSize: 'medium',
    examples: {
      web: [{
        storyId: 'components-popover--com-slot',
        size: 'large',
        title: { pt: 'Content Slot adicional', en: 'Additional Content Slot' },
        description: {
          pt: 'Executado pelo runtime HTML/CSS/JavaScript estável com campo e ações reais do DS.',
          en: 'Executed by the stable HTML/CSS/JavaScript runtime with a real DS field and actions.',
        },
      }],
      ark: [{
        storyId: 'ark-popover--content-slot',
        size: 'large',
        title: { pt: 'Content Slot adicional', en: 'Additional Content Slot' },
        description: {
          pt: 'Executado pelo adapter Ark UI/Zag, sem reutilizar o runtime Web ou Base UI.',
          en: 'Executed by the Ark UI/Zag adapter without reusing the Web runtime or Base UI.',
        },
      }],
      react: [{
        storyId: 'react-popover--content-slot',
        size: 'large',
        title: { pt: 'Content Slot adicional', en: 'Additional Content Slot' },
        description: {
          pt: 'Executado pela recipe React distribuída via shadcn e baseada em Base UI.',
          en: 'Executed by the React recipe distributed through shadcn and based on Base UI.',
        },
      }],
      angular: [{
        storyId: 'angular-popover--content-slot',
        size: 'large',
        title: { pt: 'Content Slot adicional', en: 'Additional Content Slot' },
        description: {
          pt: 'Executado pelo componente Angular nativo com CDK Overlay/Portal e content projection.',
          en: 'Executed by the native Angular component with CDK Overlay/Portal and content projection.',
        },
      }],
    },
    descriptions: {
      web: {
        pt: 'Dialog contextual não modal, ancorado a um trigger, para conteúdo breve que pode incluir ações e componentes interativos.',
        en: 'A non-modal contextual dialog anchored to a trigger for concise content that may include actions and interactive components.',
      },
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém estado, posicionamento e comportamento.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains state, positioning, and behavior.',
      },
      angular: {
        pt: 'Componente standalone não modal com CDK Overlay/Portal, posicionamento, dismiss e retorno de foco.',
        en: 'Standalone non-modal component with CDK Overlay/Portal, positioning, dismiss, and focus return.',
      },
    },
    ark: {
      adapterImport: `import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@tis/react/ark/popover'`,
    },
    angular: {
      primitive: '@angular/cdk/overlay + portal + a11y',
      imports: `import {
  TisPopover,
  TisPopoverActions,
  TisPopoverContent,
} from '@tis/angular/popover'`,
      markup: `<tis-popover
  #popover
  title="Preferências do projeto"
  triggerLabel="Abrir preferências"
  placement="bottom"
>
  <div tisPopoverContent>Conteúdo contextual breve.</div>
  <div tisPopoverActions>
    <button type="button" (click)="popover.close('api')">Aplicar</button>
  </div>
</tis-popover>`,
    },
    web: {
      storyId: 'components-popover--playground',
      imports: `import 'ds-tis/css'
import { initPopovers } from 'ds-tis/popover'

initPopovers()`,
      markup: `<div class="ds-popover ds-popover--bottom">
  <button class="ds-button ds-popover__trigger" type="button">Detalhes</button>
  <div class="ds-popover__panel" role="dialog" aria-labelledby="popover-title" hidden>
    <div class="ds-popover__header">
      <h2 class="ds-popover__title" id="popover-title">Detalhes</h2>
    </div>
    <button class="ds-popover__close" type="button" aria-label="Fechar popover">…</button>
    <div class="ds-popover__body">Conteúdo breve.</div>
  </div>
</div>`,
    },
  },
  tooltip: {
    description: {
      pt: 'Exibe um label visual breve quando um trigger recebe hover ou focus.',
      en: 'Displays a brief visual label when a trigger receives hover or focus.',
    },
    previewSize: 'compact',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém hover, focus, delays, posicionamento e Escape.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains hover, focus, delays, positioning, and Escape.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e tokens públicos do Tooltip TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Tooltip tokens.',
      },
    },
    ark: {
      adapterImport: `import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tis/react/ark/tooltip'`,
    },
    web: {
      storyId: 'components-tooltip--playground',
      imports: `import 'ds-tis/css'
import { initTooltips } from 'ds-tis/tooltip'

initTooltips()`,
      markup: `<div class="ds-tooltip ds-tooltip--top">
  <button type="button" aria-label="Editar projeto" aria-describedby="edit-tooltip">Editar</button>
  <span class="ds-tooltip__content" id="edit-tooltip" role="tooltip">Editar projeto</span>
</div>`,
    },
  },
  tabs: {
    description: {
      pt: 'Alterna painéis relacionados no mesmo contexto com seleção e teclado previsíveis.',
      en: 'Switches related panels in the same context with predictable selection and keyboard behavior.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém seleção, roving tabindex, relações ARIA e teclado.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains selection, roving tabindex, ARIA relationships, and keyboard behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Tabs TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Tabs classes and tokens.',
      },
    },
    ark: {
      adapterImport: `import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tis/react/ark/tabs'`,
    },
    web: {
      storyId: 'components-tabs--playground',
      imports: `import 'ds-tis/css'
import { initTabs } from 'ds-tis/tabs'

initTabs()`,
      markup: `<div class="ds-tabs" role="tablist" aria-label="Seções do projeto">
  <button class="ds-tab ds-tab--active" role="tab" id="overview-tab" aria-selected="true" aria-controls="overview-panel">Visão geral</button>
  <button class="ds-tab" role="tab" id="team-tab" aria-selected="false" aria-controls="team-panel" tabindex="-1">Equipe</button>
</div>
<div class="ds-tab-panel" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">Resumo do projeto.</div>
<div class="ds-tab-panel" role="tabpanel" id="team-panel" aria-labelledby="team-tab" hidden>Equipe do projeto.</div>`,
    },
  },
  toast: {
    description: {
      pt: 'Confirma resultados e comunica feedback transitório sem interromper o fluxo atual.',
      en: 'Confirms outcomes and communicates transient feedback without interrupting the current flow.',
    },
    previewSize: 'medium',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI e Zag gerenciam fila, live region, tempo, pausa e foco.',
        en: 'An independent React adapter where Ark UI and Zag manage the queue, live region, timing, pause, and focus.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com manager Base UI e classes/tokens públicos do Toast TIS.',
        en: 'A React source recipe with a Base UI manager and the public TIS Toast classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        {
          pt: 'Uma ação concluída precisa de confirmação breve sem bloquear a tarefa.',
          en: 'A completed action needs brief confirmation without blocking the task.',
        },
        {
          pt: 'O feedback pode desaparecer sem remover informação necessária para continuar.',
          en: 'Feedback may disappear without removing information required to continue.',
        },
      ],
      avoidWhen: [
        {
          pt: 'A mensagem exige decisão, confirmação crítica ou correção antes de continuar.',
          en: 'The message requires a decision, critical confirmation, or correction before continuing.',
        },
        {
          pt: 'O conteúdo precisa permanecer associado a um campo ou contexto específico da página.',
          en: 'Content must remain associated with a field or a specific page context.',
        },
      ],
      note: {
        pt: 'Use error com prioridade alta; success, warning e info permanecem anúncios educados.',
        en: 'Use high priority for error; success, warning, and info remain polite announcements.',
      },
    },
    ark: {
      adapterImport: `import {
  ToastRegion,
  showToast,
} from '@tis/react/ark/toast'`,
    },
    web: {
      storyId: 'components-toast--playground',
      imports: `import 'ds-tis/css'
import { showToast } from 'ds-tis/toast'

showToast({
  type: 'success',
  style: 'subtle',
  title: 'Preferências salvas',
  description: 'As alterações já estão disponíveis para esta conta.',
})`,
      markup: `<button class="ds-button ds-button--primary ds-button--md" type="button">
  <span class="ds-button__label">Salvar preferências</span>
</button>`,
    },
  },
  toggle: {
    description: {
      pt: 'Liga ou desliga uma configuração com efeito imediato e estado persistente.',
      en: 'Turns a setting on or off with immediate effect and persistent state.',
    },
    previewSize: 'compact',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém on/off, foco, teclado e formulário.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains on/off state, focus, keyboard, and form behavior.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com comportamento Base UI e classes/tokens públicos do Toggle TIS.',
        en: 'A React source recipe with Base UI behavior and the public TIS Toggle classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        {
          pt: 'A configuração entra em vigor imediatamente ao ser ligada ou desligada.',
          en: 'The setting takes effect immediately when turned on or off.',
        },
        {
          pt: 'O estado atual precisa permanecer visível após a interação.',
          en: 'The current state must remain visible after interaction.',
        },
      ],
      avoidWhen: [
        {
          pt: 'A escolha só será aplicada ao enviar um formulário; use Checkbox.',
          en: 'The choice is only applied when a form is submitted; use Checkbox.',
        },
        {
          pt: 'A pessoa precisa escolher uma alternativa entre várias; use Radio.',
          en: 'The person must choose one alternative among several; use Radio.',
        },
      ],
      note: {
        pt: 'O label do Toggle não muda entre ligado e desligado; o estado é comunicado pelo próprio controle.',
        en: 'The Toggle label does not change between on and off; the control itself communicates state.',
      },
    },
    ark: {
      adapterImport: `import {
  Switch,
  SwitchContent,
  SwitchControl,
  SwitchHiddenInput,
  SwitchThumb,
  SwitchTitle,
} from '@tis/react/ark/toggle'`,
    },
    web: {
      storyId: 'components-form-toggle--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<label class="ds-toggle-label">
  <input class="ds-toggle" type="checkbox" role="switch" name="notifications" value="enabled" />
  <span class="ds-toggle__content">
    <span class="ds-toggle__label">Receber notificações</span>
  </span>
</label>`,
    },
  },
};

const localize = (value: LocalizedText, locale: DocumentationLocale) =>
  locale === 'en' ? value.en : value.pt;

const statusLabels = {
  stable: { pt: 'Estável', en: 'Stable' },
  beta: { pt: 'Beta', en: 'Beta' },
  planned: { pt: 'Planejada', en: 'Planned' },
  unavailable: { pt: 'Indisponível', en: 'Unavailable' },
};

const distributionLabels = {
  npm: { pt: 'Pacote npm', en: 'npm package' },
  'technology-adapters': { pt: 'Ainda não distribuída', en: 'Not distributed yet' },
  'source-adapter': { pt: 'Adapter de source', en: 'Source adapter' },
  'shadcn-registry': { pt: 'Source via shadcn', en: 'Source via shadcn' },
  'angular-package': { pt: 'Tarball Angular validado', en: 'Validated Angular tarball' },
};

const technologyLabels: Record<DocumentationTechnology, string> = {
  web: 'HTML/CSS/JS',
  ark: 'Ark/Zag',
  react: 'React · shadcn/Base UI',
  angular: 'Angular',
};

export function getComponentDocumentation(
  slug: DocumentationSlug,
  technology: DocumentationTechnology,
  locale: DocumentationLocale,
) {
  const config = configs[slug];
  const component = getComponent(slug);
  const implementation = component.implementations[technology];
  const react = getReactComponents(locale).find((entry) => entry.slug === slug);
  const language = locale === 'en' ? 'en' : 'pt';
  const status = implementation.status as keyof typeof statusLabels;
  const distributionKey = technology === 'ark' && status === 'beta'
    ? 'source-adapter'
    : implementation.distribution;
  const distribution = distributionLabels[distributionKey as keyof typeof distributionLabels];
  const configuredDescription = config.descriptions?.[technology];
  const storyId = technology === 'web'
    ? config.web.storyId
    : technology === 'react'
      ? react?.storyId
      : implementation.storyId || undefined;
  const usageGuidance = config.usageGuidance
    ? {
        avoidWhen: config.usageGuidance.avoidWhen.map((item) => localize(item, locale)),
        note: config.usageGuidance.note
          ? localize(config.usageGuidance.note, locale)
          : undefined,
        useWhen: config.usageGuidance.useWhen.map((item) => localize(item, locale)),
      }
    : undefined;
  const examples = (config.examples?.[technology] || []).map((example) => ({
    description: localize(example.description, locale),
    size: example.size,
    storyId: example.storyId,
    title: localize(example.title, locale),
  }));

  if (!statusLabels[status]) throw new Error(`${slug}/${technology}: status documental desconhecido: ${status}`);
  if (!distribution) throw new Error(`${slug}/${technology}: distribuição documental desconhecida: ${distributionKey}`);
  if (technology === 'react' && status === 'beta' && !react) {
    throw new Error(`${slug}/${technology}: documentação React beta ausente`);
  }
  if (technology === 'ark' && status === 'beta' && !config.ark?.adapterImport) {
    throw new Error(`${slug}/${technology}: import do adapter Ark/Zag ausente`);
  }
  if (technology === 'angular' && status === 'beta' && !config.angular) {
    throw new Error(`${slug}/${technology}: contrato Angular beta ausente`);
  }

  return {
    categoryLabel: component.category.label[language],
    component,
    config,
    description: configuredDescription
      ? localize(configuredDescription, locale)
      : localize(config.description, locale),
    distributionLabel: localize(distribution, locale),
    examples,
    implementation,
    react,
    status,
    statusLabel: localize(statusLabels[status], locale),
    storybook: technology === 'web'
      ? 'stable' as const
      : technology === 'angular'
        ? 'angular' as const
        : 'vnext' as const,
    storyId,
    technologyLabel: technologyLabels[technology],
    usageGuidance,
  };
}
