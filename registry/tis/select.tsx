import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, LanguagesIcon } from "lucide-react"

import { cn } from "./tis-utils"

type SelectSize = "sm" | "md" | "lg"

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>,
) {
  return <SelectPrimitive.Root {...props} />
}

function SelectField({
  className,
  invalid = false,
  ...props
}: React.ComponentProps<"div"> & { invalid?: boolean }) {
  return (
    <div
      className={cn("ds-field", invalid && "ds-field--error", className)}
      data-invalid={invalid || undefined}
      data-slot="select-field"
      {...props}
    />
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.Label.Props) {
  return (
    <SelectPrimitive.Label
      className={cn("ds-field__label", className)}
      data-slot="select-label"
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  invalid = false,
  size = "md",
  ...props
}: Omit<SelectPrimitive.Trigger.Props, "className"> & {
  className?: string
  invalid?: boolean
  size?: SelectSize
}) {
  return (
    <SelectPrimitive.Trigger
      className={(state) => cn(
        "ds-select",
        `ds-select--${size}`,
        "ds-tis-select__trigger",
        !state.placeholder && "ds-select--filled",
        state.disabled && "ds-select--disabled",
        state.readOnly && "ds-select--readonly",
        invalid && "ds-select--error",
        className,
      )}
      data-slot="select-trigger"
      {...props}
    />
  )
}

function SelectLeadingIcon({ className, ...props }: React.ComponentProps<typeof LanguagesIcon>) {
  return (
    <LanguagesIcon
      aria-hidden="true"
      className={cn("ds-select__icon ds-icon", className)}
      data-slot="select-leading-icon"
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      className={cn("ds-tis-select__value", className)}
      data-slot="select-value"
      {...props}
    />
  )
}

function SelectIndicator({ className, ...props }: React.ComponentProps<typeof ChevronDownIcon>) {
  return (
    <ChevronDownIcon
      aria-hidden="true"
      className={cn("ds-select__arrow", className)}
      data-slot="select-indicator"
      {...props}
    />
  )
}

function SelectPortal(props: SelectPrimitive.Portal.Props) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />
}

function SelectPositioner({
  alignItemWithTrigger = false,
  className,
  sideOffset = 0,
  ...props
}: SelectPrimitive.Positioner.Props) {
  return (
    <SelectPrimitive.Positioner
      alignItemWithTrigger={alignItemWithTrigger}
      className={cn("ds-tis-select__positioner", className)}
      data-slot="select-positioner"
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function SelectContent({ className, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Popup
      className={cn("ds-menu ds-menu--full ds-tis-select__content", className)}
      data-slot="select-content"
      {...props}
    />
  )
}

function SelectList({ className, ...props }: SelectPrimitive.List.Props) {
  return (
    <SelectPrimitive.List
      className={cn("ds-tis-select__list", className)}
      data-slot="select-list"
      {...props}
    />
  )
}

function SelectItem({ className, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={cn("ds-menu__item ds-tis-select__item", className)}
      data-slot="select-item"
      {...props}
    />
  )
}

function SelectItemIndicator({ className, ...props }: SelectPrimitive.ItemIndicator.Props) {
  return (
    <SelectPrimitive.ItemIndicator
      className={cn("ds-menu__check", className)}
      data-slot="select-item-indicator"
      {...props}
    >
      <CheckIcon aria-hidden="true" className="ds-icon" />
    </SelectPrimitive.ItemIndicator>
  )
}

function SelectItemText({ className, ...props }: SelectPrimitive.ItemText.Props) {
  return (
    <SelectPrimitive.ItemText
      className={cn("ds-menu__item-label", className)}
      data-slot="select-item-text"
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectField,
  SelectIndicator,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectLeadingIcon,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
}
