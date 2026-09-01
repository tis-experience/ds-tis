import { Button, ButtonLabel } from '../../../../registry/tis/button.tsx';
import { Spinner } from '../../../../registry/tis/spinner.tsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

export default {
  id: 'react-spinner',
  title: 'Components/Feedback and status/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Indica progresso indeterminado para uma operação em andamento.' } } },
  args: { size: 'md', onColor: false, 'aria-label': 'Carregando conteúdo' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Diâmetro do indicador.', options: ['sm', 'md', 'lg'] }),
    onColor: storyArg({ control: 'boolean', defaultValue: false, description: 'Usa a cor adequada para superfícies coloridas ou inversas.' }),
    'aria-label': storyArg({ control: 'text', defaultValue: 'Carregando conteúdo', description: 'Descrição acessível da operação em andamento.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><Spinner {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas><StoryRow>{['sm', 'md', 'lg'].map((size) => <Spinner key={size} size={size} aria-label={`Carregando ${size}`} />)}</StoryRow></StoryCanvas> };
export const InButton = { name: 'In Button', render: () => <StoryCanvas><Button aria-busy="true" disabled><Spinner onColor size="sm" aria-hidden="true" role="presentation" /><ButtonLabel>Salvando</ButtonLabel></Button></StoryCanvas> };
export const OnColor = { name: 'On color', render: () => <StoryCanvas><div className="ds-story-surface-inverse"><Spinner onColor aria-label="Carregando sobre fundo inverso" /></div></StoryCanvas> };
