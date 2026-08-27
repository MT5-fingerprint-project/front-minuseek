import * as React from 'react'
import { Combobox as ComboboxPrimitive, type ComboboxRoot } from '@base-ui/react/combobox'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/features/shared/lib/utils'

function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxRoot.Props<Value, Multiple>
) {
  return <ComboboxPrimitive.Root {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "flex h-9 w-fit items-center justify-between gap-1.5 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 *:data-[slot=combobox-value]:line-clamp-1 *:data-[slot=combobox-value]:text-left dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.Icon>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </ComboboxPrimitive.Icon>
    </ComboboxPrimitive.Trigger>
  )
}

/** La primitive ne rend que le libellé, sans élément : le `span` porte la mise en forme. */
function ComboboxValue({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Value> & { className?: string }) {
  return (
    <span data-slot="combobox-value" className={cn('truncate', className)}>
      <ComboboxPrimitive.Value {...props} />
    </span>
  )
}

function ComboboxPortal({ ...props }: React.ComponentProps<typeof ComboboxPrimitive.Portal>) {
  return <ComboboxPrimitive.Portal data-slot="combobox-portal" {...props} />
}

function ComboboxPositioner({
  className,
  sideOffset = 4,
  align = 'start',
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Positioner>) {
  return (
    <ComboboxPrimitive.Positioner
      data-slot="combobox-positioner"
      sideOffset={sideOffset}
      align={align}
      className={cn('z-50', className)}
      {...props}
    />
  )
}

function ComboboxPopup({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Popup>) {
  return (
    <ComboboxPrimitive.Popup
      data-slot="combobox-popup"
      className={cn(
        'w-(--anchor-width) max-h-(--available-height) min-w-48 origin-(--transform-origin) overflow-hidden rounded-3xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 dark:ring-foreground/10',
        className
      )}
      {...props}
    />
  )
}

function ComboboxInput({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        'h-11 w-full min-w-0 border-b border-border/50 bg-transparent px-3 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-blue-medium-1 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.List>) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn('max-h-56 scroll-my-1.5 overflow-y-auto overscroll-contain p-1.5', className)}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2.5 rounded-2xl py-2 pr-8 pl-3 text-sm font-medium outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <ComboboxPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </ComboboxPrimitive.ItemIndicator>
      </span>
    </ComboboxPrimitive.Item>
  )
}

/** Reste monté même quand il n'a rien à dire : les lecteurs d'écran s'y abonnent. */
function ComboboxStatus({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Status>) {
  return (
    <ComboboxPrimitive.Status
      data-slot="combobox-status"
      className={cn('px-3 py-2.5 text-xs text-muted-foreground empty:hidden', className)}
      {...props}
    />
  )
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('px-3 py-2.5 text-xs text-muted-foreground empty:hidden', className)}
      {...props}
    />
  )
}

function ComboboxNotice({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="combobox-notice"
      className={cn('border-t border-border/50 px-3 py-2.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxNotice,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
}
