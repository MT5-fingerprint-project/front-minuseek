import type { ReactNode } from 'react'

type FilterPanelProps = {
  filterLabel: string
  children: ReactNode
}

export default function FilterPanel({ filterLabel, children }: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-blue-dark-1 px-3 py-3 shadow-lg w-56">
      <span className="text-xs text-white/60">{filterLabel}</span>
      {children}
    </div>
  )
}
