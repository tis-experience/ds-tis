import { Menu as ArkMenu } from '@ark-ui/react/menu';
import { Portal } from '@ark-ui/react/portal';
import { Check, ChevronDown } from 'lucide';
import { createElement } from 'react';

import './menu.css';

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

export function Menu(props) {
  return <ArkMenu.Root lazyMount unmountOnExit {...props} />;
}

export function MenuTrigger({ children, className = '', size = 'md', variant = 'outline', ...props }) {
  return (
    <ArkMenu.Trigger
      {...props}
      className={joinClasses('ds-button', `ds-button--${variant}`, `ds-button--${size}`, 'ds-ark-menu__trigger', className)}
    >
      {children}
    </ArkMenu.Trigger>
  );
}

export function MenuTriggerIndicator({ className = '' }) {
  return (
    <ArkMenu.Indicator className={joinClasses('ds-ark-menu__trigger-indicator', className)}>
      <LucideIcon className="ds-button__icon ds-icon" icon={ChevronDown} />
    </ArkMenu.Indicator>
  );
}

export function MenuPortal(props) {
  return <Portal {...props} />;
}

export function MenuPositioner({ className = '', ...props }) {
  return <ArkMenu.Positioner {...props} className={joinClasses('ds-ark-menu__positioner', className)} />;
}

export function MenuContent({ className = '', fullWidth = false, size = 'md', ...props }) {
  return (
    <ArkMenu.Content
      {...props}
      className={joinClasses('ds-menu', size !== 'md' && `ds-menu--${size}`, fullWidth && 'ds-menu--full', 'ds-ark-menu__content', className)}
    />
  );
}

function itemClasses({ className = '', destructive = false } = {}) {
  return joinClasses('ds-menu__item', destructive && 'ds-menu__item--destructive', 'ds-ark-menu__item', className);
}

export function MenuItem({ className = '', destructive = false, ...props }) {
  return <ArkMenu.Item {...props} className={itemClasses({ className, destructive })} />;
}

export function MenuCheckboxItem({ className = '', closeOnSelect = true, destructive = false, ...props }) {
  return (
    <ArkMenu.CheckboxItem
      {...props}
      className={itemClasses({ className, destructive })}
      closeOnSelect={closeOnSelect}
    />
  );
}

export function MenuRadioGroup({ className = '', ...props }) {
  return <ArkMenu.RadioItemGroup {...props} className={joinClasses('ds-menu__group', className)} />;
}

export function MenuRadioItem({ className = '', closeOnSelect = true, destructive = false, ...props }) {
  return (
    <ArkMenu.RadioItem
      {...props}
      className={itemClasses({ className, destructive })}
      closeOnSelect={closeOnSelect}
    />
  );
}

export function MenuItemIndicator({ className = '', ...props }) {
  return (
    <span aria-hidden="true" className={joinClasses('ds-menu__check', className)}>
      <ArkMenu.ItemIndicator {...props} className="ds-ark-menu__indicator">
        <LucideIcon icon={Check} />
      </ArkMenu.ItemIndicator>
    </span>
  );
}

export function MenuItemText({ className = '', ...props }) {
  return <ArkMenu.ItemText {...props} className={joinClasses('ds-menu__item-label', className)} />;
}

export function MenuItemIcon({ children, className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-menu__icon', className)}>{children}</span>;
}

export function MenuShortcut({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-menu__shortcut', className)} />;
}

export function MenuSeparator({ className = '', ...props }) {
  return <ArkMenu.Separator {...props} className={joinClasses('ds-menu__separator', className)} />;
}

export function MenuGroup({ className = '', ...props }) {
  return <ArkMenu.ItemGroup {...props} className={joinClasses('ds-menu__group', className)} />;
}

export function MenuGroupLabel({ className = '', ...props }) {
  return <ArkMenu.ItemGroupLabel {...props} className={joinClasses('ds-menu__label', className)} />;
}
