import * as React from "react"

import { cn } from "./tis-utils"

type SeparatorOrientation = "horizontal" | "vertical"

type SeparatorProps = React.ComponentProps<"hr"> & {
  decorative?: boolean
  orientation?: SeparatorOrientation
}

function Separator({
  className,
  decorative = false,
  orientation = "horizontal",
  role,
  ...props
}: SeparatorProps) {
  return (
    <hr
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "presentation" : role}
      aria-hidden={decorative || undefined}
      aria-orientation={
        !decorative && orientation === "vertical" ? "vertical" : undefined
      }
      className={cn(
        "ds-divider",
        orientation === "vertical" && "ds-divider--vertical",
        className,
      )}
      {...props}
    />
  )
}

export { Separator, type SeparatorOrientation, type SeparatorProps }
