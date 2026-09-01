import { Badge } from '../../../../registry/tis/badge.tsx';
import { StoryCanvas, StoryRow, StorySection, StoryStack, storyArg } from './_shared.jsx';

export default {
  id: 'react-badge',
  title: 'Components/Feedback and status/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Identifica status ou metadados curtos sem depender apenas da cor.' } } },
  args: { children: 'Em revisão', tone: 'brand', variant: 'solid' },
  argTypes: {
    children: storyArg({ control: 'text', defaultValue: 'Em revisão', description: 'Rótulo curto exibido no badge.', name: 'Label' }),
    tone: storyArg({ control: 'select', defaultValue: 'brand', description: 'Significado semântico comunicado por texto e cor.', options: ['brand', 'error', 'info', 'neutral', 'success', 'warning'] }),
    variant: storyArg({ control: 'select', defaultValue: 'solid', description: 'Nível de ênfase visual.', options: ['solid', 'subtle'] }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><Badge {...args} /></StoryCanvas> };
export const Tones = { render: () => <StoryCanvas><StoryStack><StorySection title="Solid"><StoryRow>{['brand', 'error', 'info', 'neutral', 'success', 'warning'].map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</StoryRow></StorySection><StorySection title="Subtle"><StoryRow>{['brand', 'error', 'info', 'neutral', 'success', 'warning'].map((tone) => <Badge key={tone} tone={tone} variant="subtle">{tone}</Badge>)}</StoryRow></StorySection></StoryStack></StoryCanvas> };
export const InContext = { name: 'In context', render: () => <StoryCanvas><p>Release <Badge tone="success" variant="subtle">Aprovado</Badge></p></StoryCanvas> };
