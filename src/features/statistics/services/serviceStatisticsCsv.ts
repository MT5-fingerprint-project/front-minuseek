import type { TFunction } from 'i18next'
import { daysSince, formatDecimal, formatShortDate, yearOf } from '@/features/statistics/lib/format'
import { countOpenForMoreThanAMonth, operatorFullName } from '@/features/statistics/lib/openCases'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

export type CsvRow = (string | number)[]

export type ServiceStatisticsExport = {
  key: string
  label: string
  hint: string
  fileName: string
  buildRows: () => CsvRow[]
}

export type ExportScope = {
  operatorId: string | null
  label: string
}

const CSV_SEPARATOR = ';'
const CSV_LINE_BREAK = '\r\n'
const UTF8_BYTE_ORDER_MARK = '\uFEFF'

export function toCsv(rows: CsvRow[]): string {
  const body = rows
    .map((row) =>
      row
        .map((cellValue) => {
          const text = String(cellValue)
          return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
        })
        .join(CSV_SEPARATOR)
    )
    .join(CSV_LINE_BREAK)

  return UTF8_BYTE_ORDER_MARK + body
}

/** Une cellule vide et un zéro ne disent pas la même chose : un délai que le serveur n'a pas rendu reste vide. */
function optionalDecimal(value: number | null): string {
  return value === null ? '' : formatDecimal(value)
}

function buildSummaryRows(statistics: ServiceStatistics, scope: ExportScope, t: TFunction): CsvRow[] {
  const oldestOpenCase = statistics.cases.openCases[0]
  const unassignedLabel = t('statistics.byOperator.unassigned')

  return [
    [t('statistics.export.columns.indicator'), t('statistics.export.columns.value'), t('statistics.export.columns.detail')],
    [
      t('statistics.export.indicators.period'),
      t('statistics.export.periodValue', {
        from: formatShortDate(statistics.period.from),
        to: formatShortDate(statistics.period.to),
      }),
      '',
    ],
    [t('statistics.export.indicators.scope'), scope.label, ''],
    [t('statistics.export.indicators.openCases'), statistics.cases.open, ''],
    [
      t('statistics.export.indicators.openOver30Days'),
      countOpenForMoreThanAMonth(statistics.cases.openCases),
      t('statistics.export.over90DaysDetail', { count: statistics.cases.openOver90Days }),
    ],
    [
      t('statistics.export.indicators.oldestOpenCase'),
      oldestOpenCase ? oldestOpenCase.caseNumber : '',
      oldestOpenCase
        ? t('statistics.export.oldestCaseDetail', {
            days: oldestOpenCase.ageInDays,
            operator: operatorFullName(oldestOpenCase.operator, unassignedLabel),
          })
        : '',
    ],
    [t('statistics.export.indicators.openWithoutOperator'), statistics.signals.openWithoutOperator, ''],
    [t('statistics.export.indicators.dormant'), statistics.signals.dormantOver30Days, ''],
    [t('statistics.export.indicators.expertiseDeadlines'), statistics.signals.expertiseDeadlinesUnder15Days, ''],
    [t('statistics.export.indicators.openedInPeriod'), statistics.cases.openedInPeriod, ''],
    [t('statistics.export.indicators.closedInPeriod'), statistics.cases.closedInPeriod, ''],
    [t('statistics.export.indicators.medianClosureDays'), optionalDecimal(statistics.cases.medianClosureDays), ''],
    [
      t('statistics.export.indicators.ninthDecileClosureDays'),
      optionalDecimal(statistics.cases.ninthDecileClosureDays),
      '',
    ],
    [t('statistics.export.indicators.tracesCollected'), statistics.traces.collected, ''],
    [t('statistics.export.indicators.tracesExploitable'), statistics.traces.exploitable, ''],
    [t('statistics.export.indicators.tracesCompared'), statistics.traces.compared, ''],
    [t('statistics.export.indicators.tracesIdentified'), statistics.traces.identified, ''],
    [t('statistics.export.indicators.exploitableNeverCompared'), statistics.signals.exploitableNeverCompared, ''],
  ]
}

function buildOperatorRows(statistics: ServiceStatistics, scope: ExportScope, t: TFunction): CsvRow[] {
  const unassignedLabel = t('statistics.byOperator.unassigned')
  const scopedRows = scope.operatorId
    ? statistics.byOperator.filter((row) => row.operator?.id === scope.operatorId)
    : statistics.byOperator

  return [
    [
      t('statistics.export.columns.operator'),
      t('statistics.export.columns.openCases'),
      t('statistics.export.columns.closedInPeriod'),
      t('statistics.export.columns.medianClosureDays'),
    ],
    ...scopedRows.map((row) => [
      operatorFullName(row.operator, unassignedLabel),
      row.openCases,
      row.closedInPeriod,
      optionalDecimal(row.medianClosureDays),
    ]),
    [
      t('statistics.export.serviceRow'),
      statistics.cases.open,
      statistics.cases.closedInPeriod,
      optionalDecimal(statistics.cases.medianClosureDays),
    ],
  ]
}

function buildOpenCasesRows(statistics: ServiceStatistics, t: TFunction): CsvRow[] {
  const unassignedLabel = t('statistics.byOperator.unassigned')

  return [
    [
      t('statistics.export.columns.caseNumber'),
      t('statistics.export.columns.operator'),
      t('statistics.export.columns.openedOn'),
      t('statistics.export.columns.ageInDays'),
      t('statistics.export.columns.lastActivityOn'),
      t('statistics.export.columns.idleDays'),
    ],
    ...statistics.cases.openCases.map((openCase) => [
      openCase.caseNumber,
      operatorFullName(openCase.operator, unassignedLabel),
      formatShortDate(openCase.openedAt),
      openCase.ageInDays,
      openCase.lastActivityAt ? formatShortDate(openCase.lastActivityAt) : '',
      openCase.lastActivityAt ? daysSince(openCase.lastActivityAt) : '',
    ]),
  ]
}

function buildMonthlyFlowRows(statistics: ServiceStatistics, t: TFunction): CsvRow[] {
  return [
    [
      t('statistics.export.columns.month'),
      t('statistics.export.columns.openedCases'),
      t('statistics.export.columns.closedCases'),
      t('statistics.export.columns.balance'),
    ],
    ...statistics.cases.monthlyFlow.map((month) => [
      month.month,
      month.opened,
      month.closed,
      month.opened - month.closed,
    ]),
  ]
}

export function buildServiceStatisticsExports(
  statistics: ServiceStatistics,
  scope: ExportScope,
  t: TFunction
): ServiceStatisticsExport[] {
  const year = yearOf(statistics.period.from)

  return [
    {
      key: 'summary',
      label: t('statistics.export.summary.label'),
      hint: t('statistics.export.summary.hint'),
      fileName: t('statistics.export.summary.fileName', { year }),
      buildRows: () => buildSummaryRows(statistics, scope, t),
    },
    {
      key: 'operators',
      label: t('statistics.export.operators.label'),
      hint: t('statistics.export.operators.hint'),
      fileName: t('statistics.export.operators.fileName', { year }),
      buildRows: () => buildOperatorRows(statistics, scope, t),
    },
    {
      key: 'openCases',
      label: t('statistics.export.openCases.label'),
      hint: t('statistics.export.openCases.hint', { count: statistics.cases.openCases.length }),
      fileName: t('statistics.export.openCases.fileName', { year }),
      buildRows: () => buildOpenCasesRows(statistics, t),
    },
    {
      key: 'monthlyFlow',
      label: t('statistics.export.monthlyFlow.label'),
      hint: t('statistics.export.monthlyFlow.hint'),
      fileName: t('statistics.export.monthlyFlow.fileName', { year }),
      buildRows: () => buildMonthlyFlowRows(statistics, t),
    },
  ]
}
