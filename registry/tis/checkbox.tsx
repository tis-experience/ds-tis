import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "./tis-utils"

type CheckboxSize = "sm" | "md" | "lg"

type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "className"> & {
  className?: string
  size?: CheckboxSize
}

function Checkbox({ className, size = "md", ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "ds-checkbox",
        size !== "md" && `ds-checkbox--${size}`,
        className,
      )}
      {...props}
    />
  )
}

function CheckboxItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="checkbox-item" className={cn("ds-checkbox-item", className)} {...props} />
}

function CheckboxLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="checkbox-label" className={cn("ds-checkbox-label", className)} {...props} />
}

function CheckboxContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="checkbox-content" className={cn("ds-checkbox__content", className)} {...props} />
}

function CheckboxTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="checkbox-title" className={cn("ds-checkbox__label", className)} {...props} />
}

function CheckboxDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="checkbox-description" className={cn("ds-checkbox__description", className)} {...props} />
}

function CheckboxHelper({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="checkbox-helper" className={cn("ds-checkbox__helper", className)} {...props} />
}

export {
  Checkbox,
  CheckboxContent,
  CheckboxDescription,
  CheckboxHelper,
  CheckboxItem,
  CheckboxLabel,
  CheckboxTitle,
  type CheckboxProps,
  type CheckboxSize,
}
