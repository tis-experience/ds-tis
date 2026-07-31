import * as React from "react"

import { cn } from "./tis-utils"

type FieldOrientation = "vertical" | "horizontal"

function Field({
  className,
  orientation = "vertical",
  invalid = false,
  disabled = false,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: FieldOrientation
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "ds-field",
        invalid && "ds-field--error",
        disabled && "ds-tis-field--disabled",
        orientation === "horizontal" && "ds-tis-field--horizontal",
        className,
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("ds-tis-field-group", className)}
      {...props}
    />
  )
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("ds-tis-field-set", className)}
      {...props}
    />
  )
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("ds-field__label ds-tis-field-legend", className)}
      {...props}
    />
  )
}

function FieldLabelRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label-row"
      className={cn("ds-field__label-row", className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn("ds-field__label", className)}
      {...props}
    />
  )
}

function FieldRequired({
  className,
  children = "*",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="field-required"
      className={cn("ds-field__required", className)}
      {...props}
    >
      {children}
    </span>
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("ds-tis-field-content", className)}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="field-title"
      className={cn("ds-field__label", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="field-description"
      className={cn("ds-field__helper", className)}
      {...props}
    />
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"span"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = React.useMemo(() => {
    if (children) return children
    const messages = Array.from(
      new Set(errors?.map((error) => error?.message).filter(Boolean)),
    )
    if (messages.length === 0) return null
    if (messages.length === 1) return messages[0]
    return (
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    )
  }, [children, errors])

  if (!content) return null

  return (
    <span
      role="alert"
      data-slot="field-error"
      className={cn("ds-field__error", className)}
      {...props}
    >
      {content}
    </span>
  )
}

function FieldCounter({
  className,
  over = false,
  ...props
}: React.ComponentProps<"span"> & { over?: boolean }) {
  return (
    <span
      data-slot="field-counter"
      className={cn(
        "ds-field__counter",
        over && "ds-field__counter--over",
        className,
      )}
      {...props}
    />
  )
}

export {
  Field,
  FieldContent,
  FieldCounter,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLabelRow,
  FieldLegend,
  FieldRequired,
  FieldSet,
  FieldTitle,
}
