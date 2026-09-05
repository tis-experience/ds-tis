import { getComponent } from './component-source.mjs';
import { getReactComponents } from './react-component-catalog.mjs';

export type DocumentationTechnology = 'web' | 'ark' | 'react' | 'angular';
export type DocumentationLocale = 'pt-br' | 'en';
export type DocumentationSlug = 'accordion' | 'alert' | 'avatar' | 'badge' | 'breadcrumb' | 'button' | 'card' | 'checkbox' | 'combobox' | 'divider' | 'form-field' | 'input' | 'menu' | 'modal' | 'pagination' | 'popover' | 'radio' | 'select' | 'skeleton' | 'spinner' | 'table' | 'tabs' | 'textarea' | 'toast' | 'toggle' | 'tooltip';

interface LocalizedText {
  pt: string;
  en: string;
}

interface ComponentDocumentationConfig {
  description: LocalizedText;
  descriptions?: Partial<Record<DocumentationTechnology, LocalizedText>>;
  examples?: Partial<Record<DocumentationTechnology, Array<{
    description: LocalizedText;
    size?: 'compact' | 'medium' | 'large' | 'tall';
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
  avatar: {
    description: { pt: 'Representa pessoas ou entidades por imagem, iniciais ou ícone.', en: 'Represents people or entities using an image, initials or an icon.' },
    previewSize: 'compact',
    descriptions: { angular: { pt: 'Componente standalone com imagem nativa e fallback Angular. Compartilha apenas o CSS e os tokens públicos do DS.', en: 'Standalone component with a native image and Angular fallback. Shares only the public DS CSS and tokens.' } },
    examples: { angular: [
      { storyId: 'angular-avatar--tamanhos-e-conteudos', size: 'compact', title: { pt: 'Tamanhos e conteúdos', en: 'Sizes and content' }, description: { pt: 'sm, md e lg com iniciais, imagem e ícone.', en: 'sm, md and lg with initials, image and icon.' } },
      { storyId: 'angular-avatar--fallback', size: 'compact', title: { pt: 'Falha e recuperação da imagem', en: 'Image failure and recovery' }, description: { pt: 'Simule a falha para exibir iniciais e restaure a imagem. O tamanho permanece constante.', en: 'Simulate failure to show initials and restore the image. Size remains constant.' } },
      { storyId: 'angular-avatar--decorativo', size: 'compact', title: { pt: 'Avatar decorativo', en: 'Decorative avatar' }, description: { pt: 'O texto adjacente identifica a pessoa sem duplicar o anúncio do leitor de tela.', en: 'Adjacent text identifies the person without a duplicate screen reader announcement.' } },
    ] },
    angular: {
      primitive: 'HTML img + fallback Angular',
      imports: `import { TisAvatar } from '@tis/angular/avatar'`,
      markup: `<tis-avatar label="Ana Lima" initials="AL" size="md" />
<tis-avatar label="Ana Lima" content="image" src="/ana.jpg" initials="AL" />
<tis-avatar label="Pessoa sem foto" content="icon" />
<tis-avatar label="Ana Lima" initials="AL" decorative /><span>Ana Lima</span>`,
    },
    web: {
      imports: `import 'ds-tis/css'`, storyId: 'components-avatar--playground',
      markup: `<span class="ds-avatar" role="img" aria-label="Ana Lima"><span aria-hidden="true">AL</span></span>`,
    },
  },
  breadcrumb: {
    description: { pt: 'Mostra a posição na hierarquia e permite navegar aos níveis anteriores.', en: 'Shows the position in a hierarchy and links to ancestor pages.' },
    previewSize: 'compact',
    descriptions: {
      angular: { pt: 'Diretivas standalone sobre nav, links e spans nativos. O navegador mantém a navegação e o teclado; o consumidor fornece destinos e a página atual.', en: 'Standalone directives on native nav, links and spans. The browser owns navigation and keyboard behavior; the consumer provides destinations and the current page.' },
    },
    examples: { angular: [
      { storyId: 'angular-breadcrumb--navegacao', size: 'compact', title: { pt: 'Navegação entre níveis', en: 'Navigating between levels' }, description: { pt: 'Clique ou use Tab e Enter para voltar a Projetos ou Início. A trilha e a página exibida são atualizadas pelo exemplo Angular.', en: 'Click or use Tab and Enter to return to Projects or Home. The Angular example updates the trail and displayed page.' } },
      { storyId: 'angular-breadcrumb--hierarquia-profunda', size: 'compact', title: { pt: 'Hierarquia profunda', en: 'Deep hierarchy' }, description: { pt: 'O container do exemplo permite rolagem horizontal quando necessário, sem cortar os links nem alargar a página.', en: 'The example container scrolls horizontally when needed, without clipping links or widening the page.' } },
    ] },
    angular: {
      primitive: 'HTML nav + links nativos',
      imports: `import { TisBreadcrumb, TisBreadcrumbLink, TisBreadcrumbCurrent,
  TisBreadcrumbSeparator } from '@tis/angular/breadcrumb'`,
      markup: `<nav tisBreadcrumb label="Caminho do projeto">
  <a tisBreadcrumbLink href="/">Início</a>
  <span tisBreadcrumbSeparator>/</span>
  <a tisBreadcrumbLink href="/projetos">Projetos</a>
  <span tisBreadcrumbSeparator>/</span>
  <span tisBreadcrumbCurrent>Design System</span>
</nav>`,
    },
    web: {
      imports: `import 'ds-tis/css'`, storyId: 'components-breadcrumb--playground',
      markup: `<nav class="ds-breadcrumb" aria-label="Breadcrumb">
  <a class="ds-breadcrumb__item" href="/">Início</a>
  <span class="ds-breadcrumb__separator" aria-hidden="true">/</span>
  <span class="ds-breadcrumb__item ds-breadcrumb__item--current" aria-current="page">Projetos</span>
</nav>`,
    },
  },
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
  alert: {
    description: {
      pt: 'Comunica informação, confirmação, atenção ou erro dentro do fluxo atual.',
      en: 'Communicates information, confirmation, warning, or error within the current flow.',
    },
    previewSize: 'medium',
    descriptions: {
      angular: {
        pt: 'Componente standalone por composição, com live region contextual, partes públicas e fechamento controlado pela aplicação.',
        en: 'A standalone composition component with contextual live-region semantics, public parts, and application-controlled dismissal.',
      },
      react: {
        pt: 'Recipe React distribuída como source, composta com elementos nativos e as classes/tokens públicos do Alert TIS.',
        en: 'A React source recipe composed with native elements and the public TIS Alert classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        { pt: 'A mensagem precisa permanecer visível junto do conteúdo relacionado.', en: 'The message should remain visible next to the related content.' },
        { pt: 'O estado comunicado exige contexto ou uma ação diretamente relacionada.', en: 'The communicated state needs context or a directly related action.' },
      ],
      avoidWhen: [
        { pt: 'O feedback é breve e não precisa permanecer no fluxo; use Toast.', en: 'Feedback is brief and does not need to remain in the flow; use Toast.' },
        { pt: 'A pessoa precisa interromper a tarefa para decidir; use Modal.', en: 'The person must interrupt the task to decide; use Modal.' },
      ],
    },
    angular: {
      primitive: 'Live region nativa + composição Angular',
      imports: `import {
  TisAlert,
  TisAlertClose,
  TisAlertContent,
  TisAlertDescription,
  TisAlertIcon,
  TisAlertTitle,
} from '@tis/angular/alert'`,
      markup: `<tis-alert tone="success" variant="subtle">
  <span tisAlertIcon><!-- ícone decorativo --></span>
  <div tisAlertContent>
    <strong tisAlertTitle>Configuração salva</strong>
    <span tisAlertDescription>As preferências já estão disponíveis.</span>
  </div>
  <button tisAlertClose aria-label="Fechar alerta" (click)="dismiss()">
    <!-- ícone de fechar -->
  </button>
</tis-alert>`,
    },
    web: {
      storyId: 'components-alert--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<div class="ds-alert ds-alert--success ds-alert--subtle" role="status">
  <span class="ds-alert__icon" aria-hidden="true"><!-- ícone --></span>
  <div class="ds-alert__content">
    <strong class="ds-alert__title">Configuração salva</strong>
    <p class="ds-alert__description">As preferências já estão disponíveis.</p>
  </div>
  <button class="ds-alert__close" type="button" aria-label="Fechar alerta">
    <!-- ícone de fechar -->
  </button>
</div>`,
    },
  },
  badge: {
    description: {
      pt: 'Identifica estado, categoria ou atributo com um label curto e semanticamente explícito.',
      en: 'Identifies a status, category, or attribute with a short, semantically explicit label.',
    },
    previewSize: 'compact',
    descriptions: {
      angular: {
        pt: 'Componente standalone apresentacional com inputs tipados, content projection e as classes públicas do Badge TIS.',
        en: 'A standalone presentational component with typed inputs, content projection, and the public TIS Badge classes.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com elemento span e as classes/tokens públicos do Badge TIS.',
        en: 'A React source recipe with a span element and the public TIS Badge classes and tokens.',
      },
    },
    angular: {
      primitive: 'Elemento host apresentacional',
      imports: `import { TisBadge } from '@tis/angular/badge'`,
      markup: `<tis-badge tone="success" variant="subtle">
  Aprovado
</tis-badge>`,
    },
    web: {
      storyId: 'components-badge--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<span class="ds-badge ds-badge--success ds-badge--subtle">
  Aprovado
</span>`,
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
  card: {
    description: {
      pt: 'Agrupa conteúdo e ações relacionadas em uma superfície com hierarquia clara.',
      en: 'Groups related content and actions in a surface with clear hierarchy.',
    },
    previewSize: 'medium',
    descriptions: {
      angular: {
        pt: 'Diretivas standalone que preservam article ou button como raiz semântica e aplicam a anatomia pública do Card.',
        en: 'Standalone directives that preserve article or button as the semantic root and apply the public Card anatomy.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com raiz polimórfica e as classes/tokens públicos do Card TIS.',
        en: 'A React source recipe with a polymorphic root and the public TIS Card classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        { pt: 'Conteúdo, metadados e ações formam uma unidade reutilizável ou comparável.', en: 'Content, metadata, and actions form a reusable or comparable unit.' },
        { pt: 'A superfície precisa comunicar agrupamento e hierarquia próprios.', en: 'The surface needs to communicate its own grouping and hierarchy.' },
      ],
      avoidWhen: [
        { pt: 'O conteúdo já possui hierarquia suficiente sem uma superfície adicional.', en: 'The content already has enough hierarchy without an additional surface.' },
        { pt: 'O Card interativo precisaria conter outros buttons ou links; evite controles interativos aninhados.', en: 'The interactive Card would need nested buttons or links; avoid nested interactive controls.' },
      ],
    },
    examples: {
      web: [{
        storyId: 'components-card--estados',
        size: 'medium',
        title: { pt: 'Card interativo', en: 'Interactive Card' },
        description: {
          pt: 'Executado pelo HTML nativo; o próprio Card é o único button da composição.',
          en: 'Rendered with native HTML; the Card itself is the composition’s only button.',
        },
      }],
      react: [{
        storyId: 'react-card--interactive',
        size: 'medium',
        title: { pt: 'Card interativo', en: 'Interactive Card' },
        description: {
          pt: 'Executado pela recipe React com raiz polimórfica em button.',
          en: 'Rendered by the React recipe with a polymorphic button root.',
        },
      }],
      angular: [{
        storyId: 'angular-card--interativo',
        size: 'medium',
        title: { pt: 'Card interativo', en: 'Interactive Card' },
        description: {
          pt: 'Executado pelas diretivas Angular sobre button nativo, com seleção real.',
          en: 'Rendered by Angular directives on a native button with real selection.',
        },
      }],
    },
    angular: {
      primitive: 'Elemento semântico nativo + composição Angular',
      imports: `import {
  TisCard,
  TisCardContainer,
  TisCardContent,
  TisCardHeader,
  TisCardTitle,
} from '@tis/angular/card'`,
      markup: `<article tisCard variant="outlined">
  <div tisCardContainer>
    <header tisCardHeader>
      <h3 tisCardTitle>Uso da organização</h3>
    </header>
    <div tisCardContent>128 licenças ativas.</div>
  </div>
</article>`,
    },
    web: {
      storyId: 'components-card--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<article class="ds-card ds-card--outlined">
  <div class="ds-card__container">
    <header class="ds-card__header">
      <h3 class="ds-card__title">Uso da organização</h3>
    </header>
    <div class="ds-card__body">128 licenças ativas.</div>
  </div>
</article>`,
    },
  },
  divider: {
    description: {
      pt: 'Separa regiões de conteúdo relacionadas sem introduzir uma nova superfície.',
      en: 'Separates related content regions without introducing a new surface.',
    },
    previewSize: 'compact',
    descriptions: {
      angular: {
        pt: 'Diretiva standalone sobre hr nativo, com orientação tipada e semântica decorativa opcional.',
        en: 'A standalone directive on a native hr element, with typed orientation and optional decorative semantics.',
      },
      react: {
        pt: 'Recipe React distribuída como source, sobre hr nativo e com as classes/tokens públicos do Divider TIS.',
        en: 'A React source recipe on a native hr element using the public TIS Divider classes and tokens.',
      },
    },
    usageGuidance: {
      useWhen: [
        { pt: 'A proximidade e o espaçamento não distinguem suficientemente grupos relacionados.', en: 'Proximity and spacing do not sufficiently distinguish related groups.' },
        { pt: 'Uma toolbar precisa separar visualmente grupos de ações.', en: 'A toolbar needs to visually separate action groups.' },
      ],
      avoidWhen: [
        { pt: 'Um heading ou o espaçamento já comunica claramente a mudança de seção.', en: 'A heading or spacing already clearly communicates the section change.' },
        { pt: 'A linha seria usada apenas como decoração sem função de agrupamento.', en: 'The line would be used only as decoration without a grouping function.' },
      ],
    },
    examples: {
      web: [{
        storyId: 'components-divider--contextos',
        size: 'medium',
        title: { pt: 'Contextos', en: 'Contexts' },
        description: {
          pt: 'Separadores horizontal e vertical executados com HTML e CSS estáveis.',
          en: 'Horizontal and vertical separators rendered with stable HTML and CSS.',
        },
      }],
      react: [{
        storyId: 'react-divider--toolbar',
        size: 'compact',
        title: { pt: 'Toolbar', en: 'Toolbar' },
        description: {
          pt: 'Separador vertical executado pela recipe React entre Buttons da própria saída.',
          en: 'A vertical separator rendered by the React recipe between Buttons from the same output.',
        },
      }],
      angular: [{
        storyId: 'angular-divider--toolbar',
        size: 'compact',
        title: { pt: 'Toolbar', en: 'Toolbar' },
        description: {
          pt: 'Separador vertical decorativo executado pela diretiva Angular entre Buttons nativos.',
          en: 'A decorative vertical separator rendered by the Angular directive between native Buttons.',
        },
      }],
    },
    angular: {
      primitive: 'HTML hr nativo',
      imports: `import { TisDivider } from '@tis/angular/divider'`,
      markup: `<hr tisDivider>

<div role="toolbar" aria-label="Ações de edição">
  <button type="button">Copiar</button>
  <hr tisDivider orientation="vertical" [decorative]="true">
  <button type="button">Colar</button>
</div>`,
    },
    web: {
      storyId: 'components-divider--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<hr class="ds-divider">

<div role="toolbar" aria-label="Ações de edição">
  <button type="button">Copiar</button>
  <hr class="ds-divider ds-divider--vertical" aria-hidden="true">
  <button type="button">Colar</button>
</div>`,
    },
  },
  'form-field': {
    description: {
      pt: 'Conecta label, controle, ajuda e erro em um campo de formulário.',
      en: 'Connects a label, control, hint and error in a form field.',
    },
    descriptions: {
      angular: {
        pt: 'Composição standalone com controle projetado. Exponha os IDs e estados ao elemento nativo pelas propriedades públicas do field; o valor continua sob responsabilidade do controle e do Angular Forms.',
        en: 'Standalone composition with a projected control. Bind the field’s public IDs and states to the native element; the control and Angular Forms continue to own its value.',
      },
    },
    previewSize: 'compact',
    usageGuidance: {
      useWhen: [{ pt: 'Um controle nativo ou customizado precisa de label, ajuda e erro externos.', en: 'A native or custom control needs an external label, hint and error.' }],
      avoidWhen: [{ pt: 'O controle já inclui Form Field: tis-input, tis-select e tis-textarea já possuem essa composição.', en: 'The control already includes Form Field: tis-input, tis-select and tis-textarea already provide this composition.' }],
      note: { pt: 'Vincule controlId(), describedBy(), ariaInvalid(), ariaLabel() e required() ao controle. O wrapper não valida valores nem substitui ControlValueAccessor.', en: 'Bind controlId(), describedBy(), ariaInvalid(), ariaLabel() and required() to the control. The wrapper does not validate values or replace ControlValueAccessor.' },
    },
    examples: {
      angular: [
        { storyId: 'angular-form-field--validacao', size: 'compact', title: { pt: 'Validação com Angular Forms', en: 'Angular Forms validation' }, description: { pt: 'Envie vazio para mostrar o erro; digite um nome para removê-lo. Label, helper e erro permanecem associados ao input.', en: 'Submit empty to show the error; enter a name to clear it. Label, hint and error remain associated with the input.' } },
        { storyId: 'angular-form-field--textarea', size: 'compact', title: { pt: 'Composição com Textarea', en: 'Textarea composition' }, description: { pt: 'Textarea pela anatomia pública do DS dentro do wrapper Angular.', en: 'The public DS Textarea anatomy inside the Angular wrapper.' } },
        { storyId: 'angular-form-field--sem-label-visivel', size: 'compact', title: { pt: 'Label visualmente oculto', en: 'Visually hidden label' }, description: { pt: 'O nome acessível permanece no controle por aria-label.', en: 'The control keeps its accessible name through aria-label.' } },
      ],
    },
    angular: {
      primitive: 'HTML label + Angular content projection',
      imports: `import { TisFormField } from '@tis/angular/form-field'`,
      markup: `<tis-form-field #field="tisFormField" label="Nome" required
  helperText="Use seu nome completo." [invalid]="invalid" errorMessage="Informe seu nome.">
  <div class="ds-input" [class.ds-input--error]="field.invalid()">
    <input class="ds-input__field" [id]="field.controlId()" [required]="field.required()"
      [attr.aria-label]="field.ariaLabel()" [attr.aria-invalid]="field.ariaInvalid()"
      [attr.aria-describedby]="field.describedBy()">
  </div>
</tis-form-field>`,
    },
    web: {
      imports: `import 'ds-tis/css'`,
      storyId: 'components-form-field--playground',
      markup: `<div class="ds-field">
  <div class="ds-field__label-row"><label class="ds-field__label" for="name">Nome</label></div>
  <div class="ds-input"><input class="ds-input__field" id="name" aria-describedby="name-helper"></div>
  <span class="ds-field__helper" id="name-helper">Use seu nome completo.</span>
</div>`,
    },
  },
  input: {
    description: {
      pt: 'Coleta texto curto ou dados estruturados em uma única linha.',
      en: 'Collects short text or structured data in a single line.',
    },
    previewSize: 'medium',
    descriptions: {
      angular: {
        pt: 'Componente Angular standalone sobre input nativo, com Form Field completo, ícones, validação e ControlValueAccessor.',
        en: 'A standalone Angular component over a native input, with a complete Form Field, icons, validation, and ControlValueAccessor.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com primitive Base UI e classes/tokens públicos do Input Text TIS.',
        en: 'A React source recipe with a Base UI primitive and the public TIS Input Text classes and tokens.',
      },
    },
    examples: {
      angular: [
        {
          storyId: 'angular-input--tamanhos',
          size: 'medium',
          title: { pt: 'Tamanhos · Angular', en: 'Sizes · Angular' },
          description: {
            pt: 'Controles sm, md e lg executados pelo componente Angular nativo.',
            en: 'Small, medium, and large controls running through the native Angular component.',
          },
        },
        {
          storyId: 'angular-input--estados',
          size: 'medium',
          title: { pt: 'Estados · Angular', en: 'States · Angular' },
          description: {
            pt: 'Estados padrão, preenchido, erro, desabilitado e somente leitura com semântica nativa.',
            en: 'Default, filled, error, disabled, and read-only states with native semantics.',
          },
        },
      ],
    },
    angular: {
      primitive: 'HTML input + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import { TisInput, TisInputIconStart } from '@tis/angular/input'`,
      markup: `<tis-input
  name="email"
  label="E-mail"
  type="email"
  [(ngModel)]="email"
  helperText="Use seu e-mail corporativo."
  [required]="true"
>
  <svg tisInputIconStart aria-hidden="true">…</svg>
</tis-input>`,
    },
    web: {
      storyId: 'components-form-input-text--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<div class="ds-field">
  <label class="ds-field__label" for="email">E-mail</label>
  <div class="ds-input ds-input--md">
    <input id="email" class="ds-input__field" type="email" name="email" />
  </div>
</div>`,
    },
  },
  textarea: {
    description: {
      pt: 'Coleta texto livre em múltiplas linhas com limite e contador opcionais.',
      en: 'Collects free-form multiline text with an optional limit and counter.',
    },
    previewSize: 'medium',
    descriptions: {
      angular: {
        pt: 'Componente Angular standalone sobre textarea nativo, com Form Field, contador acessível, validação e ControlValueAccessor.',
        en: 'A standalone Angular component over a native textarea, with Form Field, accessible counter, validation, and ControlValueAccessor.',
      },
      react: {
        pt: 'Recipe React distribuída como source, com textarea nativo e classes/tokens públicos do Textarea TIS.',
        en: 'A React source recipe with a native textarea and the public TIS Textarea classes and tokens.',
      },
    },
    examples: {
      angular: [
        {
          storyId: 'angular-textarea--tamanhos',
          size: 'large',
          title: { pt: 'Tamanhos · Angular', en: 'Sizes · Angular' },
          description: {
            pt: 'Alturas mínimas sm, md e lg preservadas pelo componente Angular.',
            en: 'Small, medium, and large minimum heights preserved by the Angular component.',
          },
        },
        {
          storyId: 'angular-textarea--com-contador',
          size: 'large',
          title: { pt: 'Contador · Angular', en: 'Counter · Angular' },
          description: {
            pt: 'Contagem associada por aria-describedby, incluindo o estado acima do limite.',
            en: 'Count associated through aria-describedby, including the over-limit state.',
          },
        },
      ],
    },
    angular: {
      primitive: 'HTML textarea + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import { TisTextarea } from '@tis/angular/textarea'`,
      markup: `<tis-textarea
  name="message"
  label="Mensagem"
  [(ngModel)]="message"
  helperText="Máximo de 500 caracteres."
  [maxLength]="500"
  [showCounter]="true"
/>`,
    },
    web: {
      storyId: 'components-form-textarea--playground',
      imports: `import 'ds-tis/css'`,
      markup: `<div class="ds-field">
  <label class="ds-field__label" for="message">Mensagem</label>
  <div class="ds-textarea ds-textarea--md">
    <textarea id="message" class="ds-textarea__field" name="message"></textarea>
  </div>
</div>`,
    },
  },
  checkbox: {
    description: {
      pt: 'Permite selecionar opções independentes e comunica seleção parcial quando necessário.',
      en: 'Selects independent options and communicates partial selection when needed.',
    },
    previewSize: 'compact',
    descriptions: {
      angular: {
        pt: 'Componente standalone com checkbox nativo, estado indeterminate e integração ControlValueAccessor com Angular Forms.',
        en: 'Standalone component with a native checkbox, indeterminate state, and ControlValueAccessor integration with Angular Forms.',
      },
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
    angular: {
      primitive: 'HTML checkbox + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import { TisCheckbox } from '@tis/angular/checkbox'`,
      markup: `<tis-checkbox
  name="notifications"
  [(ngModel)]="notifications"
  description="Receba um resumo semanal por e-mail."
>
  Receber novidades
</tis-checkbox>`,
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
      angular: {
        pt: 'Grupo standalone com fieldset, legend e radios nativos, seleção exclusiva e integração ControlValueAccessor com Angular Forms.',
        en: 'Standalone group with a native fieldset, legend, and radios, exclusive selection, and ControlValueAccessor integration with Angular Forms.',
      },
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
    angular: {
      primitive: 'HTML radio group + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import { TisRadioGroup, TisRadioOption } from '@tis/angular/radio'`,
      markup: `<tis-radio-group
  legend="Preferência de contato"
  name="contact"
  [(ngModel)]="contact"
  [required]="true"
>
  <tis-radio-option value="email">E-mail</tis-radio-option>
  <tis-radio-option value="sms">SMS</tis-radio-option>
</tis-radio-group>`,
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
      angular: {
        pt: 'Componente Angular standalone com Angular Aria, filtro local, Form Field completo e ControlValueAccessor.',
        en: 'A standalone Angular component with Angular Aria, local filtering, a complete Form Field, and ControlValueAccessor.',
      },
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
    angular: {
      primitive: '@angular/aria/combobox + listbox + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import {
  TisCombobox,
  TisComboboxIcon,
  type TisComboboxOption,
} from '@tis/angular/combobox'`,
      markup: `<tis-combobox
  name="country"
  label="País"
  [(ngModel)]="country"
  [options]="countryOptions"
  helperText="Digite para filtrar as opções."
  [required]="true"
>
  <svg tisComboboxIcon aria-hidden="true">…</svg>
</tis-combobox>`,
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
  skeleton: {
    description: { pt: 'Representa a forma previsível de conteúdo que ainda está carregando.', en: 'Represents the predictable shape of content that is still loading.' },
    previewSize: 'compact',
    descriptions: {
      angular: { pt: 'Shape standalone sempre decorativo, combinado com uma diretiva de região que anuncia o estado de carregamento uma única vez.', en: 'Always-decorative standalone shape combined with a region directive that announces loading once.' },
    },
    examples: { angular: [
      { storyId: 'angular-skeleton--tipos', size: 'large', title: { pt: 'Tipos', en: 'Types' }, description: { pt: 'Text, circle e rectangle usam os tamanhos e raios do contrato visual.', en: 'Text, circle and rectangle use the visual contract sizes and radii.' } },
      { storyId: 'angular-skeleton--card', size: 'large', title: { pt: 'Card de perfil', en: 'Profile card' }, description: { pt: 'Uma região de loading combina shapes decorativos sem repetir anúncios.', en: 'One loading region combines decorative shapes without repeated announcements.' } },
      { storyId: 'angular-skeleton--lista', size: 'tall', title: { pt: 'Lista', en: 'List' }, description: { pt: 'A lista inteira tem um único estado acessível de carregamento.', en: 'The entire list has one accessible loading state.' } },
    ] },
    angular: {
      primitive: 'elementos decorativos + região native status',
      imports: `import { TisSkeleton, TisSkeletonGroup } from '@tis/angular/skeleton'`,
      markup: `<div tisSkeletonGroup label="Carregando perfil">
  <tis-skeleton type="circle" />
  <tis-skeleton type="text" width="60%" />
  <tis-skeleton type="rectangle" />
</div>`,
    },
    web: {
      imports: `import 'ds-tis/css'`, storyId: 'components-skeleton--playground',
      markup: `<div role="status" aria-label="Carregando perfil" aria-busy="true">
  <span class="ds-skeleton ds-skeleton--text" aria-hidden="true"></span>
</div>`,
    },
    usageGuidance: {
      useWhen: [{ pt: 'A estrutura do conteúdo futuro é conhecida e deve permanecer estável durante o carregamento.', en: 'The future content structure is known and should stay stable while loading.' }],
      avoidWhen: [{ pt: 'A espera pertence a uma única ação ou a estrutura ainda é desconhecida.', en: 'The wait belongs to one action or the structure is unknown.' }],
      note: { pt: 'Anuncie a região uma vez; mantenha cada shape oculto da árvore acessível.', en: 'Announce the region once; keep each shape hidden from the accessibility tree.' },
    },
  },
  spinner: {
    description: { pt: 'Indica uma espera indeterminada quando o tempo de conclusão não é conhecido.', en: 'Indicates an indeterminate wait when completion time is unknown.' },
    previewSize: 'compact',
    descriptions: {
      angular: { pt: 'Componente standalone com status acessível próprio ou modo decorativo para composições que já anunciam a operação.', en: 'Standalone component with its own accessible status or a decorative mode for compositions that already announce the operation.' },
    },
    examples: { angular: [
      { storyId: 'angular-spinner--tamanhos', size: 'compact', title: { pt: 'Tamanhos', en: 'Sizes' }, description: { pt: 'Sm, md e lg preservam espessura, proporção e alinhamento.', en: 'Sm, md, and lg preserve stroke, proportion, and alignment.' } },
      { storyId: 'angular-spinner--estilos', size: 'compact', title: { pt: 'Estilos', en: 'Styles' }, description: { pt: 'Default atende superfícies neutras; on-color mantém contraste em fundos de marca.', en: 'Default suits neutral surfaces; on-color maintains contrast on brand backgrounds.' } },
      { storyId: 'angular-spinner--no-button', size: 'compact', title: { pt: 'No Button', en: 'In a Button' }, description: { pt: 'O Button anuncia a operação e trata o spinner interno como decorativo.', en: 'The Button announces the operation and treats its internal spinner as decorative.' } },
    ] },
    angular: {
      primitive: 'elemento status nativo',
      imports: `import { TisSpinner } from '@tis/angular/spinner'`,
      markup: `<tis-spinner size="md" label="Carregando resultados" />

<tis-spinner decorative />`,
    },
    web: {
      imports: `import 'ds-tis/css'`, storyId: 'components-spinner--playground',
      markup: `<span class="ds-spinner ds-spinner--md" role="status" aria-label="Carregando resultados"></span>`,
    },
    usageGuidance: {
      useWhen: [{ pt: 'Uma ação ou região aguarda sem progresso mensurável e a estrutura futura não é conhecida.', en: 'An action or region is waiting without measurable progress and the future structure is unknown.' }],
      avoidWhen: [{ pt: 'A estrutura do conteúdo é previsível ou o progresso pode ser quantificado.', en: 'The content structure is predictable or progress can be quantified.' }],
      note: { pt: 'Anuncie a espera uma vez; spinners dentro de Buttons ou regiões nomeadas devem ser decorativos.', en: 'Announce the wait once; spinners inside Buttons or named regions should be decorative.' },
    },
  },
  table: {
    description: { pt: 'Organiza dados relacionais para leitura e comparação por coluna.', en: 'Organizes relational data for reading and comparison by column.' },
    previewSize: 'medium',
    descriptions: {
      angular: { pt: 'Diretivas standalone sobre elementos table nativos; a aplicação controla dados, ordenação, seleção e ações.', en: 'Standalone directives over native table elements; the application controls data, sorting, selection, and actions.' },
    },
    examples: { angular: [
      { storyId: 'angular-table--tamanhos', size: 'large', title: { pt: 'Tamanhos', en: 'Sizes' }, description: { pt: 'Small mantém linhas de 40 px e Medium mantém 48 px sem alterar a semântica.', en: 'Small keeps 40 px rows and Medium keeps 48 px without changing semantics.' } },
      { storyId: 'angular-table--estados', size: 'medium', title: { pt: 'Estados', en: 'States' }, description: { pt: 'Linhas default e selected coexistem com ordenação e ações nativas.', en: 'Default and selected rows coexist with native sorting and actions.' } },
      { storyId: 'angular-table--overflow', size: 'medium', title: { pt: 'Overflow horizontal', en: 'Horizontal overflow' }, description: { pt: 'A região ocupa toda a largura disponível e concentra a rolagem quando as colunas excedem o container.', en: 'The region fills the available width and contains scrolling when columns exceed the container.' } },
    ] },
    angular: {
      primitive: 'elementos table nativos + diretivas Angular',
      imports: `import {
  TisTable, TisTableBody, TisTableCaption, TisTableCell,
  TisTableHeader, TisTableHeaderCell, TisTableRegion, TisTableRow,
} from '@tis/angular/table'`,
      markup: `<div tisTableRegion label="Tabela de clientes">
  <table tisTable size="md">
    <caption tisTableCaption>Clientes</caption>
    <thead tisTableHeader><tr tisTableRow><th tisTableHeaderCell>Cliente</th></tr></thead>
    <tbody tisTableBody><tr tisTableRow><td tisTableCell>Ana Silva</td></tr></tbody>
  </table>
</div>`,
    },
    web: {
      imports: `import 'ds-tis/css'`, storyId: 'components-table--playground',
      markup: `<div class="ds-table-region" role="region" aria-label="Tabela de clientes" tabindex="0">
  <table class="ds-table ds-table--md">…</table>
</div>`,
    },
    usageGuidance: {
      useWhen: [{ pt: 'Os dados têm colunas estáveis e precisam ser comparados entre linhas.', en: 'Data has stable columns and needs comparison across rows.' }],
      avoidWhen: [{ pt: 'O conteúdo é uma lista simples ou exige navegação de planilha editável.', en: 'The content is a simple list or requires editable spreadsheet navigation.' }],
      note: { pt: 'Preserve table nativa; ordenação, seleção, filtros e paginação pertencem à aplicação.', en: 'Preserve the native table; sorting, selection, filters, and pagination belong to the application.' },
    },
  },
  select: {
    description: {
      pt: 'Seleciona um único valor de uma lista conhecida sem aceitar entrada de texto.',
      en: 'Selects a single value from a known list without accepting text input.',
    },
    previewSize: 'medium',
    descriptions: {
      angular: {
        pt: 'Componente Angular standalone sobre select nativo, com Form Field completo, validação e ControlValueAccessor.',
        en: 'A standalone Angular component over a native select, with a complete Form Field, validation, and ControlValueAccessor.',
      },
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
    angular: {
      primitive: 'HTML select + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import { TisSelect, TisSelectIcon } from '@tis/angular/select'`,
      markup: `<tis-select
  name="country"
  label="País"
  [(ngModel)]="country"
  helperText="Selecione o país de residência."
  [required]="true"
>
  <svg tisSelectIcon aria-hidden="true">…</svg>
  <option value="br">Brasil</option>
  <option value="cl">Chile</option>
</tis-select>`,
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
      angular: {
        pt: 'Diretivas standalone sobre Angular Aria com foco roving, typeahead, comandos e escolhas radio/checkbox.',
        en: 'Standalone directives over Angular Aria with roving focus, typeahead, commands, and radio/checkbox choices.',
      },
    },
    examples: {
      angular: [
        {
          storyId: 'angular-menu--escolhas',
          size: 'medium',
          title: { pt: 'Escolhas · Angular', en: 'Choices · Angular' },
          description: {
            pt: 'Itens radio e checkbox executados com semântica e estado próprios.',
            en: 'Radio and checkbox items running with their own semantics and state.',
          },
        },
        {
          storyId: 'angular-menu--tamanhos',
          size: 'medium',
          title: { pt: 'Tamanhos · Angular', en: 'Sizes · Angular' },
          description: {
            pt: 'Triggers e surfaces sm, md e lg preservam alinhamento e largura útil.',
            en: 'Small, medium, and large triggers and surfaces preserve alignment and usable width.',
          },
        },
      ],
    },
    ark: {
      adapterImport: `import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from '@tis/react/ark/menu'`,
    },
    angular: {
      primitive: '@angular/aria/menu',
      imports: `import {
  TisActionMenu,
  TisMenu,
  TisMenuItem,
  TisMenuItemLabel,
  TisMenuTrigger,
} from '@tis/angular/menu'`,
      markup: `<div tisActionMenu align="start">
  <button tisMenuTrigger [menu]="menu.primitive">
    <span class="ds-button__label">Ações do projeto</span>
  </button>
  <div tisMenu #menu="tisMenu" aria-label="Ações do projeto">
    <button tisMenuItem value="edit" searchTerm="Editar">
      <span tisMenuItemLabel>Editar detalhes</span>
    </button>
  </div>
</div>`,
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
    examples: {
      web: [
        {
          storyId: 'components-modal--tamanhos',
          size: 'medium',
          title: { pt: 'Tamanhos', en: 'Sizes' },
          description: {
            pt: 'Três dialogs independentes executados pelo runtime HTML/CSS/JavaScript estável.',
            en: 'Three independent dialogs running with the stable HTML/CSS/JavaScript runtime.',
          },
        },
        {
          storyId: 'components-modal--corpo-customizado',
          size: 'large',
          title: { pt: 'Body customizado', en: 'Custom body' },
          description: {
            pt: 'Form Field, Input e Buttons públicos compostos dentro do runtime Web.',
            en: 'Public Form Field, Input, and Buttons composed inside the Web runtime.',
          },
        },
      ],
      ark: [
        {
          storyId: 'ark-modal--sizes',
          size: 'medium',
          title: { pt: 'Tamanhos', en: 'Sizes' },
          description: {
            pt: 'Três dialogs independentes controlados pelas parts Ark UI e pelo comportamento Zag.',
            en: 'Three independent dialogs controlled by Ark UI parts and Zag behavior.',
          },
        },
        {
          storyId: 'ark-modal--custom-body',
          size: 'large',
          title: { pt: 'Body customizado', en: 'Custom body' },
          description: {
            pt: 'Composição real de campo e ações dentro do adapter Ark/Zag.',
            en: 'A real field-and-actions composition inside the Ark/Zag adapter.',
          },
        },
      ],
      react: [
        {
          storyId: 'react-modal--sizes',
          size: 'medium',
          title: { pt: 'Tamanhos', en: 'Sizes' },
          description: {
            pt: 'Três dialogs independentes executados pela recipe shadcn com primitives Base UI.',
            en: 'Three independent dialogs running through the shadcn recipe with Base UI primitives.',
          },
        },
        {
          storyId: 'react-modal--custom-body',
          size: 'large',
          title: { pt: 'Body customizado', en: 'Custom body' },
          description: {
            pt: 'Field, Input e Button da própria saída React compostos dentro do Dialog.',
            en: 'Field, Input, and Button from the React output composed inside the Dialog.',
          },
        },
      ],
      angular: [
        {
          storyId: 'angular-modal--tamanhos',
          size: 'medium',
          title: { pt: 'Tamanhos', en: 'Sizes' },
          description: {
            pt: 'Três dialogs independentes executados pelo componente Angular com CDK Overlay.',
            en: 'Three independent dialogs running through the Angular component with CDK Overlay.',
          },
        },
        {
          storyId: 'angular-modal--corpo-customizado',
          size: 'large',
          title: { pt: 'Body customizado', en: 'Custom body' },
          description: {
            pt: 'Content projection com Form Field, Input e Buttons públicos dentro do Overlay Angular.',
            en: 'Content projection with public Form Field, Input, and Buttons inside the Angular Overlay.',
          },
        },
      ],
    },
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém foco, teclado, estado e bloqueio do conteúdo externo.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains focus, keyboard behavior, state, and outside-content blocking.',
      },
      angular: {
        pt: 'Componente standalone com CDK Overlay/Portal/A11y, focus trap, backdrop, Escape e retorno de foco.',
        en: 'Standalone component with CDK Overlay/Portal/A11y, focus trap, backdrop, Escape, and focus return.',
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
    angular: {
      primitive: '@angular/cdk/overlay + portal + a11y',
      imports: `import { TisButton } from '@tis/angular/button'
import {
  TisModal,
  TisModalBody,
  TisModalFooter,
  TisModalInitialFocus,
} from '@tis/angular/modal'`,
      markup: `<tis-button (click)="modalOpen.set(true)">Revisar alterações</tis-button>
<tis-modal
  #modal
  title="Revisar alterações"
  description="Confira os dados antes de continuar."
  size="md"
  [open]="modalOpen()"
  (openChange)="modalOpen.set($event)"
>
  <div tisModalBody>Conteúdo curto da tarefa.</div>
  <div tisModalFooter>
    <tis-button (click)="modal.close('api')">Guardar</tis-button>
  </div>
</tis-modal>`,
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
  pagination: {
    description: { pt: 'Navega entre subconjuntos discretos de resultados e identifica a página atual.', en: 'Navigates between discrete result sets and identifies the current page.' },
    previewSize: 'compact',
    descriptions: {
      angular: { pt: 'Componente standalone controlado pelo consumidor, com nav, links numerados, botões anterior/próximo e ellipsis não interativo.', en: 'Consumer-controlled standalone component with a nav, numbered links, previous/next buttons and non-interactive ellipses.' },
    },
    examples: { angular: [
      { storyId: 'angular-pagination--tamanhos', size: 'large', title: { pt: 'Tamanhos', en: 'Sizes' }, description: { pt: 'sm, md e lg mantêm a mesma semântica e permitem alterar cada página.', en: 'sm, md and lg preserve the same semantics and allow each page to change.' } },
      { storyId: 'angular-pagination--limites', size: 'large', title: { pt: 'Limites', en: 'Boundaries' }, description: { pt: 'Anterior fica desabilitado na primeira página e próxima fica desabilitado na última.', en: 'Previous is disabled on the first page and next is disabled on the last.' } },
    ] },
    angular: {
      primitive: 'HTML nav + links + buttons',
      imports: `import { TisPagination } from '@tis/angular/pagination'`,
      markup: `<tis-pagination
  [currentPage]="page()"
  [totalPages]="10"
  label="Páginas dos resultados"
  (pageChange)="page.set($event)"
/>`,
    },
    web: {
      imports: `import 'ds-tis/css'`, storyId: 'compositions-pagination--playground',
      markup: `<nav class="ds-pagination" aria-label="Paginação">
  <ul class="ds-pagination__list">…</ul>
</nav>`,
    },
    usageGuidance: {
      useWhen: [{ pt: 'O conjunto tem páginas discretas e o total ou a posição atual importam.', en: 'The set has discrete pages and the total or current position matters.' }],
      avoidWhen: [{ pt: 'O conteúdo é pequeno ou carregado progressivamente sem páginas.', en: 'Content is small or incrementally loaded without pages.' }],
      note: { pt: 'Dados, URL e currentPage pertencem ao consumidor; pageChange comunica apenas a intenção.', en: 'Data, URL and currentPage belong to the consumer; pageChange only communicates intent.' },
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
      angular: {
        pt: 'Componente standalone sobre CDK Overlay/Portal com hover, focus, delays, posicionamento, flip e Escape.',
        en: 'Standalone component over CDK Overlay/Portal with hover, focus, delays, positioning, flip, and Escape.',
      },
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
    angular: {
      primitive: '@angular/cdk/overlay + portal',
      imports: `import {
  TisTooltip,
  TisTooltipTrigger,
} from '@tis/angular/tooltip'`,
      markup: `<tis-tooltip content="Editar documento" placement="top">
  <button
    tisTooltipTrigger
    class="ds-button ds-button--outline ds-button--sm"
    type="button"
  >Editar</button>
</tis-tooltip>`,
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
    previewSize: 'compact',
    descriptions: {
      ark: {
        pt: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém seleção, roving tabindex, relações ARIA e teclado.',
        en: 'An independent React adapter where Ark UI provides the parts and Zag maintains selection, roving tabindex, ARIA relationships, and keyboard behavior.',
      },
      angular: {
        pt: 'Diretivas standalone sobre Angular Aria com seleção controlável, roving tabindex, relações ARIA e navegação por teclado.',
        en: 'Standalone directives over Angular Aria with controlled selection, roving tabindex, ARIA relationships, and keyboard navigation.',
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
    angular: {
      primitive: '@angular/aria/tabs',
      imports: `import {
  TisTab,
  TisTabList,
  TisTabPanel,
  TisTabs,
} from '@tis/angular/tabs'`,
      markup: `<div tisTabs>
  <div
    tisTabList
    aria-label="Seções do projeto"
    [(selectedTab)]="selectedTab"
    selectionMode="follow"
    [softDisabled]="false"
  >
    <button tisTab value="overview">Visão geral</button>
    <button tisTab value="team">Equipe</button>
    <button tisTab value="billing" [disabled]="true">Cobrança</button>
  </div>
  <div tisTabPanel value="overview">Resumo do projeto.</div>
  <div tisTabPanel value="team">Equipe do projeto.</div>
  <div tisTabPanel value="billing">Plano e faturamento.</div>
</div>`,
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
      angular: {
        pt: 'Serviço Angular standalone com regiões live nativas, fila limitada, timeout pausável e actions persistentes.',
        en: 'A standalone Angular service with native live regions, a bounded queue, pausable timeout, and persistent actions.',
      },
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
    angular: {
      primitive: 'Angular service + HTML live regions',
      imports: `import {
  TisToastRegion,
  TisToastService,
} from '@tis/angular/toast'`,
      markup: `<button type="button" (click)="toast.show({
  title: 'Preferências salvas',
  description: 'As alterações já estão disponíveis para esta conta.',
  type: 'success',
  actionLabel: 'Desfazer',
  duration: 0
})">
  Mostrar Toast
</button>
<tis-toast-region />`,
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
    angular: {
      primitive: 'HTML switch + Angular Forms',
      imports: `import { FormsModule } from '@angular/forms'
import { TisToggle } from '@tis/angular/toggle'`,
      markup: `<tis-toggle
  name="securityAlerts"
  [(ngModel)]="securityAlerts"
  description="Notifica sobre acessos suspeitos."
>
  Alertas de segurança
</tis-toggle>`,
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
