import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "./tis-utils"

type SwitchSize = "sm" | "md" | "lg"

type SwitchProps = Omit<SwitchPrimitive.Root.Props, "className"> & {
  className?: string
  size?: SwitchSize
}

function Switch({ className, size = "md", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "ds-toggle",
        size !== "md" && `ds-toggle--${size}`,
        className,
      )}
      {...props}
    />
  )
}

function SwitchLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="switch-label" className={cn("ds-toggle-label", className)} {...props} />
}

function SwitchContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="switch-content" className={cn("ds-toggle__content", className)} {...props} />
}

function SwitchTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="switch-title" className={cn("ds-toggle__label", className)} {...props} />
}

function SwitchDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="switch-description" className={cn("ds-toggle__description", className)} {...props} />
}

function SwitchHelper({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="switch-helper" className={cn("ds-toggle__helper", className)} {...props} />
}

export {
  Switch,
  SwitchContent,
  SwitchDescription,
  SwitchHelper,
  SwitchLabel,
  SwitchTitle,
  type SwitchProps,
  type SwitchSize,
}
