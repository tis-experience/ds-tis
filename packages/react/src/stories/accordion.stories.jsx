import { SettingsIcon } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTitle, AccordionTrigger } from '../../../../registry/tis/accordion.tsx';
import { StoryCanvas, storyArg } from './_shared.jsx';

function AccordionExample({ disabled = false, multiple = false }) {
  return (
    <Accordion defaultValue={multiple ? ['billing', 'security'] : ['billing']} multiple={multiple}>
      <AccordionItem value="billing">
        <AccordionTrigger><SettingsIcon aria-hidden="true" className="ds-accordion__leading-icon ds-icon" /><AccordionTitle>Faturamento</AccordionTitle></AccordionTrigger>
        <AccordionContent><p>Gerencie formas de pagamento e dados fiscais.</p></AccordionContent>
      </AccordionItem>
      <AccordionItem value="security">
        <AccordionTrigger><SettingsIcon aria-hidden="true" className="ds-accordion__leading-icon ds-icon" /><AccordionTitle>Segurança</AccordionTitle></AccordionTrigger>
        <AccordionContent><p>Configure autenticação e sessões ativas.</p></AccordionContent>
      </AccordionItem>
      <AccordionItem value="team" disabled={disabled}>
        <AccordionTrigger><SettingsIcon aria-hidden="true" className="ds-accordion__leading-icon ds-icon" /><AccordionTitle>Configuração bloqueada</AccordionTitle></AccordionTrigger>
        <AccordionContent><p>Este conteúdo não está disponível.</p></AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default {
  id: 'react-accordion',
  title: 'Components/Overlay and disclosure/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Organiza conteúdo relacionado em seções expansíveis com teclado e ARIA coordenados.' } } },
  args: { multiple: false, disabled: true },
  argTypes: {
    multiple: storyArg({ control: 'boolean', defaultValue: false, description: 'Permite manter mais de um item aberto.' }),
    disabled: storyArg({ control: 'boolean', defaultValue: true, description: 'Desabilita o terceiro item do exemplo.', name: 'Disable third item' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas fluid><AccordionExample {...args} /></StoryCanvas> };
export const Multiple = { render: () => <StoryCanvas><AccordionExample multiple disabled={false} /></StoryCanvas> };
export const DisabledItem = { name: 'Disabled item', render: () => <StoryCanvas narrow><AccordionExample disabled /></StoryCanvas> };
