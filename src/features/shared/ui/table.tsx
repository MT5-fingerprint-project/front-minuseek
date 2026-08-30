import { cn } from '@/features/shared/lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full text-left text-sm text-blue-dark-2', className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('text-xs uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-t border-grey-light-2 transition-colors hover:bg-blue-light-1 data-[selected=true]:bg-blue-light-1',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return <th data-slot="table-head" scope="col" className={cn('px-4 py-3 font-medium', className)} {...props} />
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('px-4 py-3', className)} {...props} />
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
