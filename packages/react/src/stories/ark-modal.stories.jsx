import { useState } from 'react';

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  ModalTitle,
  ModalTrigger,
} from '../ark/modal.jsx';
import { StoryCanvas, storyArg } from './_shared.jsx';

function ModalExample({ size = 'md', ...modalProps }) {
  return (
    <Modal {...modalProps}>
      <ModalTrigger asChild>
        <button className="ds-button ds-button--outline" type="button">
          <span className="ds-button__label">Abrir modal</span>
        </button>
      </ModalTrigger>
      <ModalContent size={size}>
        <ModalHeader>
          <ModalHeading>
            <ModalTitle>Revisar alterações</ModalTitle>
            <ModalDescription>
              Confira os dados antes de aplicar esta atualização.
            </ModalDescription>
          </ModalHeading>
          <ModalClose label="Fechar modal" />
        </ModalHeader>
        <ModalBody>
          <p>As alterações poderão ser revertidas posteriormente no histórico.</p>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <button className="ds-button ds-button--outline" type="button">
              <span className="ds-button__label">Cancelar</span>
            </button>
          </ModalClose>
          <button className="ds-button ds-button--brand" type="button">
            <span className="ds-button__label">Aplicar alterações</span>
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ControlledModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <StoryCanvas>
      <p data-modal-controlled-state>{open ? 'Modal aberto' : 'Modal fechado'}</p>
      <ModalExample
        open={open}
        onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}
      />
    </StoryCanvas>
  );
}

export default {
  id: 'ark-modal',
  title: 'Outputs/Ark + Zag/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter React independente da saída Ark/Zag. Ark UI fornece as parts, Zag mantém foco, teclado e estado, e o DS TIS preserva anatomia, tokens e visual.',
      },
    },
  },
  args: { size: 'md' },
  argTypes: {
    size: storyArg({
      control: 'select',
      defaultValue: 'md',
      description: 'Define a largura e a escala visual do Modal TIS.',
      options: ['sm', 'md', 'lg'],
    }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas><ModalExample {...args} /></StoryCanvas>,
};

export const Small = {
  render: () => <StoryCanvas><ModalExample size="sm" /></StoryCanvas>,
};

export const Large = {
  render: () => <StoryCanvas><ModalExample size="lg" /></StoryCanvas>,
};

export const Controlled = {
  render: () => <ControlledModalExample />,
};
