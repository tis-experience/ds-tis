import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';

import './radio.css';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function RadioGroup({ className = '', invalid = false, ...props }) {
  return (
    <ArkRadioGroup.Root
      {...props}
      invalid={invalid}
      className={joinClasses(
        'ds-radio-group',
        'ds-ark-radio-group',
        invalid && 'ds-radio-group--error',
        className,
      )}
    />
  );
}

export function RadioGroupLegend({ className = '', ...props }) {
  return (
    <ArkRadioGroup.Label
      {...props}
      className={joinClasses('ds-radio-group__legend', className)}
    />
  );
}

export function RadioGroupOption({ className = '', ...props }) {
  return (
    <ArkRadioGroup.Item
      {...props}
      className={joinClasses('ds-radio-label', 'ds-ark-radio__option', className)}
    />
  );
}

export function RadioGroupItem({ className = '', size = 'md', ...props }) {
  return (
    <ArkRadioGroup.ItemControl
      {...props}
      className={joinClasses(
        'ds-radio',
        size !== 'md' && `ds-radio--${size}`,
        'ds-ark-radio__control',
        className,
      )}
    />
  );
}

export function RadioGroupContent({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-radio__content', className)} />;
}

export function RadioGroupLabel({ className = '', ...props }) {
  return (
    <ArkRadioGroup.ItemText
      {...props}
      className={joinClasses('ds-radio__label', className)}
    />
  );
}

export function RadioGroupDescription({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-radio__description', className)} />;
}

export function RadioGroupHelper({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-radio__helper', className)} />;
}

export function RadioGroupHiddenInput(props) {
  return <ArkRadioGroup.ItemHiddenInput {...props} />;
}

export function RadioGroupError({ className = '', ...props }) {
  return (
    <span
      {...props}
      role="alert"
      className={joinClasses('ds-radio-group__error', className)}
    />
  );
}
