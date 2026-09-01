import { DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
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
import { TisPopover, TisPopoverActions, TisPopoverContent } from "@tis/angular/popover";

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
    TisPopover,
    TisPopoverActions,
    TisPopoverContent,
  ],
  template: `
    <main class="consumer-shell">
      <header class="consumer-header">
        <div>
          <p class="consumer-eyebrow">DS TIS · saída tecnológica</p>
          <h1>Angular nativo</h1>
          <p>Button, Accordion e Popover instalados a partir do pacote local.</p>
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
    </main>
  `,
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  readonly dark = signal(false);
  readonly loading = signal(false);
  readonly multiple = signal(false);
  readonly popoverOpen = signal(false);
  readonly submitted = signal(0);
  readonly lastCloseReason = signal("nenhum");

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
