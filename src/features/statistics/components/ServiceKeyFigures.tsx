import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { formatCount, formatDayCount, formatDecimal } from '@/features/statistics/lib/format'
import { countOpenForMoreThanAMonth } from '@/features/statistics/lib/openCases'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

type StatTileProps = {
  label: string
  value: string
  isValueAPhrase?: boolean
  context?: string
}

function StatTile({ label, value, isValueAPhrase = false, context }: StatTileProps) {
  return (
    <div className="rounded-sm bg-white px-5 py-4 text-blue-dark-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'my-1.5 leading-none',
          isValueAPhrase ? 'py-2 text-sm text-muted-foreground' : 'text-3xl font-semibold tracking-[-0.02em]'
        )}
      >
        {value}
      </p>
      {context && <p className="text-xs text-muted-foreground">{context}</p>}
    </div>
  )
}

type ServiceKeyFiguresProps = {
  cases: ServiceStatistics['cases']
  isServiceEmpty: boolean
}

export default function ServiceKeyFigures({ cases, isServiceEmpty }: ServiceKeyFiguresProps) {
  const { t } = useTranslation()

  const emptyPhrase = t('statistics.page.empty')
  const openForMoreThanAMonth = countOpenForMoreThanAMonth(cases.openCases)
  const elapsedMonths = cases.monthlyFlow.length

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatTile
        label={t('statistics.tiles.closedSinceJanuary')}
        value={isServiceEmpty ? emptyPhrase : formatCount(cases.closedInPeriod)}
        isValueAPhrase={isServiceEmpty}
        context={
          !isServiceEmpty && elapsedMonths > 0 && cases.closedInPeriod > 0
            ? t('statistics.tiles.closedPerMonth', { average: formatDecimal(cases.closedInPeriod / elapsedMonths) })
            : undefined
        }
      />
      <StatTile
        label={t('statistics.tiles.medianClosure')}
        value={
          isServiceEmpty
            ? emptyPhrase
            : cases.medianClosureDays === null
              ? t('statistics.tiles.noClosure')
              : t('statistics.tiles.medianClosureValue', { days: formatDayCount(cases.medianClosureDays) })
        }
        isValueAPhrase={isServiceEmpty || cases.medianClosureDays === null}
        context={
          !isServiceEmpty && cases.ninthDecileClosureDays !== null
            ? t('statistics.tiles.ninthDecile', { days: formatDayCount(cases.ninthDecileClosureDays) })
            : undefined
        }
      />
      <StatTile
        label={t('statistics.tiles.openOverOneMonth')}
        value={isServiceEmpty ? emptyPhrase : formatCount(openForMoreThanAMonth)}
        isValueAPhrase={isServiceEmpty}
        context={!isServiceEmpty ? t('statistics.tiles.openOver90Days', { count: cases.openOver90Days }) : undefined}
      />
    </div>
  )
}
