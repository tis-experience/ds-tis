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
import { TisAvatar } from "@tis/angular/avatar";
import { TisBadge } from "@tis/angular/badge";
import { TisBreadcrumb, TisBreadcrumbLink, TisBreadcrumbCurrent, TisBreadcrumbSeparator } from "@tis/angular/breadcrumb";
import { TisButton, TisButtonIconStart } from "@tis/angular/button";
import {
  TisCard,
  TisCardContainer,
  TisCardContent,
  TisCardDescription,
  TisCardFooter,
  TisCardHeader,
  TisCardTitle,
} from "@tis/angular/card";
import { TisCheckbox } from "@tis/angular/checkbox";
import { TisCombobox, TisComboboxIcon, type TisComboboxOption } from "@tis/angular/combobox";
import { TisDivider } from "@tis/angular/divider";
import { TisFormField } from "@tis/angular/form-field";
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
import { TisPagination } from "@tis/angular/pagination";
import { TisRadioGroup, TisRadioOption } from "@tis/angular/radio";
import { TisSelect, TisSelectIcon } from "@tis/angular/select";
import { TisSkeleton, TisSkeletonGroup } from "@tis/angular/skeleton";
import { TisSpinner } from "@tis/angular/spinner";
import {
  TisTable,
  TisTableBody,
  TisTableCaption,
  TisTableCell,
  TisTableHeader,
  TisTableHeaderCell,
  TisTableRegion,
  TisTableRow,
  TisTableSort,
  TisTableSortIcon,
  type TisTableSortDirection,
} from "@tis/angular/table";
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
    TisAvatar,
    TisBadge,
    TisBreadcrumb,
    TisBreadcrumbLink,
    TisBreadcrumbCurrent,
    TisBreadcrumbSeparator,
    TisButton,
    TisButtonIconStart,
    TisCard,
    TisCardContainer,
    TisCardContent,
    TisCardDescription,
    TisCardFooter,
    TisCardHeader,
    TisCardTitle,
    TisCheckbox,
    TisCombobox,
    TisComboboxIcon,
    TisDivider,
    TisFormField,
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
    TisPagination,
    TisRadioGroup,
    TisRadioOption,
    TisSelect,
    TisSelectIcon,
    TisSkeleton,
    TisSkeletonGroup,
    TisSpinner,
    TisTable,
    TisTableBody,
    TisTableCaption,
    TisTableCell,
    TisTableHeader,
    TisTableHeaderCell,
    TisTableRegion,
    TisTableRow,
    TisTableSort,
    TisTableSortIcon,
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
          <p>Componentes Angular nativos instalados a partir do pacote local, sem dependências de outros frameworks.</p>
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

      <section class="consumer-section" aria-labelledby="card-heading">
        <div class="consumer-section__heading">
          <h2 id="card-heading">Card</h2>
          <span class="consumer-status">Elemento semântico + composição</span>
        </div>
        <div class="consumer-card-grid">
          <article tisCard variant="outlined" data-testid="card-static">
            <div tisCardContainer>
              <header tisCardHeader>
                <h3 tisCardTitle>Uso da organização</h3>
                <p tisCardDescription>Resumo atualizado há poucos minutos.</p>
              </header>
              <div tisCardContent><p>128 licenças ativas de 150 disponíveis.</p></div>
              <footer tisCardFooter><tis-badge tone="success" variant="subtle">Saudável</tis-badge></footer>
            </div>
          </article>
          <button
            tisCard
            type="button"
            variant="interactive"
            data-testid="card-interactive"
            [selected]="cardSelected()"
            (click)="cardSelected.set(!cardSelected())"
          >
            <div tisCardContainer>
              <header tisCardHeader>
                <h3 tisCardTitle>Segurança</h3>
                <p tisCardDescription>Abrir configurações de acesso.</p>
              </header>
              <div tisCardContent><p>{{ cardSelected() ? "Selecionado" : "Selecionar card" }}</p></div>
            </div>
          </button>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="divider-heading">
        <div class="consumer-section__heading">
          <h2 id="divider-heading">Divider</h2>
          <span class="consumer-status">HTML hr nativo</span>
        </div>
        <div class="consumer-divider-stack">
          <p>Configurações gerais</p>
          <hr tisDivider data-testid="divider-horizontal">
          <div class="consumer-divider-toolbar" role="toolbar" aria-label="Ações de edição">
            <tis-button size="sm" variant="ghost">Recortar</tis-button>
            <tis-button size="sm" variant="ghost">Copiar</tis-button>
            <hr tisDivider orientation="vertical" [decorative]="true" data-testid="divider-vertical">
            <tis-button size="sm" variant="ghost">Desfazer</tis-button>
          </div>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="avatar-heading">
        <h2 id="avatar-heading">Avatar</h2>
        <div class="consumer-row">
          <tis-avatar label="Ana Lima" initials="AL" size="sm" />
          <tis-avatar label="Ana Lima, foto" initials="AL" content="image" [src]="avatarSource()" data-testid="avatar-image" />
          <tis-avatar label="Pessoa sem foto" content="icon" size="lg" />
          <tis-avatar label="Ana Lima" initials="AL" decorative /><span>Ana Lima</span>
        </div>
        <div class="consumer-row">
          <button class="ds-button ds-button--brand ds-button--sm" type="button" (click)="avatarSource.set('data:image/png;base64,invalid')">Simular falha da foto</button>
          <button class="ds-button ds-button--outline ds-button--sm" type="button" (click)="avatarSource.set(avatarImage)">Restaurar foto</button>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="breadcrumb-heading">
        <h2 id="breadcrumb-heading">Breadcrumb</h2>
        <nav tisBreadcrumb label="Caminho do projeto">
          <a tisBreadcrumbLink href="#breadcrumb-home">Início</a><span tisBreadcrumbSeparator>/</span>
          <a tisBreadcrumbLink href="#breadcrumb-projects">Projetos</a><span tisBreadcrumbSeparator>/</span>
          <span tisBreadcrumbCurrent>{{ breadcrumbPage() }}</span>
        </nav>
        <p id="breadcrumb-home">Visão inicial</p>
        <p id="breadcrumb-projects">Lista de projetos</p>
        <button class="ds-button ds-button--brand ds-button--sm" type="button" data-testid="breadcrumb-after">Próxima ação</button>
      </section>

      <section class="consumer-section" aria-labelledby="pagination-heading">
        <h2 id="pagination-heading">Pagination</h2>
        <div class="consumer-pagination-stage">
          <tis-pagination [currentPage]="resultsPage()" [totalPages]="10" label="Páginas dos resultados"
            (pageChange)="resultsPage.set($event)" />
        </div>
        <p aria-live="polite" data-testid="pagination-result">Resultados {{ (resultsPage() - 1) * 10 + 1 }}–{{ resultsPage() * 10 }}</p>
      </section>

      <section class="consumer-section" aria-labelledby="skeleton-heading">
        <h2 id="skeleton-heading">Skeleton</h2>
        @if (profileLoading()) {
          <div tisSkeletonGroup label="Carregando perfil" class="consumer-skeleton-card" data-testid="skeleton-loading">
            <div class="consumer-skeleton-profile"><tis-skeleton type="circle" /><div class="consumer-skeleton-lines"><tis-skeleton type="text" width="65%" /><tis-skeleton type="text" width="40%" /></div></div>
            <tis-skeleton type="rectangle" />
          </div>
        } @else {
          <article class="consumer-skeleton-card" data-testid="skeleton-content">
            <h3>Ana Lima</h3><p>Product Designer</p>
          </article>
        }
        <button class="ds-button ds-button--brand ds-button--sm" type="button" (click)="profileLoading.set(!profileLoading())">
          {{ profileLoading() ? "Concluir carregamento" : "Reiniciar carregamento" }}
        </button>
      </section>

      <section class="consumer-section" aria-labelledby="spinner-heading">
        <h2 id="spinner-heading">Spinner</h2>
        <div class="consumer-spinner-row" data-testid="spinner-examples">
          <tis-spinner size="sm" label="Carregando item" />
          <tis-spinner size="md" label="Carregando secção" />
          <tis-spinner size="lg" label="Carregando página" />
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="table-heading">
        <h2 id="table-heading">Table</h2>
        <div tisTableRegion label="Tabela de clientes" data-testid="table-region">
          <table tisTable size="md">
            <caption tisTableCaption>Clientes</caption>
            <thead tisTableHeader><tr tisTableRow>
              <th tisTableHeaderCell sortable [sort]="tableSort()">
                <button tisTableSort aria-label="Ordenar por Cliente" (click)="toggleTableSort()">
                  <span>Cliente</span>
                  <svg tisTableSortIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                </button>
              </th>
              <th tisTableHeaderCell>Status</th><th tisTableHeaderCell>E-mail</th><th tisTableHeaderCell align="end">Ações</th>
            </tr></thead>
            <tbody tisTableBody>
              @for (row of tableRows(); track row.email) {
                <tr tisTableRow [selected]="row.email === 'bruno.lima@tis.com.br'">
                  <td tisTableCell>{{ row.name }}</td>
                  <td tisTableCell><tis-badge [tone]="row.status === 'Ativo' ? 'success' : 'warning'" variant="subtle">{{ row.status }}</tis-badge></td>
                  <td tisTableCell>{{ row.email }}</td>
                  <td tisTableCell control align="end"><tis-button variant="ghost" size="sm">Abrir</tis-button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="consumer-section" aria-labelledby="form-field-heading">
        <h2 id="form-field-heading">Form Field</h2>
        <form class="ds-field" novalidate (ngSubmit)="fieldSubmitted.set(true)">
          <tis-form-field #field="tisFormField" label="Nome para contato" required
            helperText="Use seu nome completo." errorMessage="Informe seu nome."
            [invalid]="fieldSubmitted() && !contactName().trim()">
            <div class="ds-input" [class.ds-input--error]="field.invalid()">
              <input class="ds-input__field" name="contactName" [(ngModel)]="contactName"
                [id]="field.controlId()" [required]="field.required()" autocomplete="name"
                [attr.aria-describedby]="field.describedBy()" [attr.aria-invalid]="field.ariaInvalid()">
            </div>
          </tis-form-field>
          <div><tis-button type="submit">Validar nome</tis-button></div>
        </form>
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
  readonly avatarImage = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#cbd5e1"/><circle cx="40" cy="28" r="14" fill="#475569"/><path d="M12 80V66a28 28 0 0 1 56 0v14" fill="#475569"/></svg>');
  readonly avatarSource = signal(this.avatarImage);
  private readonly document = inject(DOCUMENT);
  readonly toastService = inject(TisToastService);
  readonly alertVisible = signal(true);
  readonly cardSelected = signal(false);
  readonly dark = signal(false);
  readonly checkboxSubmitted = signal(false);
  readonly comboboxSubmitted = signal(false);
  readonly email = signal("");
  readonly contactName = signal("");
  readonly breadcrumbPage = signal("Design System");
  readonly resultsPage = signal(5);
  readonly profileLoading = signal(true);
  readonly tableSort = signal<TisTableSortDirection>("none");
  readonly tableRows = signal([
    { name: "Ana Silva", status: "Ativo", email: "ana.silva@tis.com.br" },
    { name: "Bruno Lima", status: "Pendente", email: "bruno.lima@tis.com.br" },
    { name: "Carla Rocha", status: "Ativo", email: "carla.rocha@tis.com.br" },
  ]);
  readonly fieldSubmitted = signal(false);
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

  toggleTableSort(): void {
    const direction = this.tableSort() === "ascending" ? "descending" : "ascending";
    this.tableSort.set(direction);
    this.tableRows.update((rows) => [...rows].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR") * (direction === "descending" ? -1 : 1)));
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
