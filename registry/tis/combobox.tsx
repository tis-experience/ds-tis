import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "./tis-utils"

type ComboboxSize = "sm" | "md" | "lg"

function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple>,
) {
  return <ComboboxPrimitive.Root {...props} />
}

function ComboboxField({
  className,
  disabled = false,
  invalid = false,
  ...props
}: React.ComponentProps<"div"> & { disabled?: boolean; invalid?: boolean }) {
  return (
    <div
      className={cn(
        "ds-field",
        invalid && "ds-field--error",
        disabled && "ds-tis-combobox-field--disabled",
        className,
      )}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      data-slot="combobox-field"
      {...props}
    />
  )
}

function ComboboxLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("ds-field__label", className)} data-slot="combobox-label" {...props} />
}

function ComboboxAnchor({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ds-combobox-anchor", className)} data-slot="combobox-anchor" {...props} />
}

function ComboboxControl({
  className,
  filled = false,
  invalid = false,
  size = "md",
  ...props
}: Omit<ComboboxPrimitive.InputGroup.Props, "className"> & {
  className?: string
  filled?: boolean
  invalid?: boolean
  size?: ComboboxSize
}) {
  return (
    <ComboboxPrimitive.InputGroup
      className={(state) => cn(
        "ds-combobox",
        `ds-combobox--${size}`,
        (filled || !state.placeholder) && "ds-combobox--filled",
        state.open && "ds-combobox--open",
        state.disabled && "ds-combobox--disabled",
        state.readOnly && "ds-combobox--readonly",
        invalid && "ds-combobox--error",
        className,
      )}
      data-slot="combobox-control"
      {...props}
    />
  )
}

function ComboboxLeadingIcon({ className, ...props }: React.ComponentProps<typeof SearchIcon>) {
  return <SearchIcon aria-hidden="true" className={cn("ds-combobox__icon ds-icon", className)} data-slot="combobox-leading-icon" {...props} />
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return <ComboboxPrimitive.Input className={cn("ds-combobox__input", className)} data-slot="combobox-input" {...props} />
}

function ComboboxClear({
  children,
  className,
  label = "Limpar seleção",
  ...props
}: ComboboxPrimitive.Clear.Props & { label?: string }) {
  return (
    <ComboboxPrimitive.Clear
      aria-label={label}
      className={cn("ds-combobox__clear", className)}
      data-slot="combobox-clear"
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="ds-icon" />}
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxChevron({ className, ...props }: React.ComponentProps<typeof ChevronDownIcon>) {
  return <ChevronDownIcon aria-hidden="true" className={cn("ds-combobox__chevron ds-icon", className)} data-slot="combobox-chevron" {...props} />
}

function ComboboxPortal(props: ComboboxPrimitive.Portal.Props) {
  return <ComboboxPrimitive.Portal data-slot="combobox-portal" {...props} />
}

function ComboboxPositioner({ className, sideOffset = 0, ...props }: ComboboxPrimitive.Positioner.Props) {
  return (
    <ComboboxPrimitive.Positioner
      className={cn("ds-combobox-anchor ds-tis-combobox__positioner", className)}
      data-slot="combobox-positioner"
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function ComboboxContent({ className, ...props }: ComboboxPrimitive.Popup.Props) {
  return (
    <ComboboxPrimitive.Popup
      className={cn("ds-combobox__listbox ds-tis-combobox__popup", className)}
      data-slot="combobox-content"
      {...props}
    />
  )
}

function ComboboxList(props: ComboboxPrimitive.List.Props) {
  return <ComboboxPrimitive.List data-slot="combobox-list" {...props} />
}

function ComboboxItem({ className, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      className={cn("ds-combobox__option", className)}
      data-slot="combobox-item"
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxAnchor,
  ComboboxChevron,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxField,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxLeadingIcon,
  ComboboxList,
  ComboboxPortal,
  ComboboxPositioner,
}
