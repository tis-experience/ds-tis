import { Portal } from '@ark-ui/react/portal';
import { Select as ArkSelect, createListCollection } from '@ark-ui/react/select';
import { Check, ChevronDown, Languages } from 'lucide';
import { createElement } from 'react';

import './select.css';

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

export { createListCollection };

export function Select({ className = '', invalid = false, ...props }) {
  return (
    <ArkSelect.Root
      {...props}
      className={joinClasses('ds-field', invalid && 'ds-field--error', className)}
      invalid={invalid}
      lazyMount
      unmountOnExit
    />
  );
}

export function SelectLabel({ className = '', ...props }) {
  return <ArkSelect.Label {...props} className={joinClasses('ds-field__label', className)} />;
}

export function SelectControl({ className = '', ...props }) {
  return <ArkSelect.Control {...props} className={joinClasses('ds-ark-select__control', className)} />;
}

export function SelectTrigger({ className = '', size = 'md', ...props }) {
  return (
    <ArkSelect.Trigger
      {...props}
      className={joinClasses('ds-select', `ds-select--${size}`, 'ds-ark-select__trigger', className)}
    />
  );
}

export function SelectLeadingIcon({ className = '' }) {
  return <LucideIcon className={joinClasses('ds-select__icon ds-icon', className)} icon={Languages} />;
}

export function SelectValue({ className = '', ...props }) {
  return (
    <ArkSelect.ValueText
      {...props}
      className={joinClasses('ds-ark-select__value', className)}
    />
  );
}

export function SelectIndicator({ className = '' }) {
  return (
    <ArkSelect.Indicator className={joinClasses('ds-ark-select__indicator', className)}>
      <LucideIcon className="ds-select__arrow" icon={ChevronDown} />
    </ArkSelect.Indicator>
  );
}

export function SelectPortal(props) {
  return <Portal {...props} />;
}

export function SelectPositioner({ className = '', ...props }) {
  return (
    <ArkSelect.Positioner
      {...props}
      className={joinClasses('ds-ark-select__positioner', className)}
    />
  );
}

export function SelectContent({ className = '', ...props }) {
  return (
    <ArkSelect.Content
      {...props}
      className={joinClasses('ds-menu ds-menu--full ds-ark-select__content', className)}
    />
  );
}

export function SelectItem({ className = '', ...props }) {
  return (
    <ArkSelect.Item
      {...props}
      className={joinClasses('ds-menu__item ds-ark-select__item', className)}
    />
  );
}

export function SelectItemIndicator({ className = '' }) {
  return (
    <ArkSelect.ItemIndicator className={joinClasses('ds-menu__check', className)}>
      <LucideIcon icon={Check} />
    </ArkSelect.ItemIndicator>
  );
}

export function SelectItemText({ className = '', ...props }) {
  return (
    <ArkSelect.ItemText
      {...props}
      className={joinClasses('ds-menu__item-label', className)}
    />
  );
}

export function SelectHiddenSelect(props) {
  return <ArkSelect.HiddenSelect {...props} />;
}
