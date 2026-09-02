import { Settings } from 'lucide';
import { createElement } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from './ark/accordion.jsx';
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
} from './ark/modal.jsx';

const accordionItems = [
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

function LucideIcon({ icon, className = 'ds-icon' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {icon.map(([tag, attributes], index) =>
        createElement(tag, { ...attributes, key: index }),
      )}
    </svg>
  );
}

export function AccordionPreview() {
  return (
    <Accordion defaultExpandedItems={['billing']}>
      {accordionItems.map((item) => (
        <AccordionItem
          disabled={item.disabled}
          key={item.value}
          value={item.value}
        >
          <AccordionTrigger>
            <LucideIcon
              className="ds-accordion__leading-icon"
              icon={Settings}
            />
            <AccordionTitle>{item.title}</AccordionTitle>
          </AccordionTrigger>
          <AccordionContent>
            <p>{item.content}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function ModalPreview() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <button className="ds-button ds-button--outline" type="button">
          <span className="ds-button__label">Abrir modal</span>
        </button>
      </ModalTrigger>
      <ModalContent size="md">
        <ModalHeader>
          <ModalHeading>
            <ModalTitle>Revisar alterações</ModalTitle>
            <ModalDescription>
              Confira os dados antes de continuar.
            </ModalDescription>
          </ModalHeading>
          <ModalClose label="Fechar modal" />
        </ModalHeader>
        <ModalBody>
          <p>As alterações poderão ser revertidas posteriormente.</p>
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

/**
 * Composição interna mantida apenas para o gate de integração do provider.
 * O entrypoint público de @tis/react continua sem exportar estes previews.
 */
export function ArkProviderSpike() {
  return (
    <main className="vnext-provider vnext-provider--combined">
      <section className="vnext-example" aria-label="Accordion">
        <AccordionPreview />
      </section>
      <section className="vnext-example" aria-label="Modal">
        <ModalPreview />
      </section>
    </main>
  );
}
