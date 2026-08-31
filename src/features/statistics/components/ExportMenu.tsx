import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/features/shared/ui/dropdown-menu'
import {
  buildServiceStatisticsExports,
  toCsv,
  type ExportScope,
} from '@/features/statistics/services/serviceStatisticsCsv'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

function downloadCsvFile(fileName: string, csvContent: string) {
  const objectUrl = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }))
  const downloadLink = document.createElement('a')
  downloadLink.href = objectUrl
  downloadLink.download = fileName
  downloadLink.click()
  URL.revokeObjectURL(objectUrl)
}

type ExportMenuProps = {
  statistics: ServiceStatistics
  scope: ExportScope
}

export default function ExportMenu({ statistics, scope }: ExportMenuProps) {
  const { t } = useTranslation()

  const availableExports = buildServiceStatisticsExports(statistics, scope, t)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="dark" className="rounded-sm">
          <Icon name="fileExport" size={18} color="currentColor" />
          {t('statistics.export.button')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[300px]">
        {availableExports.map((availableExport) => (
          <DropdownMenuItem
            key={availableExport.key}
            className="flex-col items-start gap-0"
            onSelect={() => downloadCsvFile(availableExport.fileName, toCsv(availableExport.buildRows()))}
          >
            <span>{availableExport.label}</span>
            <span className="text-xs font-normal text-muted-foreground">{availableExport.hint}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
