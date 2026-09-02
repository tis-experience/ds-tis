import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

import './checkbox.css';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Checkbox({ className = '', ...props }) {
  return (
    <ArkCheckbox.Root
      {...props}
      className={joinClasses('ds-checkbox-label', 'ds-ark-checkbox', className)}
    />
  );
}

export function CheckboxControl({ className = '', size = 'md', ...props }) {
  return (
    <ArkCheckbox.Control
      {...props}
      className={joinClasses(
        'ds-checkbox',
        size !== 'md' && `ds-checkbox--${size}`,
        'ds-ark-checkbox__control',
        className,
      )}
    />
  );
}

export function CheckboxIndicator({ className = '', ...props }) {
  return (
    <ArkCheckbox.Indicator
      {...props}
      className={joinClasses('ds-ark-checkbox__indicator', className)}
    />
  );
}

export function CheckboxContent({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-checkbox__content', className)} />;
}

export function CheckboxLabel({ className = '', ...props }) {
  return (
    <ArkCheckbox.Label
      {...props}
      className={joinClasses('ds-checkbox__label', className)}
    />
  );
}

export function CheckboxDescription({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-checkbox__description', className)} />;
}

export function CheckboxHelper({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-checkbox__helper', className)} />;
}

export function CheckboxHiddenInput(props) {
  return <ArkCheckbox.HiddenInput {...props} />;
}
