import {
  Toast as ArkToast,
  Toaster,
  createToaster,
} from '@ark-ui/react/toast';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide';
import { createElement } from 'react';

import './toast.css';

const DEFAULT_DURATION = 5000;
const iconByType = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
};

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

function normalizeType(type) {
  return iconByType[type] ? type : 'info';
}

function normalizeStyle(style) {
  return style === 'solid' ? 'solid' : 'subtle';
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

export const toastManager = createToaster({
  duration: DEFAULT_DURATION,
  gap: 8,
  max: 5,
  offsets: 'var(--ds-space-lg)',
  overlap: false,
  placement: 'bottom-end',
});

export function showToast(options = {}) {
  if (options.title === null || options.title === undefined || options.title === '') {
    throw new Error('showToast requires options.title');
  }

  const type = normalizeType(options.type);
  const style = normalizeStyle(options.style);
  let id;
  const action = options.actionLabel
    ? {
        label: String(options.actionLabel),
        onClick: () => options.onAction?.({ id, type }),
      }
    : undefined;

  id = toastManager.create({
    action,
    closable: true,
    description: options.description,
    duration: options.duration ?? (action ? Infinity : DEFAULT_DURATION),
    ...(options.id ? { id: options.id } : {}),
    meta: { style },
    title: options.title,
    type,
  });
  return id;
}

export function dismissToast(id) {
  toastManager.dismiss(id);
}

export function ToastRegion({ className = '', manager = toastManager, ...props }) {
  return (
    <Toaster
      {...props}
      className={joinClasses('ds-toast-region', 'ds-ark-toast-region', className)}
      toaster={manager}
    >
      {(toast) => {
        const type = normalizeType(toast.type);
        const style = normalizeStyle(toast.meta?.style);
        return (
          <ArkToast.Root
            className={joinClasses(
              'ds-toast',
              `ds-toast--${type}`,
              `ds-toast--${style}`,
              'ds-ark-toast',
            )}
          >
            <span className="ds-toast__icon" aria-hidden="true">
              <LucideIcon icon={iconByType[type]} />
            </span>
            <div className="ds-toast__content">
              <ArkToast.Title className="ds-toast__title">
                {toast.title}
              </ArkToast.Title>
              {toast.description ? (
                <ArkToast.Description className="ds-toast__description">
                  {toast.description}
                </ArkToast.Description>
              ) : null}
              {toast.action ? (
                <div className="ds-toast__actions">
                  <button
                    className="ds-button ds-button--ghost ds-button--sm"
                    onClick={() => toast.action?.onClick?.()}
                    type="button"
                  >
                    <span className="ds-button__label">{toast.action.label}</span>
                  </button>
                </div>
              ) : null}
            </div>
            <ArkToast.CloseTrigger className="ds-toast__close" aria-label="Dispensar">
              <LucideIcon icon={X} />
            </ArkToast.CloseTrigger>
          </ArkToast.Root>
        );
      }}
    </Toaster>
  );
}
