import {
  AccordionPreview,
  ArkProviderSpike,
  ModalPreview,
} from './provider-spike.jsx';

export default {
  id: 'vnext-provider-spike',
  title: 'Internal/Ark + Zag comparison',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Validação interna das anatomias públicas do DS TIS com comportamento fornecido por Ark/Zag. Não representa uma API pública de React.',
      },
    },
  },
};

export const Accordion = {
  render: () => (
    <div className="vnext-provider">
      <AccordionPreview />
    </div>
  ),
};

export const Modal = {
  render: () => (
    <div className="vnext-provider">
      <ModalPreview />
    </div>
  ),
};

export const AccordionAndDialog = {
  name: 'Accordion + Modal',
  render: () => <ArkProviderSpike />,
};
