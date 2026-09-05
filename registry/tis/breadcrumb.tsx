import * as React from "react"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import { cn } from "./tis-utils"

function Breadcrumb({
  "aria-label": ariaLabel = "Breadcrumb",
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label={ariaLabel}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("ds-breadcrumb", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("ds-tis-breadcrumb__segment", className)}
      {...props}
    />
  )
}

type BreadcrumbLinkOwnProps = {
  className?: string
}

type BreadcrumbLinkProps<Element extends React.ElementType> =
  BreadcrumbLinkOwnProps & {
    as?: Element
  } & Omit<
    React.ComponentPropsWithoutRef<Element>,
    keyof BreadcrumbLinkOwnProps | "as"
  >

function BreadcrumbLink<Element extends React.ElementType = "a">({
  as,
  className,
  ...props
}: BreadcrumbLinkProps<Element>) {
  const Component = as ?? "a"

  return (
    <Component
      data-slot="breadcrumb-link"
      className={cn("ds-breadcrumb__item", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        "ds-breadcrumb__item ds-breadcrumb__item--current",
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("ds-breadcrumb__separator", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon className="ds-icon ds-icon--16" />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      aria-hidden="true"
      className={cn("ds-tis-breadcrumb__ellipsis", className)}
      {...props}
    >
      <MoreHorizontalIcon className="ds-icon ds-icon--16" />
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbLinkProps,
}
