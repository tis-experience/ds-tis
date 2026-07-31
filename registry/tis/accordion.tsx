import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "./tis-utils"

type AccordionKeyDownEvent = Parameters<
  NonNullable<AccordionPrimitive.Root.Props["onKeyDown"]>
>[0]

function Accordion({
  className,
  onKeyDown,
  ...props
}: AccordionPrimitive.Root.Props) {
  function handleKeyDown(event: AccordionKeyDownEvent) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    const currentTrigger = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-slot="accordion-trigger"]',
    )
    if (!currentTrigger || !event.currentTarget.contains(currentTrigger)) return

    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[data-slot="accordion-trigger"]:not(:disabled):not([aria-disabled="true"])',
      ),
    )
    const currentIndex = triggers.indexOf(currentTrigger)
    if (currentIndex < 0 || triggers.length === 0) return

    let targetIndex: number | undefined
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        targetIndex = (currentIndex + 1) % triggers.length
        break
      case "ArrowUp":
      case "ArrowLeft":
        targetIndex = (currentIndex - 1 + triggers.length) % triggers.length
        break
      case "Home":
        targetIndex = 0
        break
      case "End":
        targetIndex = triggers.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    triggers[targetIndex].focus()
  }

  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("ds-accordion", className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  disabled,
  ...props
}: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "ds-accordion__item",
        disabled && "ds-accordion__item--disabled",
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
}

function AccordionTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="accordion-title"
      className={cn("ds-accordion__title", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  const content =
    typeof children === "string" || typeof children === "number" ? (
      <AccordionTitle>{children}</AccordionTitle>
    ) : (
      children
    )

  return (
    <AccordionPrimitive.Header data-slot="accordion-header">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn("ds-accordion__trigger", className)}
        {...props}
      >
        {content}
        <ChevronDownIcon
          aria-hidden="true"
          data-slot="accordion-trigger-icon"
          className="ds-accordion__chevron ds-icon"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn("ds-accordion__panel", className)}
      {...props}
    />
  )
}

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
}
