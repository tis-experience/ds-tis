import { Card, CardContent, CardHeader } from '../../../../registry/tis/card.tsx';
import { Skeleton } from '../../../../registry/tis/skeleton.tsx';
import { StoryCanvas, StoryRow, StoryStack, storyArg } from './_shared.jsx';

export default {
  id: 'react-skeleton',
  title: 'Components/Feedback and status/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Representa temporariamente a estrutura do conteúdo durante o carregamento.' } } },
  args: { variant: 'text' },
  argTypes: {
    variant: storyArg({ control: 'radio', defaultValue: 'text', description: 'Forma aproximada do conteúdo que será carregado.', options: ['text', 'circle', 'rectangle'] }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><Skeleton {...args} /></StoryCanvas> };
export const Types = { render: () => <StoryCanvas narrow><StoryStack><Skeleton variant="text" /><StoryRow><Skeleton variant="circle" /><div className="ds-story-skeleton-copy"><Skeleton variant="text" /><Skeleton variant="text" /></div></StoryRow><Skeleton variant="rectangle" /></StoryStack></StoryCanvas> };
export const CardLoading = { name: 'Card loading', render: () => <StoryCanvas narrow><Card variant="outlined" aria-busy="true" aria-label="Carregando card"><CardHeader><StoryRow><Skeleton variant="circle" /><div className="ds-story-skeleton-copy"><Skeleton variant="text" /><Skeleton variant="text" /></div></StoryRow></CardHeader><CardContent><Skeleton variant="rectangle" /></CardContent></Card></StoryCanvas> };
