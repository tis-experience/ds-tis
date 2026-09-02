import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { XIcon } from "lucide-react"

import { cn } from "./tis-utils"

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverPortal(props: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />
}

function PopoverContent({
  align = "center",
  alignOffset = 0,
  children,
  className,
  showArrow = true,
  side = "bottom",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    showArrow?: boolean
  }) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="ds-tis-popover__positioner"
        data-slot="popover-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn("ds-popover__panel ds-tis-popover__popup", className)}
          data-slot="popover-content"
          {...props}
        >
          {showArrow ? (
            <PopoverPrimitive.Arrow
              className="ds-tis-popover__arrow"
              data-slot="popover-arrow"
            />
          ) : null}
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPortal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("ds-popover__header", className)}
      data-slot="popover-header"
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      className={cn("ds-popover__title", className)}
      data-slot="popover-title"
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      className={cn("ds-popover__body", className)}
      data-slot="popover-description"
      {...props}
    />
  )
}

function PopoverBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ds-popover__body", className)} data-slot="popover-body" {...props} />
}

function PopoverActions({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer className={cn("ds-popover__actions", className)} data-slot="popover-actions" {...props} />
}

function PopoverClose({
  children,
  className,
  label,
  ...props
}: PopoverPrimitive.Close.Props & { label?: string }) {
  const iconOnly = children == null
  const accessibleLabel = label ?? (iconOnly ? "Fechar popover" : undefined)

  return (
    <PopoverPrimitive.Close
      aria-label={accessibleLabel}
      className={cn(iconOnly && "ds-popover__close", className)}
      data-slot="popover-close"
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="ds-icon" />}
    </PopoverPrimitive.Close>
  )
}

export {
  Popover,
  PopoverActions,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
}
