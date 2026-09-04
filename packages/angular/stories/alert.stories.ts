import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisAlert,
  TisAlertActions,
  TisAlertClose,
  TisAlertContent,
  TisAlertDescription,
  TisAlertIcon,
  TisAlertTitle,
  type TisAlertTone,
  type TisAlertVariant,
} from "../alert/src/public-api";
import { TisButton } from "../button/src/public-api";

interface AlertArgs {
  description: string;
  dismissible: boolean;
  title: string;
  tone: TisAlertTone;
  variant: TisAlertVariant;
}

const imports = [
  TisAlert,
  TisAlertActions,
  TisAlertClose,
  TisAlertContent,
  TisAlertDescription,
  TisAlertIcon,
  TisAlertTitle,
  TisButton,
];
const tones: readonly TisAlertTone[] = ["error", "info", "success", "warning"];

const toneIconTemplate = `
  @switch (tone) {
    @case ('success') {
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    }
    @case ('warning') {
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />
        <path d="M12 9v4M12 17h.01" stroke-linecap="round" />
      </svg>
    }
    @case ('error') {
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />
        <path d="M12 9v4M12 17h.01" stroke-linecap="round" />
      </svg>
    }
    @default {
      <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
      </svg>
    }
  }
`;
const closeTemplate = `
  <svg class="ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m7 7 10 10M17 7 7 17" stroke-linecap="round" />
  </svg>
`;

const meta: Meta<AlertArgs> = {
  id: "angular-alert",
  title: "Componentes/Alert",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports })],
  args: {
    description: "As preferências já estão disponíveis.",
    dismissible: true,
    title: "Configuração salva",
    tone: "success",
    variant: "subtle",
  },
  argTypes: {
    tone: { control: "select", options: tones },
    variant: { control: "radio", options: ["solid", "subtle"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Alert Angular standalone, composto pelas partes públicas do DS e com semântica de live region por tom.",
      },
    },
  },
  render: (args) => ({
    props: { ...args, visible: true },
    template: `
      @if (visible) {
        <tis-alert [tone]="tone" [variant]="variant">
          <span tisAlertIcon>${toneIconTemplate}</span>
          <div tisAlertContent>
            <strong tisAlertTitle>{{ title }}</strong>
            <span tisAlertDescription>{{ description }}</span>
          </div>
          @if (dismissible) {
            <button tisAlertClose aria-label="Fechar alerta" (click)="visible = false">
              ${closeTemplate}
            </button>
          }
        </tis-alert>
      } @else {
        <p role="status">Alerta dispensado.</p>
      }
    `,
  }),
};

export default meta;
type Story = StoryObj<AlertArgs>;

export const Playground: Story = {};

export const Tons: Story = {
  render: () => ({
    props: { tones },
    template: `
      <div class="ds-angular-alert-grid">
        @for (variant of ['subtle', 'solid']; track variant) {
          <section>
            <h2>{{ variant === 'subtle' ? 'Subtle' : 'Solid' }}</h2>
            <div class="ds-angular-alert-stack">
              @for (tone of tones; track tone) {
                <tis-alert [tone]="tone" [variant]="variant">
                  <span tisAlertIcon>${toneIconTemplate}</span>
                  <div tisAlertContent>
                    <strong tisAlertTitle>{{ tone }}</strong>
                    <span tisAlertDescription>Mensagem contextual do sistema.</span>
                  </div>
                </tis-alert>
              }
            </div>
          </section>
        }
      </div>
    `,
  }),
};

export const ComAcao: Story = {
  render: () => ({
    template: `
      <tis-alert tone="info" variant="subtle">
        <span tisAlertIcon>${toneIconTemplate}</span>
        <div tisAlertContent>
          <strong tisAlertTitle>Atualização disponível</strong>
          <span tisAlertDescription>Recarregue para usar a versão mais recente.</span>
          <div tisAlertActions>
            <tis-button size="sm" variant="outline">Recarregar</tis-button>
          </div>
        </div>
        <button tisAlertClose aria-label="Fechar alerta">${closeTemplate}</button>
      </tis-alert>
    `,
  }),
};
