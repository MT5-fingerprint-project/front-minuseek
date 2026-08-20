import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Badge } from '@/features/shared/ui/badge'
import { Button } from '@/features/shared/ui/button'
import type { CaseReport } from '@/features/reporting/types/report'

type CaseReportListProps = {
  reports: CaseReport[]
  onDownload: (reportId: string) => void
  downloadingReportId?: string
}

export default function CaseReportList({ reports, onDownload, downloadingReportId }: CaseReportListProps) {
  const { t, i18n } = useTranslation()

  if (reports.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('reporting.empty')}</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => {
        const createdAt = new Date(report.createdAt)
        return (
          <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-b-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t(`reporting.type.${report.type}`)}</span>
                <Badge variant="secondary">{t('reporting.sealed')}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('reporting.byline', {
                  actor: report.generatedByDisplayName,
                  date: createdAt.toLocaleDateString(i18n.language),
                  time: createdAt.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
                })}
              </p>
              <p className="font-mono text-[10px] break-all text-muted-foreground">{report.sha256}</p>
            </div>
            <Button
              variant="grey"
              size="small"
              disabled={downloadingReportId === report.id}
              onClick={() => onDownload(report.id)}
            >
              <Icon name="fileExport" size={12} data-icon="inline-start" />
              {t('reporting.download')}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
