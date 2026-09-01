import * as React from "react"

import { cn } from "./tis-utils"

type CardVariant = "default" | "outlined" | "elevated" | "interactive"

type CardOwnProps = {
  className?: string
  selected?: boolean
  variant?: CardVariant
}

type CardProps<Element extends React.ElementType> = CardOwnProps & {
  as?: Element
} & Omit<React.ComponentPropsWithoutRef<Element>, keyof CardOwnProps | "as">

function Card<Element extends React.ElementType = "div">({
  as,
  className,
  selected = false,
  variant = "default",
  ...props
}: CardProps<Element>) {
  const Component = as ?? "div"

  return (
    <Component
      data-slot="card"
      data-variant={variant}
      data-selected={selected || undefined}
      className={cn(
        "ds-card",
        `ds-card--${variant}`,
        selected && "ds-card--selected",
        className,
      )}
      {...props}
    />
  )
}

function CardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-media"
      className={cn("ds-card__media", className)}
      {...props}
    />
  )
}

function CardContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-container"
      className={cn("ds-card__container", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("ds-card__header", className)}
      {...props}
    />
  )
}

type CardTitleProps = React.ComponentProps<"h3"> & {
  as?: "h2" | "h3" | "h4" | "p" | "div"
}

function CardTitle({
  as: Component = "h3",
  className,
  ...props
}: CardTitleProps) {
  return (
    <Component
      data-slot="card-title"
      className={cn("ds-card__title", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("ds-card__description", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("ds-card__body", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("ds-card__footer", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardContainer,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  type CardProps,
  type CardVariant,
}
