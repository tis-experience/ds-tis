import { DownloadIcon, PlusIcon } from 'lucide-react';

import { Button } from '../../../../registry/tis/button.tsx';
import { StoryCanvas, StoryRow, StorySection, StoryStack, storyArg } from './_shared.jsx';

export default {
  id: 'react-button',
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Dispara ações imediatas com hierarquia, tamanho e estados consistentes.' } },
  },
  args: { label: 'Salvar alterações', variant: 'default', size: 'default', disabled: false },
  argTypes: {
    label: storyArg({ control: 'text', defaultValue: 'Salvar alterações', description: 'Texto objetivo que descreve a ação.' }),
    variant: storyArg({ control: 'select', defaultValue: 'default', description: 'Hierarquia ou intenção da ação.', options: ['default', 'toned', 'outline', 'ghost', 'success', 'destructive'] }),
    size: storyArg({ control: 'select', defaultValue: 'default', description: 'Tamanho para botões com texto.', options: ['sm', 'default', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede a interação e comunica indisponibilidade.' }),
  },
};

export const Playground = {
  render: ({ label, ...args }) => <StoryCanvas><Button {...args}>{label}</Button></StoryCanvas>,
};

export const Variants = {
  render: () => (
    <StoryCanvas><StoryRow>
      <Button>Brand</Button><Button variant="toned">Toned</Button><Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button><Button variant="success">Success</Button>
      <Button variant="destructive">Destructive</Button>
    </StoryRow></StoryCanvas>
  ),
};

export const SizesAndIcons = {
  name: 'Sizes and icons',
  render: () => (
    <StoryCanvas><StoryStack>
      <StorySection title="Sizes"><StoryRow><Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Large</Button></StoryRow></StorySection>
      <StorySection title="Icons"><StoryRow><Button><PlusIcon aria-hidden="true" />Adicionar</Button><Button size="icon" aria-label="Baixar"><DownloadIcon /></Button></StoryRow></StorySection>
    </StoryStack></StoryCanvas>
  ),
};

export const States = {
  render: () => <StoryCanvas><StoryRow><Button disabled>Disabled</Button><Button aria-busy="true">Salvando…</Button></StoryRow></StoryCanvas>,
};
