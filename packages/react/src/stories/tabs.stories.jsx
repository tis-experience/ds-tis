import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../registry/tis/tabs.tsx';
import { StoryCanvas, storyArg } from './_shared.jsx';

const panels = [
  { label: 'Visão geral', value: 'overview', content: 'Resumo do projeto e atividade recente.' },
  { label: 'Equipe', value: 'team', content: 'Pessoas, funções e permissões do projeto.' },
  { label: 'Cobrança', value: 'billing', content: 'Plano, faturas e forma de pagamento.', disabled: true },
];

function TabsExample({ defaultValue = 'overview', disabled = true }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList aria-label="Seções do projeto">
        {panels.map((panel) => (
          <TabsTrigger
            disabled={disabled && panel.disabled}
            key={panel.value}
            value={panel.value}
          >
            {panel.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((panel) => (
        <TabsContent key={panel.value} value={panel.value}>
          <p>{panel.content}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default {
  id: 'react-tabs',
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Alterna painéis relacionados com comportamento Base UI e visual do Tabs TIS.',
      },
    },
  },
  args: { defaultValue: 'overview', disabled: true },
  argTypes: {
    defaultValue: storyArg({ control: 'radio', defaultValue: 'overview', description: 'Tab selecionada inicialmente.', options: ['overview', 'team'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: true, description: 'Mantém Cobrança desabilitada.' }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas fluid><TabsExample {...args} /></StoryCanvas>,
};

export const EnabledItems = {
  name: 'All items enabled',
  render: () => <StoryCanvas fluid><TabsExample disabled={false} /></StoryCanvas>,
};

export const TeamSelected = {
  name: 'Second tab selected',
  render: () => <StoryCanvas fluid><TabsExample defaultValue="team" /></StoryCanvas>,
};
