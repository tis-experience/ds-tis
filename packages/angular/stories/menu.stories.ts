import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";

import {
  TisActionMenu,
  TisMenu,
  TisMenuCheckboxItem,
  TisMenuGroupLabel,
  TisMenuItem,
  TisMenuItemCheck,
  TisMenuItemIcon,
  TisMenuItemLabel,
  TisMenuRadioGroup,
  TisMenuRadioItem,
  TisMenuSeparator,
  TisMenuShortcut,
  TisMenuTrigger,
  type TisMenuAlign,
  type TisMenuSize,
} from "../menu/src/public-api";

interface MenuArgs {
  align: TisMenuAlign;
  disabled: boolean;
  size: TisMenuSize;
}

const imports = [
  TisActionMenu,
  TisMenu,
  TisMenuCheckboxItem,
  TisMenuGroupLabel,
  TisMenuItem,
  TisMenuItemCheck,
  TisMenuItemIcon,
  TisMenuItemLabel,
  TisMenuRadioGroup,
  TisMenuRadioItem,
  TisMenuSeparator,
  TisMenuShortcut,
  TisMenuTrigger,
];

const meta: Meta<MenuArgs> = {
  id: "angular-menu",
  title: "Componentes/Menu",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports })],
  args: {
    align: "end",
    disabled: false,
    size: "md",
  },
  argTypes: {
    align: { control: "radio", options: ["start", "end"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Action Menu standalone com Angular Aria, foco roving, typeahead, itens disabled e retorno de foco.",
      },
    },
  },
  render: (args) => ({
    props: { ...args, lastAction: "nenhuma" },
    template: `
      <div class="ds-angular-menu-stage">
        <div tisActionMenu [align]="align">
          <button tisMenuTrigger [menu]="menu.primitive" [disabled]="disabled" [size]="size">
            <span class="ds-button__label">Ações do projeto</span>
            <svg class="ds-button__icon ds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
          <div tisMenu #menu="tisMenu" [size]="size" aria-label="Ações do projeto" (itemSelected)="lastAction = $event">
            <div tisMenuGroupLabel>Documento</div>
            <button tisMenuItem value="edit" searchTerm="Editar">
              <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
              <span tisMenuItemLabel>Editar</span>
              <span tisMenuShortcut>⌘E</span>
            </button>
            <button tisMenuItem value="duplicate" searchTerm="Duplicar">
              <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
              <span tisMenuItemLabel>Duplicar projeto</span>
              <span tisMenuShortcut>⌘D</span>
            </button>
            <button tisMenuItem value="transfer" searchTerm="Transferir" [disabled]="true">
              <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m17 3 4 4-4 4"></path><path d="M3 7h18"></path><path d="m7 21-4-4 4-4"></path><path d="M21 17H3"></path></svg>
              <span tisMenuItemLabel>Transferir</span>
              <span tisMenuShortcut>Indisponível</span>
            </button>
            <div tisMenuSeparator></div>
            <button tisMenuItem value="delete" searchTerm="Excluir" [destructive]="true">
              <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="m19 6-1 14H6L5 6"></path></svg>
              <span tisMenuItemLabel>Excluir</span>
              <span tisMenuShortcut>⌫</span>
            </button>
          </div>
        </div>
        <p class="ds-angular-menu-status" role="status">Última ação: {{ lastAction }}</p>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<MenuArgs>;

export const Playground: Story = {};

export const Escolhas: Story = {
  render: () => ({
    props: { density: "comfortable", pinned: false },
    template: `
      <div class="ds-angular-menu-stage">
        <div tisActionMenu align="start">
          <button tisMenuTrigger [menu]="menu.primitive" size="md">
            <span class="ds-button__label">Preferências</span>
          </button>
          <div tisMenu #menu="tisMenu" aria-label="Preferências de visualização">
            <div tisMenuGroupLabel>Densidade</div>
            <div tisMenuRadioGroup [(value)]="density">
              <button tisMenuRadioItem value="compact" searchTerm="Compacta">
                <svg tisMenuItemCheck viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m5 12 4 4L19 6"></path></svg>
                <span tisMenuItemLabel>Compacta</span>
              </button>
              <button tisMenuRadioItem value="comfortable" searchTerm="Confortável">
                <svg tisMenuItemCheck viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m5 12 4 4L19 6"></path></svg>
                <span tisMenuItemLabel>Confortável</span>
              </button>
            </div>
            <div tisMenuSeparator></div>
            <button tisMenuCheckboxItem value="pin" searchTerm="Fixar" [(checked)]="pinned">
              <svg tisMenuItemCheck viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m5 12 4 4L19 6"></path></svg>
              <span tisMenuItemLabel>Fixar no início</span>
            </button>
          </div>
        </div>
        <p class="ds-angular-menu-status" role="status">Densidade: {{ density }} · Fixado: {{ pinned ? 'sim' : 'não' }}</p>
      </div>
    `,
  }),
};

export const Tamanhos: Story = {
  render: () => ({
    props: { sizes: ["sm", "md", "lg"] },
    template: `
      <div class="ds-angular-menu-grid">
        @for (itemSize of sizes; track itemSize) {
          <div tisActionMenu align="start">
            <button tisMenuTrigger [menu]="menu.primitive" [size]="itemSize">
              <span class="ds-button__label">{{ itemSize }}</span>
            </button>
            <div tisMenu #menu="tisMenu" [size]="itemSize" [attr.aria-label]="'Menu ' + itemSize">
              <button tisMenuItem value="edit" searchTerm="Editar">
                <svg tisMenuItemIcon viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                <span tisMenuItemLabel>Editar</span>
              </button>
            </div>
          </div>
        }
      </div>
    `,
  }),
};
