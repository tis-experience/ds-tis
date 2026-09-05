import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import { cn } from "./tis-utils"

type PaginationSize = "sm" | "md" | "lg"

type PaginationProps = React.ComponentProps<"nav"> & {
  size?: PaginationSize
}

function Pagination({
  "aria-label": ariaLabel = "Pagination",
  className,
  size = "md",
  ...props
}: PaginationProps) {
  return (
    <nav
      data-slot="pagination"
      data-size={size}
      aria-label={ariaLabel}
      className={cn(
        "ds-pagination",
        size !== "md" && `ds-pagination--${size}`,
        className,
      )}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("ds-pagination__list", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("ds-pagination__item", className)}
      {...props}
    />
  )
}

type PaginationLinkOwnProps = {
  className?: string
  disabled?: boolean
  isActive?: boolean
}

type PaginationLinkProps<Element extends React.ElementType> =
  PaginationLinkOwnProps & {
    as?: Element
  } & Omit<
    React.ComponentPropsWithoutRef<Element>,
    keyof PaginationLinkOwnProps | "as"
  >

function PaginationLink<Element extends React.ElementType = "a">({
  as,
  className,
  disabled = false,
  isActive = false,
  onClick,
  tabIndex,
  ...props
}: PaginationLinkProps<Element>) {
  const Component = as ?? "a"

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    if (disabled) {
      event.preventDefault()
      return
    }
    ;(onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event)
  }

  return (
    <Component
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      className={cn(
        "ds-pagination__page",
        isActive && "ds-pagination__page--current",
        className,
      )}
      onClick={handleClick}
      {...props}
    />
  )
}

type PaginationControlProps = Omit<React.ComponentProps<"a">, "children"> & {
  disabled?: boolean
  size?: PaginationSize
  text?: string
}

function paginationButtonSize(size: PaginationSize) {
  return size === "md" ? undefined : `ds-button--${size}`
}

function PaginationPrevious({
  "aria-label": ariaLabel,
  className,
  disabled = false,
  onClick,
  size = "md",
  tabIndex,
  text = "Previous page",
  ...props
}: PaginationControlProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <a
      data-slot="pagination-previous"
      aria-label={ariaLabel ?? text}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      className={cn(
        "ds-button ds-button--ghost ds-button--icon-only",
        paginationButtonSize(size),
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <ChevronLeftIcon className="ds-icon" aria-hidden="true" />
    </a>
  )
}

function PaginationNext({
  "aria-label": ariaLabel,
  className,
  disabled = false,
  onClick,
  size = "md",
  tabIndex,
  text = "Next page",
  ...props
}: PaginationControlProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <a
      data-slot="pagination-next"
      aria-label={ariaLabel ?? text}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      className={cn(
        "ds-button ds-button--ghost ds-button--icon-only",
        paginationButtonSize(size),
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <ChevronRightIcon className="ds-icon" aria-hidden="true" />
    </a>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      className={cn("ds-pagination__ellipsis", className)}
      {...props}
    >
      <MoreHorizontalIcon className="ds-icon" />
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationControlProps,
  type PaginationLinkProps,
  type PaginationProps,
  type PaginationSize,
}
