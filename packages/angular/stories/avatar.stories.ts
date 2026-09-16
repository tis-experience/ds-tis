import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { TisAvatar } from "../avatar/src/public-api";
import { TisButton } from "../button/src/public-api";

// Local, deterministic image; examples do not depend on an external photo service.
const sampleImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#cbd5e1"/><circle cx="40" cy="28" r="14" fill="#475569"/><path d="M12 80V66a28 28 0 0 1 56 0v14" fill="#475569"/></svg>')}`;
const brokenImage = "data:image/png;base64,invalid";
const meta: Meta = {
  id: "angular-avatar",
  title: "Componentes/Avatar",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisAvatar, TisButton] })],
  args: { label: "Ana Lima", initials: "AL", size: "md", content: "initials", src: sampleImage, decorative: false },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    content: { control: "radio", options: ["image", "initials", "icon"] },
  },
  render: (args) => ({ props: args, template: `<tis-avatar [label]="label" [initials]="initials" [size]="size" [content]="content" [src]="src" [decorative]="decorative" />` }),
};
export default meta;
type Story = StoryObj;
export const Playground: Story = {};
export const TamanhosEConteudos: Story = {
  render: () => ({
    props: { sampleImage },
    template: `<div class="ds-angular-avatar-grid">
      @for (size of ['sm', 'md', 'lg']; track size) {
        <div class="ds-angular-avatar-row">
          <span>{{ size }}</span>
          <tis-avatar label="Ana Lima" initials="AL" [size]="$any(size)" />
          <tis-avatar label="Ana Lima, imagem" content="image" [src]="sampleImage" [size]="$any(size)" />
          <tis-avatar label="Pessoa sem foto" content="icon" [size]="$any(size)" />
        </div>
      }
    </div>`,
  }),
};
export const Fallback: Story = {
  render: () => ({
    props: { sampleImage, brokenImage, failed: false },
    template: `<div class="ds-angular-avatar-grid">
      <div class="ds-angular-avatar-row">
        <tis-avatar label="Ana Lima" content="image" initials="AL" [src]="failed ? brokenImage : sampleImage" />
        <span>Ana Lima</span>
      </div>
      <div class="ds-angular-avatar-row">
        <tis-button size="sm" (click)="failed = true">Simular falha</tis-button>
        <tis-button size="sm" variant="outline" (click)="failed = false">Restaurar imagem</tis-button>
      </div>
    </div>`,
  }),
};
export const Decorativo: Story = {
  render: () => ({ template: `<div class="ds-angular-avatar-row"><tis-avatar label="Ana Lima" initials="AL" decorative /><span>Ana Lima</span></div>` }),
};
