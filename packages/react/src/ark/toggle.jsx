import { Switch as ArkSwitch } from '@ark-ui/react/switch';

import './toggle.css';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Switch({ className = '', ...props }) {
  return (
    <ArkSwitch.Root
      {...props}
      className={joinClasses('ds-toggle-label', 'ds-ark-toggle', className)}
    />
  );
}

export function SwitchControl({ className = '', size = 'md', ...props }) {
  return (
    <ArkSwitch.Control
      {...props}
      className={joinClasses(
        'ds-toggle',
        size !== 'md' && `ds-toggle--${size}`,
        'ds-ark-toggle__control',
        className,
      )}
    />
  );
}

export function SwitchThumb({ className = '', ...props }) {
  return (
    <ArkSwitch.Thumb
      {...props}
      className={joinClasses('ds-ark-toggle__thumb', className)}
    />
  );
}

export function SwitchContent({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-toggle__content', className)} />;
}

export function SwitchTitle({ className = '', ...props }) {
  return (
    <ArkSwitch.Label
      {...props}
      className={joinClasses('ds-toggle__label', className)}
    />
  );
}

export function SwitchDescription({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-toggle__description', className)} />;
}

export function SwitchHelper({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-toggle__helper', className)} />;
}

export function SwitchHiddenInput(props) {
  return <ArkSwitch.HiddenInput role="switch" {...props} />;
}
