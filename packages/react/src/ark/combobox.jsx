import { Combobox as ArkCombobox, useListCollection } from '@ark-ui/react/combobox';
import { ChevronDown, Search, X } from 'lucide';
import { createElement } from 'react';

import './combobox.css';

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

export { useListCollection };

export function Combobox({ className = '', invalid = false, ...props }) {
  return (
    <ArkCombobox.Root
      {...props}
      className={joinClasses('ds-field', invalid && 'ds-field--error', className)}
      inputBehavior="autohighlight"
      invalid={invalid}
      openOnClick
    />
  );
}

export function ComboboxLabel({ className = '', ...props }) {
  return <ArkCombobox.Label {...props} className={joinClasses('ds-field__label', className)} />;
}

export function ComboboxAnchor({ className = '', ...props }) {
  return <div {...props} className={joinClasses('ds-combobox-anchor', className)} />;
}

export function ComboboxControl({
  className = '',
  disabled = false,
  filled = false,
  invalid = false,
  readOnly = false,
  size = 'md',
  ...props
}) {
  return (
    <ArkCombobox.Control
      {...props}
      className={joinClasses(
        'ds-combobox',
        `ds-combobox--${size}`,
        disabled && 'ds-combobox--disabled',
        filled && 'ds-combobox--filled',
        invalid && 'ds-combobox--error',
        readOnly && 'ds-combobox--readonly',
        className,
      )}
    />
  );
}

export function ComboboxLeadingIcon({ className = '' }) {
  return <LucideIcon className={joinClasses('ds-combobox__icon ds-icon', className)} icon={Search} />;
}

export function ComboboxInput({ className = '', ...props }) {
  return <ArkCombobox.Input {...props} className={joinClasses('ds-combobox__input', className)} />;
}

export function ComboboxClear({ children, className = '', label = 'Limpar seleção', ...props }) {
  return (
    <ArkCombobox.ClearTrigger
      {...props}
      aria-label={label}
      className={joinClasses('ds-combobox__clear', className)}
      type="button"
    >
      {children ?? <LucideIcon icon={X} />}
    </ArkCombobox.ClearTrigger>
  );
}

export function ComboboxChevron({ className = '' }) {
  return <LucideIcon className={joinClasses('ds-combobox__chevron ds-icon', className)} icon={ChevronDown} />;
}

export function ComboboxPositioner({ className = '', ...props }) {
  return (
    <ArkCombobox.Positioner
      {...props}
      className={joinClasses('ds-combobox-anchor ds-ark-combobox__positioner', className)}
    />
  );
}

export function ComboboxContent({ className = '', ...props }) {
  return (
    <ArkCombobox.Content
      {...props}
      className={joinClasses('ds-combobox__listbox ds-ark-combobox__content', className)}
    />
  );
}

export function ComboboxItem({ className = '', ...props }) {
  return <ArkCombobox.Item {...props} className={joinClasses('ds-combobox__option', className)} />;
}

export function ComboboxItemText({ className = '', ...props }) {
  return <ArkCombobox.ItemText {...props} className={className} />;
}
