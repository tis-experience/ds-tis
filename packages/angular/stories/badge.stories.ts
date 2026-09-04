import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisBadge,
  type TisBadgeTone,
  type TisBadgeVariant,
} from "../badge/src/public-api";

interface BadgeArgs {
  label: string;
  tone: TisBadgeTone;
  variant: TisBadgeVariant;
}

const tones: readonly TisBadgeTone[] = ["brand", "error", "info", "neutral", "success", "warning"];

const meta: Meta<BadgeArgs> = {
  id: "angular-badge",
  title: "Componentes/Badge",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisBadge] })],
  args: {
    label: "Em revisão",
    tone: "brand",
    variant: "solid",
  },
  argTypes: {
    tone: { control: "select", options: tones },
    variant: { control: "radio", options: ["solid", "subtle"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Badge Angular standalone e apresentacional, com content projection e as classes públicas do DS.",
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<tis-badge [tone]="tone" [variant]="variant">{{ label }}</tis-badge>`,
  }),
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Playground: Story = {};

export const Tons: Story = {
  render: () => ({
    props: { tones },
    template: `
      <div class="ds-angular-badge-grid">
        <section>
          <h2>Solid</h2>
          <div class="ds-angular-badge-row">
            @for (tone of tones; track tone) {
              <tis-badge [tone]="tone" variant="solid">{{ tone }}</tis-badge>
            }
          </div>
        </section>
        <section>
          <h2>Subtle</h2>
          <div class="ds-angular-badge-row">
            @for (tone of tones; track tone) {
              <tis-badge [tone]="tone" variant="subtle">{{ tone }}</tis-badge>
            }
          </div>
        </section>
      </div>
    `,
  }),
};

export const EmContexto: Story = {
  render: () => ({
    template: `<p>Release <tis-badge tone="success" variant="subtle">Aprovado</tis-badge></p>`,
  }),
};
