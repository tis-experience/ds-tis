import { Accordion } from '@ark-ui/react/accordion';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { ChevronDown, Settings, X } from 'lucide';
import { createElement } from 'react';

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
    <Accordion.Root
      className="ds-accordion"
      collapsible
      defaultValue={['billing']}
    >
      {accordionItems.map((item) => (
        <Accordion.Item
          className={`ds-accordion__item${item.disabled ? ' ds-accordion__item--disabled' : ''}`}
          disabled={item.disabled}
          key={item.value}
          value={item.value}
        >
          <Accordion.ItemTrigger className="ds-accordion__trigger">
            <LucideIcon
              className="ds-accordion__leading-icon"
              icon={Settings}
            />
            <span className="ds-accordion__title">{item.title}</span>
            <LucideIcon
              className="ds-accordion__chevron"
              icon={ChevronDown}
            />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent className="ds-accordion__panel">
            <p>{item.content}</p>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function ModalPreview() {
  return (
    <Dialog.Root lazyMount unmountOnExit>
      <Dialog.Trigger className="ds-button ds-button--outline" type="button">
        <span className="ds-button__label">Abrir modal</span>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Positioner className="ds-modal-overlay">
          <Dialog.Content className="ds-modal ds-modal--sm">
            <header className="ds-modal__header">
              <div className="ds-modal__heading">
                <Dialog.Title className="ds-modal__title">
                  Excluir projeto
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className="ds-modal__description">
                    Esta ação não pode ser desfeita.
                  </p>
                </Dialog.Description>
              </div>
              <Dialog.CloseTrigger
                aria-label="Fechar modal"
                className="ds-modal__close"
                type="button"
              >
                <LucideIcon icon={X} />
              </Dialog.CloseTrigger>
            </header>

            <div className="ds-modal__body">
              <p>O projeto e seus dados associados serão removidos permanentemente.</p>
            </div>

            <footer className="ds-modal__footer">
              <Dialog.CloseTrigger
                className="ds-button ds-button--outline"
                type="button"
              >
                <span className="ds-button__label">Cancelar</span>
              </Dialog.CloseTrigger>
              <button className="ds-button ds-button--danger" type="button">
                <span className="ds-button__label">Confirmar</span>
              </button>
            </footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
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
