import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { X } from 'lucide';
import { createElement } from 'react';

const sizeClasses = {
  sm: 'ds-modal--sm',
  md: 'ds-modal--md',
  lg: 'ds-modal--lg',
};

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

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

export function Modal({
  closeOnEscape = true,
  closeOnInteractOutside = true,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}) {
  return (
    <ArkDialog.Root
      {...props}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnInteractOutside}
      lazyMount={lazyMount}
      modal
      preventScroll
      restoreFocus
      role="dialog"
      trapFocus
      unmountOnExit={unmountOnExit}
    />
  );
}

export function ModalTrigger(props) {
  return <ArkDialog.Trigger {...props} />;
}

export function ModalContent({
  backdropProps,
  children,
  className = '',
  portalProps,
  positionerProps,
  size = 'md',
  ...props
}) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const {
    className: backdropClassName = '',
    ...resolvedBackdropProps
  } = backdropProps || {};
  const {
    className: positionerClassName = '',
    ...resolvedPositionerProps
  } = positionerProps || {};

  return (
    <Portal {...portalProps}>
      <ArkDialog.Backdrop
        {...resolvedBackdropProps}
        className={joinClasses('ds-ark-modal__backdrop', backdropClassName)}
      />
      <ArkDialog.Positioner
        {...resolvedPositionerProps}
        className={joinClasses('ds-modal-overlay', positionerClassName)}
      >
        <ArkDialog.Content
          {...props}
          className={joinClasses('ds-modal', sizeClass, className)}
        >
          {children}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </Portal>
  );
}

export function ModalHeader({ className = '', ...props }) {
  return (
    <header
      {...props}
      className={joinClasses('ds-modal__header', className)}
    />
  );
}

export function ModalHeading({ className = '', ...props }) {
  return (
    <div
      {...props}
      className={joinClasses('ds-modal__heading', className)}
    />
  );
}

export function ModalTitle({ className = '', ...props }) {
  return (
    <ArkDialog.Title
      {...props}
      className={joinClasses('ds-modal__title', className)}
    />
  );
}

export function ModalDescription({ className = '', ...props }) {
  return (
    <ArkDialog.Description
      {...props}
      className={joinClasses('ds-modal__description', className)}
    />
  );
}

export function ModalBody({ className = '', ...props }) {
  return (
    <div
      {...props}
      className={joinClasses('ds-modal__body', className)}
    />
  );
}

export function ModalFooter({ className = '', ...props }) {
  return (
    <footer
      {...props}
      className={joinClasses('ds-modal__footer', className)}
    />
  );
}

export function ModalClose({
  children,
  className = '',
  label = 'Fechar modal',
  ...props
}) {
  const iconOnly = children === undefined || children === null;

  return (
    <ArkDialog.CloseTrigger
      {...props}
      {...(iconOnly ? { 'aria-label': label } : {})}
      className={joinClasses(iconOnly && 'ds-modal__close', className)}
      type="button"
    >
      {iconOnly ? <LucideIcon icon={X} /> : children}
    </ArkDialog.CloseTrigger>
  );
}
