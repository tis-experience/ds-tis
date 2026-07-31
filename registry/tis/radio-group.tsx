import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "./tis-utils"

type RadioSize = "sm" | "md" | "lg"

type RadioGroupProps<Value = any> = Omit<
  RadioGroupPrimitive.Props<Value>,
  "className"
> & {
  className?: string
  invalid?: boolean
}

function RadioGroup<Value = any>({
  className,
  invalid = false,
  render,
  ...props
}: RadioGroupProps<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      render={render ?? <fieldset />}
      className={cn(
        "ds-radio-group",
        invalid && "ds-radio-group--error",
        className,
      )}
      {...props}
    />
  )
}

type RadioGroupItemProps = Omit<RadioPrimitive.Root.Props, "className"> & {
  className?: string
  size?: RadioSize
}

function RadioGroupItem({
  className,
  size = "md",
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "ds-radio",
        size !== "md" && `ds-radio--${size}`,
        className,
      )}
      {...props}
    />
  )
}

function RadioGroupLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return <legend data-slot="radio-group-legend" className={cn("ds-radio-group__legend", className)} {...props} />
}

function RadioGroupOption({ className, ...props }: React.ComponentProps<"label">) {
  return <label data-slot="radio-group-option" className={cn("ds-radio-label", className)} {...props} />
}

function RadioGroupContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="radio-group-content" className={cn("ds-radio__content", className)} {...props} />
}

function RadioGroupLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="radio-group-label" className={cn("ds-radio__label", className)} {...props} />
}

function RadioGroupDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="radio-group-description" className={cn("ds-radio__description", className)} {...props} />
}

function RadioGroupHelper({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="radio-group-helper" className={cn("ds-radio__helper", className)} {...props} />
}

function RadioGroupError({ className, ...props }: React.ComponentProps<"span">) {
  return <span role="alert" data-slot="radio-group-error" className={cn("ds-radio-group__error", className)} {...props} />
}

export {
  RadioGroup,
  RadioGroupContent,
  RadioGroupDescription,
  RadioGroupError,
  RadioGroupHelper,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
  type RadioGroupItemProps,
  type RadioGroupProps,
  type RadioSize,
}
