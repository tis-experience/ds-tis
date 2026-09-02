import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "./tis-utils"

type MenuSize = "sm" | "md" | "lg"
type MenuVariant = "brand" | "danger" | "ghost" | "outline" | "secondary"

function Menu<Payload>(props: MenuPrimitive.Root.Props<Payload>) {
  return <MenuPrimitive.Root {...props} />
}

function MenuTrigger<Payload>({
  children,
  className,
  size = "md",
  variant = "outline",
  ...props
}: MenuPrimitive.Trigger.Props<Payload> & { size?: MenuSize; variant?: MenuVariant }) {
  return (
    <MenuPrimitive.Trigger
      className={cn("ds-button", `ds-button--${variant}`, `ds-button--${size}`, "ds-tis-menu__trigger", className)}
      data-slot="menu-trigger"
      {...props}
    >
      {children}
    </MenuPrimitive.Trigger>
  )
}

function MenuTriggerIndicator({ className, ...props }: React.ComponentProps<typeof ChevronDownIcon>) {
  return (
    <ChevronDownIcon
      aria-hidden="true"
      className={cn("ds-button__icon ds-icon ds-tis-menu__trigger-indicator", className)}
      data-slot="menu-trigger-indicator"
      {...props}
    />
  )
}

function MenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="menu-portal" {...props} />
}

function MenuPositioner({
  align = "start",
  className,
  side = "bottom",
  sideOffset = 8,
  ...props
}: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Positioner
      align={align}
      className={cn("ds-tis-menu__positioner", className)}
      data-slot="menu-positioner"
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function MenuContent({
  className,
  fullWidth = false,
  size = "md",
  ...props
}: MenuPrimitive.Popup.Props & { fullWidth?: boolean; size?: MenuSize }) {
  return (
    <MenuPrimitive.Popup
      className={cn("ds-menu", size !== "md" && `ds-menu--${size}`, fullWidth && "ds-menu--full", "ds-tis-menu__content", className)}
      data-slot="menu-content"
      {...props}
    />
  )
}

function menuItemClass(className?: string, destructive = false) {
  return cn("ds-menu__item", destructive && "ds-menu__item--destructive", "ds-tis-menu__item", className)
}

function MenuItem({
  className,
  destructive = false,
  ...props
}: Omit<MenuPrimitive.Item.Props, "className"> & { className?: string; destructive?: boolean }) {
  return (
    <MenuPrimitive.Item
      className={menuItemClass(className, destructive)}
      data-slot="menu-item"
      {...props}
    />
  )
}

function MenuCheckboxItem({
  className,
  closeOnClick = true,
  destructive = false,
  ...props
}: Omit<MenuPrimitive.CheckboxItem.Props, "className"> & { className?: string; destructive?: boolean }) {
  return (
    <MenuPrimitive.CheckboxItem
      className={menuItemClass(className, destructive)}
      closeOnClick={closeOnClick}
      data-slot="menu-checkbox-item"
      {...props}
    />
  )
}

function MenuRadioGroup({ className, ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup className={cn("ds-menu__group", className)} data-slot="menu-radio-group" {...props} />
}

function MenuRadioItem({
  className,
  closeOnClick = true,
  destructive = false,
  ...props
}: Omit<MenuPrimitive.RadioItem.Props, "className"> & { className?: string; destructive?: boolean }) {
  return (
    <MenuPrimitive.RadioItem
      className={menuItemClass(className, destructive)}
      closeOnClick={closeOnClick}
      data-slot="menu-radio-item"
      {...props}
    />
  )
}

function MenuCheckboxIndicator({ className, ...props }: MenuPrimitive.CheckboxItemIndicator.Props) {
  return (
    <span aria-hidden="true" className={cn("ds-menu__check", className)}>
      <MenuPrimitive.CheckboxItemIndicator
        className="ds-tis-menu__indicator"
        data-slot="menu-checkbox-indicator"
        {...props}
      >
        <CheckIcon aria-hidden="true" className="ds-icon" />
      </MenuPrimitive.CheckboxItemIndicator>
    </span>
  )
}

function MenuRadioIndicator({ className, ...props }: MenuPrimitive.RadioItemIndicator.Props) {
  return (
    <span aria-hidden="true" className={cn("ds-menu__check", className)}>
      <MenuPrimitive.RadioItemIndicator
        className="ds-tis-menu__indicator"
        data-slot="menu-radio-indicator"
        {...props}
      >
        <CheckIcon aria-hidden="true" className="ds-icon" />
      </MenuPrimitive.RadioItemIndicator>
    </span>
  )
}

function MenuItemText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ds-menu__item-label", className)} data-slot="menu-item-text" {...props} />
}

function MenuItemIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ds-menu__icon", className)} data-slot="menu-item-icon" {...props} />
}

function MenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ds-menu__shortcut", className)} data-slot="menu-shortcut" {...props} />
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return <MenuPrimitive.Separator className={cn("ds-menu__separator", className)} data-slot="menu-separator" {...props} />
}

function MenuGroup({ className, ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group className={cn("ds-menu__group", className)} data-slot="menu-group" {...props} />
}

function MenuGroupLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return <MenuPrimitive.GroupLabel className={cn("ds-menu__label", className)} data-slot="menu-group-label" {...props} />
}

export {
  Menu,
  MenuCheckboxIndicator,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemText,
  MenuPortal,
  MenuPositioner,
  MenuRadioGroup,
  MenuRadioIndicator,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  MenuTriggerIndicator,
}
