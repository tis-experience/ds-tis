import * as React from "react"

import { cn } from "./tis-utils"

type TableSize = "sm" | "md"
type TableAlign = "start" | "end"

type TableProps = React.ComponentProps<"table"> & {
  containerClassName?: string
  containerProps?: Omit<React.ComponentProps<"div">, "children" | "className">
  fixed?: boolean
  nowrap?: boolean
  regionLabel?: string
  size?: TableSize
}

function Table({
  className,
  containerClassName,
  containerProps,
  fixed = false,
  nowrap = false,
  regionLabel,
  size = "sm",
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      role={regionLabel ? "region" : undefined}
      aria-label={regionLabel}
      tabIndex={regionLabel ? 0 : undefined}
      {...containerProps}
      className={cn("ds-table-region", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn(
          "ds-table",
          size === "md" && "ds-table--md",
          fixed && "ds-table--fixed",
          nowrap && "ds-table--nowrap",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("ds-table__header", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("ds-table__body", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={className} {...props} />
}

type TableRowProps = React.ComponentProps<"tr"> & {
  selected?: boolean
}

function TableRow({ className, selected = false, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected || undefined}
      className={cn("ds-table__row", selected && "ds-table__row--selected", className)}
      {...props}
    />
  )
}

type TableHeadProps = Omit<React.ComponentProps<"th">, "align"> & {
  align?: TableAlign
  sortable?: boolean
}

function TableHead({
  align = "start",
  className,
  scope = "col",
  sortable = false,
  ...props
}: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn(
        "ds-table__header-cell",
        align === "end" && "ds-table__header-cell--end",
        sortable && "ds-table__header-cell--sortable",
        className,
      )}
      {...props}
    />
  )
}

type TableCellProps = Omit<React.ComponentProps<"td">, "align"> & {
  align?: TableAlign
  control?: boolean
  truncate?: boolean
}

function TableCell({
  align = "start",
  className,
  control = false,
  truncate = false,
  ...props
}: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "ds-table__cell",
        align === "end" && "ds-table__cell--end",
        control && "ds-table__cell--control",
        truncate && "ds-table__cell--truncate",
        className,
      )}
      {...props}
    />
  )
}

type TableCellContentProps = React.ComponentProps<"div"> & {
  align?: TableAlign
}

function TableCellContent({
  align = "start",
  className,
  ...props
}: TableCellContentProps) {
  return (
    <div
      data-slot="table-cell-content"
      className={cn(
        "ds-table__cell-content",
        align === "end" && "ds-table__cell-content--end",
        className,
      )}
      {...props}
    />
  )
}

type TableSortButtonProps = React.ComponentProps<"button"> & {
  align?: TableAlign
}

function TableSortButton({
  align = "start",
  className,
  type = "button",
  ...props
}: TableSortButtonProps) {
  return (
    <button
      data-slot="table-sort-button"
      type={type}
      className={cn(
        "ds-table__sort",
        align === "end" && "ds-table__sort--end",
        className,
      )}
      {...props}
    />
  )
}

function TableSortIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="table-sort-icon"
      aria-hidden="true"
      className={cn("ds-table__sort-icon", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("ds-table__caption", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableCellContent,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
  TableSortIcon,
  type TableAlign,
  type TableCellContentProps,
  type TableCellProps,
  type TableHeadProps,
  type TableProps,
  type TableRowProps,
  type TableSize,
  type TableSortButtonProps,
}
