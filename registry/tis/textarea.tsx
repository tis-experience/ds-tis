import * as React from "react"

import { cn } from "./tis-utils"

type TextareaSize = "sm" | "md" | "lg"

type TextareaProps = Omit<React.ComponentProps<"textarea">, "className"> & {
  className?: string
  wrapperClassName?: string
  size?: TextareaSize
  filled?: boolean
}

function Textarea({
  className,
  wrapperClassName,
  size = "md",
  filled = false,
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  const invalid = ariaInvalid === true || ariaInvalid === "true"

  return (
    <div
      data-slot="textarea-root"
      className={cn(
        "ds-textarea",
        `ds-textarea--${size}`,
        filled && "ds-textarea--filled",
        invalid && "ds-textarea--error",
        disabled && "ds-textarea--disabled",
        readOnly && "ds-textarea--readonly",
        wrapperClassName,
      )}
    >
      <textarea
        data-slot="textarea"
        className={cn("ds-textarea__field", className)}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
    </div>
  )
}

export { Textarea, type TextareaProps, type TextareaSize }
