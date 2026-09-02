import { Badge } from '../../../../registry/tis/badge.tsx';
import { Button } from '../../../../registry/tis/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../registry/tis/card.tsx';
import { StoryCanvas, StoryGrid, storyArg } from './_shared.jsx';

function CardExample({ description, selected = false, title, variant }) {
  const interactive = variant === 'interactive';
  return (
    <Card as={interactive ? 'button' : 'article'} type={interactive ? 'button' : undefined} variant={variant} selected={selected} className={interactive ? 'ds-story-card-action' : undefined} aria-pressed={interactive ? selected : undefined}>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent><p>128 licenças ativas de 150 disponíveis.</p><Badge tone="success" variant="subtle">Saudável</Badge></CardContent>
      {!interactive ? <CardFooter><Button size="sm" variant="ghost">Ver detalhes</Button></CardFooter> : null}
    </Card>
  );
}

export default {
  id: 'react-card',
  title: 'Components/Content and structure/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Agrupa conteúdo e ações relacionadas em uma superfície com hierarquia clara.' } } },
  args: { title: 'Uso da organização', description: 'Resumo atualizado há poucos minutos.', variant: 'outlined', selected: false },
  argTypes: {
    title: storyArg({ control: 'text', defaultValue: 'Uso da organização', description: 'Título que identifica o conteúdo agrupado.' }),
    description: storyArg({ control: 'text', defaultValue: 'Resumo atualizado há poucos minutos.', description: 'Contexto breve complementar ao título.' }),
    variant: storyArg({ control: 'select', defaultValue: 'outlined', description: 'Tratamento visual e comportamento da superfície.', options: ['default', 'outlined', 'elevated', 'interactive'] }),
    selected: storyArg({ control: 'boolean', defaultValue: false, description: 'Comunica seleção quando a variante é interativa.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><CardExample {...args} /></StoryCanvas> };
export const Variants = { render: () => <StoryGrid>{['default', 'outlined', 'elevated'].map((variant) => <CardExample key={variant} variant={variant} title={variant} description={`Card ${variant}.`} />)}</StoryGrid> };
export const Interactive = { render: () => <StoryGrid><CardExample variant="interactive" title="Segurança" description="Abrir configurações de acesso." /><CardExample variant="interactive" selected title="Notificações" description="Configuração selecionada." /></StoryGrid> };
