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
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function ModalExample({
  customBody = false,
  description = 'Confira os dados antes de aplicar esta atualização.',
  primaryLabel = 'Aplicar alterações',
  size = 'md',
  title = 'Revisar alterações',
  triggerLabel = 'Abrir modal',
  ...modalProps
}) {
  return (
    <Modal {...modalProps}>
      <ModalTrigger asChild>
        <button className="ds-button ds-button--outline" type="button">
          <span className="ds-button__label">{triggerLabel}</span>
        </button>
      </ModalTrigger>
      <ModalContent size={size}>
        <ModalHeader>
          <ModalHeading>
            <ModalTitle>{title}</ModalTitle>
            <ModalDescription>{description}</ModalDescription>
          </ModalHeading>
          <ModalClose label="Fechar modal" />
        </ModalHeader>
        <ModalBody>
          {customBody ? (
            <div className="ds-field">
              <label className="ds-field__label" htmlFor="ark-modal-email">E-mail</label>
              <div className="ds-input ds-input--md">
                <input autoFocus className="ds-input__field" id="ark-modal-email" type="email" placeholder="nome@empresa.com" />
              </div>
              <p className="ds-field__helper">Enviaremos um convite para este endereço.</p>
            </div>
          ) : <p>As alterações poderão ser revertidas posteriormente no histórico.</p>}
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <button className="ds-button ds-button--outline" type="button">
              <span className="ds-button__label">Cancelar</span>
            </button>
          </ModalClose>
          <ModalClose asChild>
            <button className="ds-button ds-button--brand" type="button">
              <span className="ds-button__label">{primaryLabel}</span>
            </button>
          </ModalClose>
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

export const Sizes = {
  render: () => (
    <StoryCanvas>
      <StoryRow>
        {['sm', 'md', 'lg'].map((size) => (
          <ModalExample
            key={size}
            size={size}
            triggerLabel={`Abrir modal ${size}`}
          />
        ))}
      </StoryRow>
    </StoryCanvas>
  ),
};

export const CustomBody = {
  render: () => (
    <StoryCanvas>
      <ModalExample
        customBody
        description="Informe os dados necessários para enviar o convite."
        primaryLabel="Enviar convite"
        size="md"
        title="Convidar pessoa"
        triggerLabel="Convidar pessoa"
      />
    </StoryCanvas>
  ),
};

export const Controlled = {
  render: () => <ControlledModalExample />,
};
