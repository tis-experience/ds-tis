import { Accordion as ArkAccordion } from '@ark-ui/react/accordion';
import { ChevronDown } from 'lucide';
import { createElement } from 'react';

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

export function Accordion({
  className = '',
  collapsible = true,
  defaultExpandedItems,
  expandedItems,
  mode = 'single',
  onExpandedItemsChange,
  ...props
}) {
  return (
    <ArkAccordion.Root
      {...props}
      className={joinClasses('ds-accordion', className)}
      collapsible={collapsible}
      defaultValue={defaultExpandedItems}
      multiple={mode === 'multiple'}
      onValueChange={onExpandedItemsChange
        ? ({ value }) => onExpandedItemsChange(value)
        : undefined}
      value={expandedItems}
    />
  );
}

export function AccordionItem({ className = '', disabled = false, ...props }) {
  return (
    <ArkAccordion.Item
      {...props}
      className={joinClasses(
        'ds-accordion__item',
        disabled && 'ds-accordion__item--disabled',
        className,
      )}
      disabled={disabled}
    />
  );
}

export function AccordionTitle({ className = '', ...props }) {
  return (
    <span
      {...props}
      className={joinClasses('ds-accordion__title', className)}
    />
  );
}

export function AccordionTrigger({ children, className = '', ...props }) {
  const content = typeof children === 'string' || typeof children === 'number'
    ? <AccordionTitle>{children}</AccordionTitle>
    : children;

  return (
    <ArkAccordion.ItemTrigger
      {...props}
      className={joinClasses('ds-accordion__trigger', className)}
    >
      {content}
      <LucideIcon
        className="ds-accordion__chevron ds-icon"
        icon={ChevronDown}
      />
    </ArkAccordion.ItemTrigger>
  );
}

export function AccordionContent({ className = '', ...props }) {
  return (
    <ArkAccordion.ItemContent
      {...props}
      className={joinClasses('ds-accordion__panel', className)}
    />
  );
}
