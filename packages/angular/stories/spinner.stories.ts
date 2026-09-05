import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular-vite";
import { TisButton } from "../button/src/public-api";
import { TisSpinner, type TisSpinnerSize } from "../spinner/src/public-api";

interface SpinnerArgs {
  size: TisSpinnerSize;
  onColor: boolean;
  label: string;
}

const meta: Meta<SpinnerArgs> = {
  id: "angular-spinner",
  title: "Componentes/Spinner",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [TisButton, TisSpinner] })],
  args: { size: "md", onColor: false, label: "Carregando" },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    onColor: { control: "boolean" },
    label: { control: "text" },
  },
  render: (args) => ({
    props: args,
    template: `<tis-spinner [size]="size" [onColor]="onColor" [label]="label" />`,
  }),
};

export default meta;
type Story = StoryObj<SpinnerArgs>;
export const Playground: Story = {};

export const Tamanhos: Story = {
  render: () => ({ template: `<div class="ds-angular-spinner-row">
    @for (size of ['sm', 'md', 'lg']; track size) {
      <div class="ds-angular-spinner-sample"><span>{{ size }}</span><tis-spinner [size]="$any(size)" [label]="'Carregando ' + size" /></div>
    }
  </div>` }),
};

export const Estilos: Story = {
  render: () => ({ template: `<div class="ds-angular-spinner-row">
    <div class="ds-angular-spinner-sample"><span>Default</span><tis-spinner label="Carregando" /></div>
    <div class="ds-angular-spinner-sample ds-angular-spinner-on-color"><span>On color</span><tis-spinner onColor label="Carregando" /></div>
  </div>` }),
};

export const NoButton: Story = {
  render: () => ({ template: `<tis-button loading loadingLabel="Salvando">Salvar</tis-button>` }),
};
