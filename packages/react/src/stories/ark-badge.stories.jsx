import { Badge } from '../ark/badge.jsx';
import { StoryCanvas, StoryRow, StorySection, StoryStack, storyArg } from './_shared.jsx';

const tones = ['brand', 'error', 'info', 'neutral', 'success', 'warning'];
export default {
  id: 'ark-badge', title: 'Outputs/Ark + Zag/Badge', component: Badge, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Label informativo em span nativo com Ark Factory, seis tons e dois estilos TIS. Sem foco ou anúncio automático.' } } },
  args: { children: 'Em revisão', tone: 'brand', variant: 'solid' },
  argTypes: {
    children: storyArg({ control: 'text', defaultValue: 'Em revisão', description: 'Texto que comunica o estado.', name: 'Label' }),
    tone: storyArg({ control: 'select', defaultValue: 'brand', description: 'Tom semântico.', options: tones }),
    variant: storyArg({ control: 'radio', defaultValue: 'solid', description: 'Ênfase visual.', options: ['solid', 'subtle'] }),
  },
};
export const Playground = { render: (args) => <StoryCanvas><Badge {...args} /></StoryCanvas> };
export const Tones = { render: () => <StoryCanvas><StoryStack>{['solid', 'subtle'].map((variant) => <StorySection key={variant} title={variant}><StoryRow>{tones.map((tone) => <Badge key={tone} tone={tone} variant={variant}>{tone}</Badge>)}</StoryRow></StorySection>)}</StoryStack></StoryCanvas> };
export const InContext = { render: () => <StoryCanvas><p>Solicitação de acesso <Badge tone="success" variant="subtle">Aprovada</Badge></p></StoryCanvas> };
