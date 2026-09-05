import { forwardRef } from 'react';
import { ark } from '@ark-ui/react/factory';

export const Badge = forwardRef(function Badge({ tone = 'brand', variant = 'solid', className, ...props }, ref) {
  return <ark.span {...props} ref={ref} data-slot="badge" data-tone={tone} data-variant={variant}
    className={['ds-badge', `ds-badge--${tone}`, `ds-badge--${variant}`, 'ds-ark-badge', className].filter(Boolean).join(' ')} />;
});
