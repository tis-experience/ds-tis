import * as React from "react"

import { cn } from "./tis-utils"

type AlertTone = "success" | "warning" | "error" | "info"
type AlertVariant = "solid" | "subtle"

type AlertProps = React.ComponentProps<"div"> & {
  tone?: AlertTone
  variant?: AlertVariant
}

function Alert({
  className,
  tone = "info",
  variant = "subtle",
  role = "alert",
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      data-variant={variant}
      role={role}
      className={cn(
        "ds-alert",
        `ds-alert--${tone}`,
        `ds-alert--${variant}`,
        className,
      )}
      {...props}
    />
  )
}

function withDsIconClass(children: React.ReactNode) {
  if (!React.isValidElement<{ className?: string }>(children)) return children
  return React.cloneElement(children, {
    className: cn("ds-icon", children.props.className),
  })
}

function AlertIcon({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="alert-icon"
      className={cn("ds-alert__icon", className)}
      {...props}
    >
      {withDsIconClass(children)}
    </span>
  )
}

function AlertContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-content"
      className={cn("ds-alert__content", className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-title"
      className={cn("ds-alert__title", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-description"
      className={cn("ds-alert__description", className)}
      {...props}
    />
  )
}

function AlertActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-actions"
      className={cn("ds-alert__actions", className)}
      {...props}
    />
  )
}

type AlertCloseProps = React.ComponentProps<"button"> & {
  "aria-label": string
}

function AlertClose({
  className,
  children,
  type = "button",
  ...props
}: AlertCloseProps) {
  return (
    <button
      data-slot="alert-close"
      type={type}
      className={cn("ds-alert__close", className)}
      {...props}
    >
      {withDsIconClass(children)}
    </button>
  )
}

export {
  Alert,
  AlertActions,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  type AlertProps,
  type AlertTone,
  type AlertVariant,
}
