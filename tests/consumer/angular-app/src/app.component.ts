import { DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  TisAccordion,
  TisAccordionChevron,
  TisAccordionItem,
  TisAccordionLeadingIcon,
  TisAccordionPanel,
  TisAccordionTitle,
  TisAccordionTrigger,
} from "@tis/angular/accordion";
import {
  TisAlert,
  TisAlertClose,
  TisAlertContent,
  TisAlertDescription,
  TisAlertIcon,
  TisAlertTitle,
} from "@tis/angular/alert";
import { TisBadge } from "@tis/angular/badge";
import { TisButton, TisButtonIconStart } from "@tis/angular/button";
import { TisCheckbox } from "@tis/angular/checkbox";
import { TisCombobox, TisComboboxIcon, type TisComboboxOption } from "@tis/angular/combobox";
import { TisInput, TisInputIconStart } from "@tis/angular/input";
import {
  TisActionMenu,
  TisMenu,
  TisMenuGroupLabel,
  TisMenuItem,
  TisMenuItemIcon,
  TisMenuItemLabel,
  TisMenuSeparator,
  TisMenuShortcut,
  TisMenuTrigger,
} from "@tis/angular/menu";
import {
  TisModal,
  TisModalBody,
  TisModalFooter,
  TisModalInitialFocus,
} from "@tis/angular/modal";
import { TisPopover, TisPopoverActions, TisPopoverContent } from "@tis/angular/popover";
import { TisRadioGroup, TisRadioOption } from "@tis/angular/radio";
import { TisSelect, TisSelectIcon } from "@tis/angular/select";
import { TisTab, TisTabList, TisTabPanel, TisTabs } from "@tis/angular/tabs";
import { TisTextarea } from "@tis/angular/textarea";
import { TisToastRegion, TisToastService } from "@tis/angular/toast";
import { TisToggle } from "@tis/angular/toggle";
import { TisTooltip, TisTooltipTrigger } from "@tis/angular/tooltip";

@Component({
  selector: "app-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TisAccordion,
    TisAccordionChevron,
    TisAccordionItem,
    TisAccordionLeadingIcon,
    TisAccordionPanel,
    TisAccordionTitle,
    TisAccordionTrigger,
    TisAlert,
    TisAlertClose,
    TisAlertContent,
    TisAlertDescription,
    TisAlertIcon,
    TisAlertTitle,
    TisBadge,
    TisButton,
    TisButtonIconStart,
    TisCheckbox,
    TisCombobox,
    TisComboboxIcon,
    TisInput,
    TisInputIconStart,
    TisActionMenu,
    TisMenu,
    TisMenuGroupLabel,
    TisMenuItem,
    TisMenuItemIcon,
    TisMenuItemLabel,
    TisMenuSeparator,
    TisMenuShortcut,
    TisMenuTrigger,
    TisModal,
    TisModalBody,
    TisModalFooter,
    TisModalInitialFocus,
    TisPopover,
    TisPopoverActions,
    TisPopoverContent,
    TisRadioGroup,
    TisRadioOption,
    TisSelect,
    TisSelectIcon,
    TisTab,
    TisTabList,
    TisTabPanel,
    TisTabs,
    TisTextarea,
    TisToastRegion,
    TisToggle,
    TisTooltip,
    TisTooltipTrigger,
    FormsModule,
  ],
  template: `
    <main class="consumer-shell">
      <header class="consumer-header">
        <div>
          <p class="consumer-eyebrow">DS TIS · saída tecnológica</p>
          <h1>Angular nativo</h1>
          <p>Dezassete componentes Angular nativos instalados a partir do pacote local, sem dependências de outros frameworks.</p>
        </div>
        <tis-button variant="ghost" size="sm" (click)="toggleTheme()">
          {{ dark() ? "Tema claro" : "Tema escuro" }}
        </tis-button>
      </header>

      <section class="consumer-section" aria-labelledby="button-heading">
        <div class="consumer-section__heading">
          <h2 id="button-heading">Button</h2>
          <span class="consumer-status">HTML nativo</span>
        </div>
        <form class="consumer-row" (submit)="submit($event)" data-testid="button-form">
          <tis-button type="submit" variant="brand">
            <svg tisButtonIconStart viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" />
            </svg>
            Guardar registo
          </tis-button>
          <tis-button variant="outline" [loading]="loading()" loadingLabel="A guardar">
            Estado assíncrono
          </tis-button>
          <span role="status" data-testid="submit-count">Submissões: {{ submitted() }}</span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="alert-heading">
        <div class="consumer-section__heading">
          <h2 id="alert-heading">Alert</h2>
          <span class="consumer-status">Live region nativa</span>
        </div>
        @if (alertVisible()) {
          <tis-alert tone="success" variant="subtle" data-testid="alert">
            <span tisAlertIcon>
              <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div tisAlertContent>
              <strong tisAlertTitle>Configuração salva</strong>
              <span tisAlertDescription>As preferências já estão disponíveis.</span>
            </div>
            <button tisAlertClose aria-label="Fechar alerta" (click)="alertVisible.set(false)">
              <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m7 7 10 10M17 7 7 17" stroke-linecap="round" />
              </svg>
            </button>
          </tis-alert>
        } @else {
          <p role="status" data-testid="alert-dismissed">Alerta dispensado.</p>
        }
      </section>

      <section class="consumer-section" aria-labelledby="badge-heading">
        <div class="consumer-section__heading">
          <h2 id="badge-heading">Badge</h2>
          <span class="consumer-status">Apresentacional</span>
        </div>
        <div class="consumer-row" data-testid="badge-examples">
          <tis-badge tone="success" variant="subtle">Aprovado</tis-badge>
          <tis-badge tone="warning" variant="solid">Pendente</tis-badge>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="input-heading">
        <div class="consumer-section__heading">
          <h2 id="input-heading">Input Text</h2>
          <span class="consumer-status">HTML nativo + Angular Forms</span>
        </div>
        <form
          class="consumer-row consumer-row--selection"
          data-testid="input-form"
          novalidate
          (submit)="inputSubmitted.set(true); $event.preventDefault()"
        >
          <tis-input
            name="email"
            label="E-mail"
            type="email"
            autocomplete="email"
            [ngModel]="email()"
            (ngModelChange)="email.set($event)"
            [required]="true"
            [invalid]="inputSubmitted() && !email()"
            helperText="Use seu e-mail corporativo."
            errorMessage="Digite um e-mail para continuar"
          >
            <svg tisInputIconStart viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </tis-input>
          <tis-button type="submit" size="sm">Guardar e-mail</tis-button>
          <span role="status" data-testid="input-value">
            E-mail: {{ email() || "nenhum" }}
          </span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="textarea-heading">
        <div class="consumer-section__heading">
          <h2 id="textarea-heading">Textarea</h2>
          <span class="consumer-status">HTML nativo + Angular Forms</span>
        </div>
        <form
          class="consumer-row consumer-row--selection"
          data-testid="textarea-form"
          novalidate
          (submit)="textareaSubmitted.set(true); $event.preventDefault()"
        >
          <tis-textarea
            name="message"
            label="Mensagem"
            [ngModel]="message()"
            (ngModelChange)="message.set($event)"
            [required]="true"
            [invalid]="textareaSubmitted() && !message()"
            [maxLength]="500"
            [showCounter]="true"
            helperText="Explique o contexto em poucas linhas."
            errorMessage="Escreva uma mensagem para continuar"
          />
          <tis-button type="submit" size="sm">Guardar mensagem</tis-button>
          <span role="status" data-testid="textarea-value">
            Caracteres: {{ message().length }}
          </span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="checkbox-heading">
        <div class="consumer-section__heading">
          <h2 id="checkbox-heading">Checkbox</h2>
          <span class="consumer-status">HTML nativo + Angular Forms</span>
        </div>
        <form
          class="consumer-row consumer-row--checkbox"
          data-testid="checkbox-form"
          novalidate
          (submit)="checkboxSubmitted.set(true); $event.preventDefault()"
        >
          <tis-checkbox
            name="weeklySummary"
            [ngModel]="weeklySummary()"
            (ngModelChange)="weeklySummary.set($event)"
            [required]="true"
            [invalid]="checkboxSubmitted() && !weeklySummary()"
            description="Receba as alterações consolidadas por e-mail."
            helperText="Pode alterar esta preferência a qualquer momento."
            errorMessage="Selecione esta opção para continuar"
          >
            Receber resumo semanal
          </tis-checkbox>
          <tis-button type="submit" size="sm">Guardar preferência</tis-button>
          <span role="status" data-testid="checkbox-value">
            Selecionado: {{ weeklySummary() ? "sim" : "não" }}
          </span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="radio-heading">
        <div class="consumer-section__heading">
          <h2 id="radio-heading">Radio</h2>
          <span class="consumer-status">HTML nativo + Angular Forms</span>
        </div>
        <form
          class="consumer-row consumer-row--selection"
          data-testid="radio-form"
          novalidate
          (submit)="radioSubmitted.set(true); $event.preventDefault()"
        >
          <tis-radio-group
            legend="Canal de notificação"
            name="notificationChannel"
            [ngModel]="notificationChannel()"
            (ngModelChange)="notificationChannel.set($event)"
            [required]="true"
            [invalid]="radioSubmitted() && !notificationChannel()"
            errorMessage="Escolha um canal para continuar"
          >
            <tis-radio-option value="email" description="Resposta em até um dia útil.">E-mail</tis-radio-option>
            <tis-radio-option value="sms">SMS</tis-radio-option>
            <tis-radio-option value="push" [disabled]="true">Push indisponível</tis-radio-option>
          </tis-radio-group>
          <tis-button type="submit" size="sm">Guardar canal</tis-button>
          <span role="status" data-testid="radio-value">
            Canal: {{ notificationChannel() || "nenhum" }}
          </span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="toggle-heading">
        <div class="consumer-section__heading">
          <h2 id="toggle-heading">Toggle</h2>
          <span class="consumer-status">HTML nativo + Angular Forms</span>
        </div>
        <div class="consumer-row consumer-row--selection">
          <tis-toggle
            name="securityAlerts"
            [ngModel]="securityAlerts()"
            (ngModelChange)="securityAlerts.set($event)"
            description="Notifica sobre acessos suspeitos."
            helperText="A alteração é aplicada imediatamente."
          >
            Alertas de segurança
          </tis-toggle>
          <span role="status" data-testid="toggle-value">
            Alertas: {{ securityAlerts() ? "ligados" : "desligados" }}
          </span>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="select-heading">
        <div class="consumer-section__heading">
          <h2 id="select-heading">Select</h2>
          <span class="consumer-status">HTML nativo + Angular Forms</span>
        </div>
        <form
          class="consumer-row consumer-row--selection"
          data-testid="select-form"
          novalidate
          (submit)="selectSubmitted.set(true); $event.preventDefault()"
        >
          <tis-select
            name="country"
            label="País"
            [ngModel]="country()"
            (ngModelChange)="country.set($event)"
            [required]="true"
            [invalid]="selectSubmitted() && !country()"
            helperText="Selecione o país de residência."
            errorMessage="Selecione um país para continuar"
          >
            <svg tisSelectIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
            </svg>
            <option value="br">Brasil</option>
            <option value="cl">Chile</option>
            <option value="pt">Portugal</option>
            <option value="unavailable" disabled>Indisponível</option>
          </tis-select>
          <tis-button type="submit" size="sm">Guardar país</tis-button>
          <span role="status" data-testid="select-value">
            País: {{ country() || "nenhum" }}
          </span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="combobox-heading">
        <div class="consumer-section__heading">
          <h2 id="combobox-heading">Combobox</h2>
          <span class="consumer-status">Angular Aria + Angular Forms</span>
        </div>
        <form
          class="consumer-row consumer-row--selection"
          data-testid="combobox-form"
          novalidate
          (submit)="comboboxSubmitted.set(true); $event.preventDefault()"
        >
          <tis-combobox
            name="searchCountry"
            label="Buscar país"
            [options]="countries"
            [ngModel]="searchCountry()"
            (ngModelChange)="searchCountry.set($event)"
            [required]="true"
            [invalid]="comboboxSubmitted() && !searchCountry()"
            helperText="Digite para filtrar as opções."
            errorMessage="Selecione um país para continuar"
          >
            <svg tisComboboxIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </tis-combobox>
          <tis-button type="submit" size="sm">Guardar país filtrado</tis-button>
          <span role="status" data-testid="combobox-value">
            País filtrado: {{ searchCountry() || "nenhum" }}
          </span>
        </form>
      </section>

      <section class="consumer-section" aria-labelledby="tooltip-heading">
        <div class="consumer-section__heading">
          <h2 id="tooltip-heading">Tooltip</h2>
          <span class="consumer-status">CDK Overlay</span>
        </div>
        <tis-tooltip content="Editar documento" placement="top" [closeDelay]="300">
          <button
            tisTooltipTrigger
            class="ds-button ds-button--outline ds-button--sm"
            type="button"
          >Editar</button>
        </tis-tooltip>
      </section>

      <section class="consumer-section" aria-labelledby="toast-heading">
        <div class="consumer-section__heading">
          <h2 id="toast-heading">Toast</h2>
          <span class="consumer-status">Angular service + live regions</span>
        </div>
        <div class="consumer-row">
          <tis-button variant="outline" (click)="showToast()">Mostrar Toast</tis-button>
          <span class="consumer-meta" role="status" data-testid="toast-action-count">
            Ações executadas: {{ toastActionCount() }}
          </span>
        </div>
        <tis-toast-region />
      </section>

      <section class="consumer-section" aria-labelledby="menu-heading">
        <div class="consumer-section__heading">
          <h2 id="menu-heading">Menu</h2>
          <span class="consumer-status">Angular Aria</span>
        </div>
        <div class="consumer-row">
          <div tisActionMenu align="start" data-testid="menu">
            <button tisMenuTrigger [menu]="menu.primitive" size="md">
              <span class="ds-button__label">Ações do documento</span>
              <svg class="ds-button__icon ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div
              tisMenu
              #menu="tisMenu"
              aria-label="Ações do documento"
              (itemSelected)="lastMenuAction.set($event.toString())"
            >
              <div tisMenuGroupLabel>Documento</div>
              <button tisMenuItem value="edit" searchTerm="Editar">
                <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                <span tisMenuItemLabel>Editar</span>
                <span tisMenuShortcut>⌘E</span>
              </button>
              <button tisMenuItem value="transfer" searchTerm="Transferir" [disabled]="true">
                <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="m17 3 4 4-4 4" /><path d="M3 7h18" />
                </svg>
                <span tisMenuItemLabel>Transferir</span>
                <span tisMenuShortcut>Indisponível</span>
              </button>
              <div tisMenuSeparator></div>
              <button tisMenuItem value="delete" searchTerm="Excluir" [destructive]="true">
                <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" />
                </svg>
                <span tisMenuItemLabel>Excluir</span>
              </button>
            </div>
          </div>
          <span role="status" data-testid="menu-action">Última ação: {{ lastMenuAction() }}</span>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="tabs-heading">
        <div class="consumer-section__heading">
          <h2 id="tabs-heading">Tabs</h2>
          <span class="consumer-status">Angular Aria</span>
        </div>
        <div tisTabs data-testid="tabs">
          <div
            tisTabList
            aria-label="Seções do projeto"
            [selectedTab]="selectedTab()"
            (selectedTabChange)="selectedTab.set($event || 'overview')"
            selectionMode="follow"
            focusMode="roving"
            [softDisabled]="false"
          >
            <button tisTab value="overview">Visão geral</button>
            <button tisTab value="team">Equipe</button>
            <button tisTab value="billing" [disabled]="true">Cobrança</button>
          </div>
          <div tisTabPanel value="overview">Resumo do projeto e atividade recente.</div>
          <div tisTabPanel value="team">Pessoas, funções e permissões do projeto.</div>
          <div tisTabPanel value="billing">Plano, faturas e forma de pagamento.</div>
          <p class="consumer-meta" role="status">Selecionada: {{ selectedTab() }}</p>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="accordion-heading">
        <div class="consumer-section__heading">
          <h2 id="accordion-heading">Accordion</h2>
          <label class="consumer-switch">
            <input type="checkbox" [checked]="multiple()" (change)="toggleMultiple()" />
            Permitir múltiplos
          </label>
        </div>
        <div
          tisAccordion
          [multiExpandable]="multiple()"
          [softDisabled]="false"
          [wrap]="true"
          data-testid="accordion"
        >
          <div tisAccordionItem>
            <button
              tisAccordionTrigger
              [panel]="billingPanel.ariaPanel"
              [expanded]="true"
            >
              <svg tisAccordionLeadingIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7h18M5 11h14v8H5z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span tisAccordionTitle>Facturação</span>
              <svg tisAccordionChevron viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div tisAccordionPanel #billingPanel="tisAccordionPanel">
              <p>Consulte facturas, dados fiscais e métodos de pagamento.</p>
            </div>
          </div>
          <div tisAccordionItem>
            <button tisAccordionTrigger [panel]="securityPanel.ariaPanel">
              <svg tisAccordionLeadingIcon viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7z" stroke-linejoin="round" />
              </svg>
              <span tisAccordionTitle>Segurança</span>
              <svg tisAccordionChevron viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div tisAccordionPanel #securityPanel="tisAccordionPanel">
              <p>Configure autenticação e consulte sessões activas.</p>
            </div>
          </div>
          <div tisAccordionItem>
            <button tisAccordionTrigger [panel]="blockedPanel.ariaPanel" [disabled]="true">
              <span tisAccordionTitle>Configuração bloqueada</span>
              <svg tisAccordionChevron viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div tisAccordionPanel #blockedPanel="tisAccordionPanel">
              <p>Este conteúdo não está disponível.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="consumer-section consumer-section--popover" aria-labelledby="popover-heading">
        <div class="consumer-section__heading">
          <h2 id="popover-heading">Popover</h2>
          <span class="consumer-status">CDK Overlay</span>
        </div>
        <tis-popover
          #popover
          title="Preferências do projecto"
          triggerLabel="Abrir preferências"
          placement="bottom"
          [open]="popoverOpen()"
          (openChange)="popoverOpen.set($event)"
          (closed)="lastCloseReason.set($event.reason)"
        >
          <div tisPopoverContent>
            <p>Defina como as notificações deste projecto serão entregues.</p>
            <label class="consumer-field">
              <span>Canal</span>
              <select data-tis-popover-initial-focus>
                <option>E-mail</option>
                <option>Aplicação</option>
              </select>
            </label>
          </div>
          <div tisPopoverActions>
            <tis-button size="sm" variant="brand" (click)="popover.close('api')">
              Aplicar
            </tis-button>
          </div>
        </tis-popover>
        <p class="consumer-meta" data-testid="close-reason">Último fecho: {{ lastCloseReason() }}</p>
      </section>

      <section class="consumer-section" aria-labelledby="modal-heading">
        <div class="consumer-section__heading">
          <h2 id="modal-heading">Modal</h2>
          <span class="consumer-status">CDK Overlay + A11y</span>
        </div>
        <div class="consumer-row">
          <tis-button
            data-testid="modal-trigger"
            variant="outline"
            (click)="modalOpen.set(true)"
          >
            Revisar alterações
          </tis-button>
          <tis-modal
            #modal
            title="Revisar alterações"
            description="Confira os dados antes de continuar."
            size="md"
            [open]="modalOpen()"
            (openChange)="modalOpen.set($event)"
            (closed)="lastModalCloseReason.set($event.reason)"
          >
            <div tisModalBody>
              <div class="ds-field">
                <label class="ds-field__label" for="consumer-modal-name">Nome</label>
                <div class="ds-input ds-input--md">
                  <input
                    tisModalInitialFocus
                    class="ds-input__field"
                    id="consumer-modal-name"
                    type="text"
                    value="Relatório mensal"
                  >
                </div>
                <p class="ds-field__helper">A alteração pode ser revista antes de guardar.</p>
              </div>
            </div>
            <div tisModalFooter>
              <tis-button size="sm" variant="outline" (click)="modal.close('api')">Cancelar</tis-button>
              <tis-button size="sm" variant="brand" (click)="modal.close('api')">Guardar</tis-button>
            </div>
          </tis-modal>
          <p class="consumer-meta" data-testid="modal-close-reason">
            Último fecho: {{ lastModalCloseReason() }}
          </p>
        </div>
      </section>
    </main>
  `,
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  readonly toastService = inject(TisToastService);
  readonly alertVisible = signal(true);
  readonly dark = signal(false);
  readonly checkboxSubmitted = signal(false);
  readonly comboboxSubmitted = signal(false);
  readonly email = signal("");
  readonly inputSubmitted = signal(false);
  readonly loading = signal(false);
  readonly lastMenuAction = signal("nenhuma");
  readonly message = signal("");
  readonly multiple = signal(false);
  readonly modalOpen = signal(false);
  readonly popoverOpen = signal(false);
  readonly radioSubmitted = signal(false);
  readonly selectSubmitted = signal(false);
  readonly selectedTab = signal("overview");
  readonly submitted = signal(0);
  readonly textareaSubmitted = signal(false);
  readonly toastActionCount = signal(0);
  readonly notificationChannel = signal<string | null>(null);
  readonly securityAlerts = signal(true);
  readonly country = signal("");
  readonly searchCountry = signal<string | null>(null);
  readonly countries: readonly TisComboboxOption[] = [
    { label: "Argentina", value: "ar" },
    { label: "Brasil", value: "br" },
    { label: "Chile", value: "cl" },
    { disabled: true, label: "Indisponível", value: "disabled" },
    { label: "Portugal", value: "pt" },
  ];
  readonly weeklySummary = signal(false);
  readonly lastCloseReason = signal("nenhum");
  readonly lastModalCloseReason = signal("nenhum");

  toggleTheme(): void {
    this.dark.update((value) => !value);
    this.document.documentElement.dataset["theme"] = this.dark() ? "dark" : "light";
  }

  toggleMultiple(): void {
    this.multiple.update((value) => !value);
  }

  submit(event: SubmitEvent): void {
    event.preventDefault();
    this.submitted.update((value) => value + 1);
  }

  showToast(): void {
    this.toastService.show({
      title: "Alterações salvas",
      description: "A alteração foi aplicada e pode ser revertida.",
      type: "success",
      style: "subtle",
      actionLabel: "Desfazer",
      duration: 0,
      onAction: () => this.toastActionCount.update((value) => value + 1),
    });
  }
}
