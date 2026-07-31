import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "./tis-utils"

type InputSize = "sm" | "md" | "lg"

type InputProps = Omit<InputPrimitive.Props, "className" | "size"> & {
  className?: string
  wrapperClassName?: string
  size?: InputSize
  filled?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

function Input({
  className,
  wrapperClassName,
  size = "md",
  filled = false,
  leadingIcon,
  trailingIcon,
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const invalid = ariaInvalid === true || ariaInvalid === "true"

  return (
    <div
      data-slot="input-root"
      className={cn(
        "ds-input",
        `ds-input--${size}`,
        filled && "ds-input--filled",
        invalid && "ds-input--error",
        disabled && "ds-input--disabled",
        readOnly && "ds-input--readonly",
        wrapperClassName,
      )}
    >
      {leadingIcon && (
        <span aria-hidden="true" data-slot="input-leading-icon" className="ds-input__icon">
          {leadingIcon}
        </span>
      )}
      <InputPrimitive
        data-slot="input"
        className={cn("ds-input__field", className)}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
      {trailingIcon && (
        <span aria-hidden="true" data-slot="input-trailing-icon" className="ds-input__icon">
          {trailingIcon}
        </span>
      )}
    </div>
  )
}

export { Input, type InputProps, type InputSize }
