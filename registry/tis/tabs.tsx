import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "./tis-utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("ds-tabs-root", className)}
      orientation={orientation}
      {...props}
    />
  )
}

function TabsList({
  activateOnFocus = true,
  className,
  loopFocus = true,
  onKeyDownCapture,
  ...props
}: TabsPrimitive.List.Props) {
  const handleKeyDownCapture: NonNullable<
    TabsPrimitive.List.Props["onKeyDownCapture"]
  > = (event) => {
    onKeyDownCapture?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    const current = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-slot="tabs-trigger"]',
    )
    if (!current || !event.currentTarget.contains(current)) return

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[data-slot="tabs-trigger"]:not([aria-disabled="true"])',
      ),
    )
    const currentIndex = tabs.indexOf(current)
    if (currentIndex < 0 || tabs.length === 0) return

    let targetIndex: number | undefined
    switch (event.key) {
      case "ArrowRight":
        targetIndex = (currentIndex + 1) % tabs.length
        break
      case "ArrowLeft":
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length
        break
      case "Home":
        targetIndex = 0
        break
      case "End":
        targetIndex = tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    event.stopPropagation()
    tabs[targetIndex].focus()
  }

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      activateOnFocus={activateOnFocus}
      className={cn("ds-tabs", className)}
      loopFocus={loopFocus}
      onKeyDownCapture={handleKeyDownCapture}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  disabled = false,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={(state) =>
        cn(
          "ds-tab",
          state.active && "ds-tab--active",
          state.disabled && "ds-tab--disabled",
          typeof className === "function" ? className(state) : className,
        )
      }
      disabled={disabled}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("ds-tab-panel", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
