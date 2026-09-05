import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "./tis-utils"

type AvatarSize = "sm" | "md" | "lg"

type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: AvatarSize
}

function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn("ds-avatar", `ds-avatar--${size}`, className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("ds-tis-avatar__image", className)}
      {...props}
    />
  )
}

type AvatarFallbackProps = AvatarPrimitive.Fallback.Props & {
  icon?: boolean
}

function AvatarFallback({ className, icon = false, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-icon={icon || undefined}
      className={cn("ds-tis-avatar__fallback", className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn("ds-tis-avatar__badge", className)}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      role="group"
      className={cn("ds-tis-avatar__group", className)}
      {...props}
    />
  )
}

type AvatarGroupCountProps = React.ComponentProps<"span"> & {
  size?: AvatarSize
}

function AvatarGroupCount({ className, size = "md", ...props }: AvatarGroupCountProps) {
  return (
    <span
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(
        "ds-avatar",
        `ds-avatar--${size}`,
        "ds-tis-avatar__group-count",
        className,
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  type AvatarFallbackProps,
  type AvatarGroupCountProps,
  type AvatarProps,
  type AvatarSize,
}
