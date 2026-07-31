import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./tis-utils"

const buttonVariants = cva("ds-button", {
  variants: {
    variant: {
      default: "ds-button--brand",
      toned: "ds-button--toned",
      outline: "ds-button--outline",
      ghost: "ds-button--ghost",
      success: "ds-button--success",
      destructive: "ds-button--danger",
    },
    size: {
      default: null,
      sm: "ds-button--sm",
      lg: "ds-button--lg",
      icon: "ds-button--icon-only",
      "icon-sm": "ds-button--icon-only ds-button--sm",
      "icon-lg": "ds-button--icon-only ds-button--lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function ButtonLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="button-label"
      className={cn("ds-button__label", className)}
      {...props}
    />
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const content =
    typeof children === "string" || typeof children === "number" ? (
      <ButtonLabel>{children}</ButtonLabel>
    ) : (
      children
    )

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {content}
    </ButtonPrimitive>
  )
}

export { Button, ButtonLabel, buttonVariants }
