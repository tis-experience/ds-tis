import { cloneElement, forwardRef, isValidElement } from 'react';
import { ark } from '@ark-ui/react/factory';

const classes = (...values) => values.filter(Boolean).join(' ');
const icon = (child) => isValidElement(child)
  ? cloneElement(child, { className: classes('ds-icon', child.props.className) }) : child;

export const Alert = forwardRef(function Alert({ tone = 'info', variant = 'subtle', role = 'status', className, ...props }, ref) {
  return <ark.div {...props} ref={ref} role={role} data-slot="alert" data-tone={tone} data-variant={variant}
    className={classes('ds-alert', `ds-alert--${tone}`, `ds-alert--${variant}`, 'ds-ark-alert', className)} />;
});

function part(tag, name) {
  const Element = ark[tag];
  return forwardRef(function AlertPart({ className, ...props }, ref) {
    return <Element {...props} ref={ref} className={classes(`ds-alert__${name}`, className)} data-slot={`alert-${name}`} />;
  });
}
export const AlertContent = part('div', 'content');
export const AlertTitle = part('p', 'title');
export const AlertDescription = part('p', 'description');
export const AlertActions = part('div', 'actions');
export function AlertIcon({ children, className, ...props }) {
  return <ark.span {...props} aria-hidden="true" className={classes('ds-alert__icon', className)} data-slot="alert-icon">{icon(children)}</ark.span>;
}
export const AlertClose = forwardRef(function AlertClose({ children, className, type = 'button', ...props }, ref) {
  return <ark.button {...props} ref={ref} type={type} className={classes('ds-alert__close', className)} data-slot="alert-close">{icon(children)}</ark.button>;
});
