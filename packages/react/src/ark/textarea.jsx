import { forwardRef } from 'react';
import { ark } from '@ark-ui/react/factory';

export const Textarea = forwardRef(function Textarea({
  'aria-invalid': ariaInvalid,
  className = '',
  disabled = false,
  filled = false,
  readOnly = false,
  size = 'md',
  wrapperClassName = '',
  ...props
}, ref) {
  const invalid = ariaInvalid === true || ariaInvalid === 'true';
  return (
    <div
      className={[
        'ds-textarea', `ds-textarea--${size}`, 'ds-ark-textarea',
        filled && 'ds-textarea--filled', invalid && 'ds-textarea--error',
        disabled && 'ds-textarea--disabled', readOnly && 'ds-textarea--readonly',
        wrapperClassName,
      ].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      data-filled={filled || undefined}
      data-readonly={readOnly || undefined}
      data-slot="textarea-root"
    >
      <ark.textarea
        {...props}
        aria-invalid={ariaInvalid}
        className={['ds-textarea__field', className].filter(Boolean).join(' ')}
        data-slot="textarea"
        disabled={disabled}
        readOnly={readOnly}
        ref={ref}
      />
    </div>
  );
});
