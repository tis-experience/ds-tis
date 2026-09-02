import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { cn } from "./tis-utils"

type ToastType = "error" | "info" | "success" | "warning"
type ToastStyle = "solid" | "subtle"
type ToastData = { style?: ToastStyle }

type ShowToastOptions = {
  actionLabel?: React.ReactNode
  description?: React.ReactNode
  duration?: number
  id?: string
  onAction?: (detail: { id: string; type: ToastType }) => void
  style?: ToastStyle
  title: React.ReactNode
  type?: ToastType
}

const DEFAULT_DURATION = 5000
const iconByType = {
  error: CircleAlertIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
}

function normalizeType(type?: ToastType): ToastType {
  return type && iconByType[type] ? type : "info"
}

function normalizeStyle(style?: ToastStyle): ToastStyle {
  return style === "solid" ? "solid" : "subtle"
}

const toastManager = ToastPrimitive.createToastManager<ToastData>()

function showToast(options: ShowToastOptions) {
  if (options.title === null || options.title === undefined || options.title === "") {
    throw new Error("showToast requires options.title")
  }

  const type = normalizeType(options.type)
  const style = normalizeStyle(options.style)
  let id = options.id ?? ""
  const actionProps = options.actionLabel
    ? {
        children: options.actionLabel,
        onClick: () => options.onAction?.({ id, type }),
      }
    : undefined

  id = toastManager.add({
    actionProps,
    data: { style },
    description: options.description,
    id: options.id,
    priority: type === "error" ? "high" : "low",
    timeout: options.duration ?? (actionProps ? 0 : DEFAULT_DURATION),
    title: options.title,
    type,
  })
  return id
}

function dismissToast(id?: string) {
  toastManager.close(id)
}

function ToastProvider({
  children,
  limit = 5,
  manager = toastManager,
  timeout = DEFAULT_DURATION,
}: Omit<ToastPrimitive.Provider.Props, "toastManager"> & {
  manager?: ReturnType<typeof ToastPrimitive.createToastManager<ToastData>>
}) {
  return (
    <ToastPrimitive.Provider limit={limit} timeout={timeout} toastManager={manager}>
      {children}
      <ToastPrimitive.Portal data-slot="toast-portal">
        <ToastPrimitive.Viewport
          className="ds-toast-region ds-tis-toast__viewport"
          data-slot="toast-viewport"
        >
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>()

  return toasts.map((toast) => {
    const type = normalizeType(toast.type as ToastType)
    const style = normalizeStyle(toast.data?.style)
    const Icon = iconByType[type]
    return (
      <ToastPrimitive.Root
        aria-hidden={false}
        className={cn(
          "ds-toast",
          `ds-toast--${type}`,
          `ds-toast--${style}`,
          "ds-tis-toast",
        )}
        data-slot="toast"
        key={toast.id}
        swipeDirection={["down", "right"]}
        toast={toast}
      >
        <ToastPrimitive.Content className="ds-tis-toast__content" data-slot="toast-content">
          <span className="ds-toast__icon" aria-hidden="true">
            <Icon className="ds-icon" />
          </span>
          <div className="ds-toast__content">
            <ToastPrimitive.Title className="ds-toast__title" data-slot="toast-title" />
            {toast.description ? (
              <ToastPrimitive.Description
                className="ds-toast__description"
                data-slot="toast-description"
              />
            ) : null}
            {toast.actionProps ? (
              <div className="ds-toast__actions">
                <ToastPrimitive.Action
                  className={cn(
                    "ds-button ds-button--ghost ds-button--sm",
                    toast.actionProps.className,
                  )}
                  data-slot="toast-action"
                />
              </div>
            ) : null}
          </div>
          <ToastPrimitive.Close
            aria-hidden={false}
            aria-label="Dispensar"
            className="ds-toast__close"
            data-slot="toast-close"
          >
            <XIcon className="ds-icon" aria-hidden="true" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    )
  })
}

export {
  dismissToast,
  showToast,
  toastManager,
  ToastList,
  ToastProvider,
}
