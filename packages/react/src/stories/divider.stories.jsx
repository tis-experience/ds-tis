import { Button } from '../../../../registry/tis/button.tsx';
import { Separator } from '../../../../registry/tis/separator.tsx';
import { StoryCanvas, StoryRow, StorySection, StoryStack, storyArg } from './_shared.jsx';

export default {
  id: 'react-divider',
  title: 'Components/Content and structure/Divider',
  component: Separator,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Separa regiões relacionadas sem criar uma nova superfície visual.' } } },
  args: { orientation: 'horizontal', decorative: false },
  argTypes: {
    orientation: storyArg({ control: 'radio', defaultValue: 'horizontal', description: 'Direção em que o separador divide o conteúdo.', options: ['horizontal', 'vertical'] }),
    decorative: storyArg({ control: 'boolean', defaultValue: false, description: 'Remove a semântica de separator quando a linha é apenas visual.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><div className={args.orientation === 'vertical' ? 'ds-story-row ds-story-toolbar' : undefined}><span>Antes</span><Separator {...args} /><span>Depois</span></div></StoryCanvas> };
export const ContentSections = { name: 'Content sections', render: () => <StoryCanvas><StoryStack><StorySection title="Perfil"><p>Dados pessoais e preferências.</p></StorySection><Separator /><StorySection title="Segurança"><p>Senha e autenticação.</p></StorySection></StoryStack></StoryCanvas> };
export const Toolbar = { render: () => <StoryCanvas><StoryRow className="ds-story-toolbar"><Button size="sm" variant="ghost">Copiar</Button><Separator orientation="vertical" /><Button size="sm" variant="ghost">Colar</Button></StoryRow></StoryCanvas> };
