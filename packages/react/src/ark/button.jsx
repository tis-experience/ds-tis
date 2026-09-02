import { ark } from '@ark-ui/react/factory';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function ButtonLabel({ className = '', ...props }) {
  return <span {...props} className={joinClasses('ds-button__label', className)} />;
}

export function ButtonSpinner({ className = '', label = 'Carregando' }) {
  return (
    <span className={joinClasses('ds-button__spinner', className)}>
      <span aria-hidden="true" className="ds-spinner ds-spinner--sm" />
      <span className="ds-sr-only">{label}</span>
    </span>
  );
}

export function Button({
  asChild = false,
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  loading = false,
  loadingLabel = 'Carregando',
  size = 'md',
  type = 'button',
  variant = 'brand',
  ...props
}) {
  const content = !asChild && (typeof children === 'string' || typeof children === 'number')
    ? <ButtonLabel>{children}</ButtonLabel>
    : children;

  return (
    <ark.button
      {...props}
      asChild={asChild}
      aria-busy={loading || undefined}
      className={joinClasses(
        'ds-button',
        `ds-button--${variant}`,
        `ds-button--${size}`,
        iconOnly && 'ds-button--icon-only',
        fullWidth && 'ds-button--full',
        loading && 'ds-button--loading',
        'ds-ark-button',
        className,
      )}
      disabled={disabled || loading}
      type={asChild ? undefined : type}
    >
      {content}
      {loading && !asChild ? <ButtonSpinner label={loadingLabel} /> : null}
    </ark.button>
  );
}
