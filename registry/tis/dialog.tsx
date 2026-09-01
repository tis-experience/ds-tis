import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "./tis-utils"

type DialogSize = "sm" | "md" | "lg"

const dialogSizeClasses: Record<DialogSize, string> = {
  sm: "ds-modal--sm",
  md: "ds-modal--md",
  lg: "ds-modal--lg",
}

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn("ds-tis-dialog__backdrop", className)}
      {...props}
    />
  )
}

function DialogViewport({
  className,
  ...props
}: DialogPrimitive.Viewport.Props) {
  return (
    <DialogPrimitive.Viewport
      data-slot="dialog-viewport"
      className={cn("ds-tis-dialog__viewport", className)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  size = "sm",
  showCloseButton = true,
  closeLabel = "Fechar modal",
  ...props
}: DialogPrimitive.Popup.Props & {
  size?: DialogSize
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogViewport>
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "ds-modal ds-tis-dialog__popup",
            dialogSizeClasses[size],
            className,
          )}
          {...props}
          aria-modal="true"
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label={closeLabel}
              data-slot="dialog-close"
              className="ds-modal__close ds-tis-dialog__close"
              style={{
                right: "var(--ds-space-sm)",
                top: "var(--ds-space-sm)",
              }}
            >
              <XIcon aria-hidden="true" className="ds-icon" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogViewport>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="dialog-header"
      className={cn("ds-modal__header", className)}
      {...props}
    >
      <div className="ds-modal__heading">{children}</div>
    </header>
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("ds-modal__body", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="dialog-footer"
      className={cn("ds-modal__footer", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("ds-modal__title", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("ds-modal__description", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport,
}
