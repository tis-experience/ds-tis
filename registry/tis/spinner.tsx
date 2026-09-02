import * as React from "react"

import { cn } from "./tis-utils"

type SpinnerSize = "sm" | "md" | "lg"

type SpinnerProps = React.ComponentProps<"span"> & {
  onColor?: boolean
  size?: SpinnerSize
}

function Spinner({
  className,
  onColor = false,
  size = "md",
  role = "status",
  "aria-label": ariaLabel = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      data-size={size}
      data-on-color={onColor || undefined}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        "ds-spinner",
        `ds-spinner--${size}`,
        onColor && "ds-spinner--on-color",
        className,
      )}
      {...props}
    />
  )
}

export { Spinner, type SpinnerProps, type SpinnerSize }
