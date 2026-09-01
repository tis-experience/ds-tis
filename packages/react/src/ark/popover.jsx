import { Popover as ArkPopover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { X } from 'lucide';
import { createElement } from 'react';

import './popover.css';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

function textFromChildren(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textFromChildren).join(' ');
  if (node && typeof node === 'object' && 'props' in node) return textFromChildren(node.props.children);
  return '';
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

export function Popover({ placement = 'bottom', positioning, ...props }) {
  return (
    <ArkPopover.Root
      lazyMount
      positioning={{ placement, ...positioning }}
      unmountOnExit
      {...props}
    />
  );
}

export function PopoverTrigger(props) {
  return <ArkPopover.Trigger {...props} />;
}

export function PopoverContent({
  children,
  className = '',
  showArrow = true,
  ...props
}) {
  return (
    <Portal>
      <ArkPopover.Positioner className="ds-ark-popover__positioner">
        <ArkPopover.Content
          className={`ds-popover__panel ds-ark-popover__panel ${className}`.trim()}
          {...props}
        >
          {showArrow ? (
            <ArkPopover.Arrow className="ds-ark-popover__arrow">
              <ArkPopover.ArrowTip className="ds-ark-popover__arrow-tip" />
            </ArkPopover.Arrow>
          ) : null}
          {children}
        </ArkPopover.Content>
      </ArkPopover.Positioner>
    </Portal>
  );
}

export function PopoverHeader(props) {
  return <header className="ds-popover__header" {...props} />;
}

export function PopoverTitle(props) {
  return <ArkPopover.Title className="ds-popover__title" {...props} />;
}

export function PopoverDescription(props) {
  return <ArkPopover.Description className="ds-popover__body" {...props} />;
}

export function PopoverBody(props) {
  return <div className="ds-popover__body" {...props} />;
}

export function PopoverActions(props) {
  return <footer className="ds-popover__actions" {...props} />;
}

export function PopoverClose({ children, className = '', label, ...props }) {
  const iconOnly = children == null;
  const childLabel = textFromChildren(children).trim();
  const accessibleLabel = label ?? (iconOnly ? 'Fechar popover' : childLabel || undefined);

  return (
    <ArkPopover.CloseTrigger
      aria-label={accessibleLabel}
      className={joinClasses(iconOnly && 'ds-popover__close', className)}
      type="button"
      {...props}
    >
      {children ?? <LucideIcon icon={X} />}
    </ArkPopover.CloseTrigger>
  );
}
