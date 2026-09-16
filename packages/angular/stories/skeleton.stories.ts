import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { TisSkeleton, TisSkeletonGroup } from "../skeleton/src/public-api";

const meta: Meta = {
  id: "angular-skeleton",
  title: "Componentes/Skeleton",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisSkeleton, TisSkeletonGroup] })],
  args: { type: "text" },
  argTypes: { type: { control: "radio", options: ["text", "circle", "rectangle"] } },
  render: (args) => ({
    props: args,
    template: `<div tisSkeletonGroup label="Carregando conteúdo" class="ds-angular-skeleton-standalone">
      <tis-skeleton [type]="type" />
    </div>`,
  }),
};

export default meta;
type Story = StoryObj;
export const Playground: Story = {};

export const Tipos: Story = {
  render: () => ({ template: `<div tisSkeletonGroup label="Carregando exemplos" class="ds-angular-skeleton-grid">
    <div><span>text</span><tis-skeleton type="text" /></div>
    <div><span>circle</span><tis-skeleton type="circle" /></div>
    <div><span>rectangle</span><tis-skeleton type="rectangle" /></div>
  </div>` }),
};

export const Card: Story = {
  render: () => ({ template: `<div tisSkeletonGroup label="Carregando perfil" class="ds-angular-skeleton-card">
    <div class="ds-angular-skeleton-profile"><tis-skeleton type="circle" /><div class="ds-angular-skeleton-lines"><tis-skeleton type="text" width="60%" /><tis-skeleton type="text" width="40%" /></div></div>
    <div class="ds-angular-skeleton-lines"><tis-skeleton type="text" /><tis-skeleton type="text" width="90%" /><tis-skeleton type="text" width="75%" /></div>
    <tis-skeleton type="rectangle" />
  </div>` }),
};

export const Lista: Story = {
  render: () => ({ template: `<div tisSkeletonGroup label="Carregando lista" class="ds-angular-skeleton-list">
    @for (item of [1, 2, 3]; track item) {
      <article class="ds-angular-skeleton-card" aria-hidden="true">
        <div class="ds-angular-skeleton-profile"><tis-skeleton type="circle" /><div class="ds-angular-skeleton-lines"><tis-skeleton type="text" width="70%" /><tis-skeleton type="text" width="45%" /></div></div>
        <tis-skeleton type="rectangle" />
      </article>
    }
  </div>` }),
};
