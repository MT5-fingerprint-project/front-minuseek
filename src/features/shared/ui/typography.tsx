import type React from 'react'
import { cn } from '@/features/shared/lib/utils'

type HeadingProps = React.ComponentProps<'h1'>

type TextProps = React.ComponentProps<'p'>

type SmallProps = React.ComponentProps<'small'>

export function H1({ className, ...props }: HeadingProps) {
  return <h1 className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight text-balance', className)} {...props} />
}

export function H2({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', className)}
      {...props}
    />
  )
}

export function H3({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props} />
}

export function H4({ className, ...props }: React.ComponentProps<'h4'>) {
  return <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props} />
}

export function P({ className, ...props }: TextProps) {
  return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />
}

export function Blockquote({ className, ...props }: React.ComponentProps<'blockquote'>) {
  return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />
}

export function List({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)} {...props} />
}

export function InlineCode({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
      {...props}
    />
  )
}

export function Lead({ className, ...props }: TextProps) {
  return <p className={cn('text-xl text-muted-foreground', className)} {...props} />
}

export function Large({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-lg font-semibold', className)} {...props} />
}

export function Small({ className, ...props }: SmallProps) {
  return <small className={cn('text-sm font-medium leading-none', className)} {...props} />
}

export function Muted({ className, ...props }: TextProps) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function Table({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('my-6 w-full overflow-y-auto', className)} {...props} />
}
