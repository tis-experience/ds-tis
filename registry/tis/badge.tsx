import * as React from "react"

import { cn } from "./tis-utils"

type BadgeTone = "brand" | "success" | "warning" | "error" | "info" | "neutral"
type BadgeVariant = "solid" | "subtle"

type BadgeProps = React.ComponentProps<"span"> & {
  tone?: BadgeTone
  variant?: BadgeVariant
}

function Badge({
  className,
  tone = "brand",
  variant = "solid",
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      data-variant={variant}
      className={cn(
        "ds-badge",
        `ds-badge--${tone}`,
        `ds-badge--${variant}`,
        className,
      )}
      {...props}
    />
  )
}

export { Badge, type BadgeProps, type BadgeTone, type BadgeVariant }
