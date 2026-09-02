import { SettingsIcon } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from '../ark/accordion.jsx';
import { StoryCanvas, storyArg } from './_shared.jsx';

const items = [
  {
    value: 'billing',
    title: 'Faturamento',
    content: 'Gerencie forma de pagamento e dados fiscais.',
  },
  {
    value: 'security',
    title: 'Segurança',
    content: 'Configure autenticação e sessões ativas.',
  },
  {
    value: 'disabled',
    title: 'Configuração bloqueada',
    content: 'Este conteúdo não está disponível.',
    disabled: true,
  },
];

function AccordionExample({ mode = 'single' }) {
  return (
    <Accordion
      defaultExpandedItems={mode === 'multiple' ? ['billing', 'security'] : ['billing']}
      mode={mode}
    >
      {items.map((item) => (
        <AccordionItem disabled={item.disabled} key={item.value} value={item.value}>
          <AccordionTrigger>
            <SettingsIcon aria-hidden="true" className="ds-accordion__leading-icon ds-icon" />
            <AccordionTitle>{item.title}</AccordionTitle>
          </AccordionTrigger>
          <AccordionContent><p>{item.content}</p></AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default {
  id: 'ark-accordion',
  title: 'Outputs/Ark + Zag/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter React independente da saída Ark/Zag. Preserva a anatomia e os tokens do Accordion TIS sem importar Base UI ou o registry shadcn.',
      },
    },
  },
  args: { mode: 'single' },
  argTypes: {
    mode: storyArg({
      control: 'radio',
      defaultValue: 'single',
      description: 'Define se um ou vários itens podem permanecer abertos.',
      options: ['single', 'multiple'],
    }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas fluid><AccordionExample {...args} /></StoryCanvas>,
};

export const Multiple = {
  render: () => <StoryCanvas fluid><AccordionExample mode="multiple" /></StoryCanvas>,
};

export const DisabledItem = {
  name: 'Disabled item',
  render: () => <StoryCanvas narrow><AccordionExample /></StoryCanvas>,
};
