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
import { TisButton, TisButtonIconStart } from "@tis/angular/button";
import { TisCheckbox } from "@tis/angular/checkbox";
import {
  TisModal,
  TisModalBody,
  TisModalFooter,
  TisModalInitialFocus,
} from "@tis/angular/modal";
import { TisPopover, TisPopoverActions, TisPopoverContent } from "@tis/angular/popover";
import { TisRadioGroup, TisRadioOption } from "@tis/angular/radio";
import { TisSelect, TisSelectIcon } from "@tis/angular/select";
import { TisToggle } from "@tis/angular/toggle";

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
    TisButton,
    TisButtonIconStart,
    TisCheckbox,
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
    TisToggle,
    FormsModule,
  ],
  template: `
    <main class="consumer-shell">
      <header class="consumer-header">
        <div>
          <p class="consumer-eyebrow">DS TIS · saída tecnológica</p>
          <h1>Angular nativo</h1>
          <p>Button, Accordion, Checkbox, Radio, Toggle, Select, Modal e Popover instalados a partir do pacote local.</p>
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
  readonly dark = signal(false);
  readonly checkboxSubmitted = signal(false);
  readonly loading = signal(false);
  readonly multiple = signal(false);
  readonly modalOpen = signal(false);
  readonly popoverOpen = signal(false);
  readonly radioSubmitted = signal(false);
  readonly selectSubmitted = signal(false);
  readonly submitted = signal(0);
  readonly notificationChannel = signal<string | null>(null);
  readonly securityAlerts = signal(true);
  readonly country = signal("");
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
}
