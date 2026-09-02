import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "./tis-utils"

const TooltipIdContext = React.createContext<string | null>(null)

function TooltipProvider({
  closeDelay = 100,
  delay = 100,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      closeDelay={closeDelay}
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ id, ...props }: TooltipPrimitive.Root.Props & { id?: string }) {
  const generatedId = React.useId().replaceAll(":", "")
  const tooltipId = id ?? `tis-tooltip-${generatedId}`

  return (
    <TooltipIdContext.Provider value={tooltipId}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipIdContext.Provider>
  )
}

function TooltipTrigger({ "aria-describedby": describedBy, ...props }: TooltipPrimitive.Trigger.Props) {
  const tooltipId = React.useContext(TooltipIdContext)
  const descriptions = [describedBy, tooltipId].filter(Boolean).join(" ") || undefined

  return (
    <TooltipPrimitive.Trigger
      aria-describedby={descriptions}
      data-slot="tooltip-trigger"
      {...props}
    />
  )
}

function TooltipPortal(props: TooltipPrimitive.Portal.Props) {
  return <TooltipPrimitive.Portal data-slot="tooltip-portal" {...props} />
}

function TooltipContent({
  align = "center",
  alignOffset = 0,
  children,
  className,
  showArrow = true,
  side = "top",
  sideOffset = 8,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    showArrow?: boolean
  }) {
  const tooltipId = React.useContext(TooltipIdContext)

  return (
    <TooltipPortal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="ds-tis-tooltip__positioner"
        data-slot="tooltip-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          className={cn("ds-tooltip__content ds-tis-tooltip__popup", className)}
          data-slot="tooltip-content"
          id={props.id ?? tooltipId ?? undefined}
          role="tooltip"
          {...props}
        >
          {showArrow ? (
            <TooltipPrimitive.Arrow
              className="ds-tis-tooltip__arrow"
              data-slot="tooltip-arrow"
            />
          ) : null}
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPortal>
  )
}

export {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
}
