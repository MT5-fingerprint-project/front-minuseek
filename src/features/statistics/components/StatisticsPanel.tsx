import type { ReactNode } from 'react'
import { cn } from '@/features/shared/lib/utils'

type StatisticsPanelProps = {
  title: string
  subtitle: string
  className?: string
  children: ReactNode
}

export default function StatisticsPanel({ title, subtitle, className, children }: StatisticsPanelProps) {
  return (
    <section className={cn('flex flex-col rounded-sm bg-white px-5 py-4 text-blue-dark-2', className)}>
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}
