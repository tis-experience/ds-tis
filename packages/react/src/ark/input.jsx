import { forwardRef } from 'react';
import { ark } from '@ark-ui/react/factory';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function InputIcon({ children, className = '', slot = 'input-icon', ...props }) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={joinClasses('ds-input__icon', className)}
      data-slot={slot}
    >
      {children}
    </span>
  );
}

export const Input = forwardRef(function Input({
  'aria-invalid': ariaInvalid,
  className = '',
  disabled = false,
  filled = false,
  leadingIcon,
  readOnly = false,
  size = 'md',
  trailingIcon,
  wrapperClassName = '',
  ...props
}, ref) {
  const invalid = ariaInvalid === true || ariaInvalid === 'true';

  return (
    <div
      className={joinClasses(
        'ds-input',
        `ds-input--${size}`,
        filled && 'ds-input--filled',
        invalid && 'ds-input--error',
        disabled && 'ds-input--disabled',
        readOnly && 'ds-input--readonly',
        'ds-ark-input',
        wrapperClassName,
      )}
      data-disabled={disabled || undefined}
      data-filled={filled || undefined}
      data-invalid={invalid || undefined}
      data-readonly={readOnly || undefined}
      data-slot="input-root"
    >
      {leadingIcon ? <InputIcon slot="input-leading-icon">{leadingIcon}</InputIcon> : null}
      <ark.input
        {...props}
        aria-invalid={ariaInvalid}
        className={joinClasses('ds-input__field', className)}
        data-slot="input"
        disabled={disabled}
        readOnly={readOnly}
        ref={ref}
      />
      {trailingIcon ? <InputIcon slot="input-trailing-icon">{trailingIcon}</InputIcon> : null}
    </div>
  );
});
