import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { TisPagination } from "../pagination/src/public-api";

const meta: Meta = {
  id: "angular-pagination",
  title: "Componentes/Pagination",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisPagination] })],
  args: { currentPage: 5, totalPages: 10, size: "md", label: "Paginação dos resultados" },
  argTypes: {
    currentPage: { control: { type: "number", min: 1 } },
    totalPages: { control: { type: "number", min: 1 } },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  render: (args) => ({
    props: args,
    template: `<div class="ds-angular-pagination-stage" role="region" aria-label="Exemplo de paginação">
      <tis-pagination [currentPage]="currentPage" [totalPages]="totalPages" [size]="size" [label]="label"
        (pageChange)="currentPage = $event" />
      <p aria-live="polite">Página atual: {{ currentPage }}</p>
    </div>`,
  }),
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {};

export const Tamanhos: Story = {
  render: () => ({
    props: { small: 1, medium: 3, large: 6 },
    template: `<div class="ds-angular-pagination-grid">
      <div class="ds-angular-pagination-stage" role="region" aria-label="Pagination small">
        <span>sm</span><tis-pagination size="sm" [currentPage]="small" [totalPages]="6" label="Paginação small" (pageChange)="small = $event" />
      </div>
      <div class="ds-angular-pagination-stage" role="region" aria-label="Pagination medium">
        <span>md</span><tis-pagination [currentPage]="medium" [totalPages]="6" label="Paginação medium" (pageChange)="medium = $event" />
      </div>
      <div class="ds-angular-pagination-stage" role="region" aria-label="Pagination large">
        <span>lg</span><tis-pagination size="lg" [currentPage]="large" [totalPages]="6" label="Paginação large" (pageChange)="large = $event" />
      </div>
    </div>`,
  }),
};

export const Limites: Story = {
  render: () => ({
    props: { first: 1, last: 10 },
    template: `<div class="ds-angular-pagination-grid">
      <div class="ds-angular-pagination-stage" role="region" aria-label="Primeira página">
        <span>Primeira página</span><tis-pagination [currentPage]="first" [totalPages]="10" label="Paginação no início" (pageChange)="first = $event" />
      </div>
      <div class="ds-angular-pagination-stage" role="region" aria-label="Última página">
        <span>Última página</span><tis-pagination [currentPage]="last" [totalPages]="10" label="Paginação no fim" (pageChange)="last = $event" />
      </div>
    </div>`,
  }),
};
