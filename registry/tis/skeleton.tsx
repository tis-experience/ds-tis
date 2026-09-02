import * as React from "react"

import { cn } from "./tis-utils"

type SkeletonVariant = "text" | "circle" | "rectangle"

type SkeletonProps = React.ComponentProps<"div"> & {
  variant?: SkeletonVariant
}

function Skeleton({
  className,
  variant = "text",
  "aria-hidden": ariaHidden = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      aria-hidden={ariaHidden}
      className={cn(
        "ds-skeleton",
        `ds-skeleton--${variant}`,
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton, type SkeletonProps, type SkeletonVariant }
