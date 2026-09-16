import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { TisBreadcrumb, TisBreadcrumbLink, TisBreadcrumbCurrent, TisBreadcrumbSeparator } from "../breadcrumb/src/public-api";

const meta: Meta = {
  id: "angular-breadcrumb",
  title: "Componentes/Breadcrumb",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisBreadcrumb, TisBreadcrumbLink, TisBreadcrumbCurrent, TisBreadcrumbSeparator] })],
  args: { label: "Caminho de navegação", current: "Design System" },
  render: (args) => ({
    props: args,
    template: `
      <div class="ds-angular-breadcrumb-stage">
        <nav tisBreadcrumb [label]="label">
          <a tisBreadcrumbLink href="#inicio">Início</a>
          <span tisBreadcrumbSeparator>/</span>
          <a tisBreadcrumbLink href="#projetos">Projetos</a>
          <span tisBreadcrumbSeparator>/</span>
          <span tisBreadcrumbCurrent>{{ current }}</span>
        </nav>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj;
export const Playground: Story = {};
export const Navegacao: Story = {
  render: () => ({
    props: { selectedLevel: 2, levels: ["Início", "Projetos", "Design System"] },
    template: `
      <div class="ds-angular-breadcrumb-stage">
        <nav tisBreadcrumb label="Caminho do projeto">
          @for (level of levels.slice(0, selectedLevel + 1); track $index; let index = $index) {
            @if (index > 0) { <span tisBreadcrumbSeparator>/</span> }
            @if (index === selectedLevel) { <span tisBreadcrumbCurrent>{{ level }}</span> }
            @else { <a tisBreadcrumbLink [href]="'#nivel-' + index" (click)="selectedLevel = index; $event.preventDefault()">{{ level }}</a> }
          }
        </nav>
      </div>
      <p aria-live="polite">Página: {{ levels[selectedLevel] }}</p>`,
  }),
};
export const HierarquiaProfunda: Story = {
  render: () => ({
    template: `
      <div class="ds-angular-breadcrumb-stage" tabindex="0" role="region" aria-label="Caminho completo, rolável">
        <nav tisBreadcrumb label="Caminho da documentação">
          <a tisBreadcrumbLink href="#inicio">Início</a><span tisBreadcrumbSeparator>/</span>
          <a tisBreadcrumbLink href="#produtos">Produtos</a><span tisBreadcrumbSeparator>/</span>
          <a tisBreadcrumbLink href="#design-system">Design System</a><span tisBreadcrumbSeparator>/</span>
          <a tisBreadcrumbLink href="#componentes">Componentes</a><span tisBreadcrumbSeparator>/</span>
          <span tisBreadcrumbCurrent>Breadcrumb</span>
        </nav>
      </div>`,
  }),
};
