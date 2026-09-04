import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Label } from '@/features/shared/ui/label'
import { Switch } from '@/features/shared/ui/switch'
import { Spinner } from '@/features/shared/ui/spinner'
import { H1 } from '@/features/shared/ui/typography'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import CaseReportList from '@/features/reporting/components/CaseReportList'
import ReportGenerationDialog, {
  type ReportGenerationStatus,
} from '@/features/reporting/components/ReportGenerationDialog'
import { useCaseReports, useDownloadReport, useGenerateReport } from '@/features/reporting/hooks/useCaseReports'
import type { GenerateReportInput, ReportType } from '@/features/reporting/types/report'

const JOURNAL_DETAIL_FIELD_ID = 'report-journal-detail'

/**
 * Durées mesurées sur dev le 04/09 : 10,6 s à 16,8 s pour un rapport technique avec
 * ses planches. L'annexe de traçabilité n'embarque aucune image, elle est bien plus courte.
 */
const EXPECTED_SECONDS: Record<ReportType, number> = {
  TECHNICAL: 15,
  TRACEABILITY: 5,
}

export default function CaseReportsPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const caseId = id ?? ''
  const { data: reports, isPending } = useCaseReports(caseId)
  const { data: currentUser } = useCurrentUser()
  const generate = useGenerateReport(caseId)
  const download = useDownloadReport()
  const [detailedJournal, setDetailedJournal] = useState(false)
  const [attempt, setAttempt] = useState<{ input: GenerateReportInput; startedAt: number } | null>(null)
  const journalDetail = detailedJournal ? 'FULL' : 'SUMMARY'

  const generatedReportNumber = generate.data
    ? reports?.find((report) => report.id === generate.data.id)?.number
    : undefined
  const dialogStatus: ReportGenerationStatus =
    generate.status === 'success' || generate.status === 'error' ? generate.status : 'pending'

  function launchGeneration(input: GenerateReportInput) {
    setAttempt({ input, startedAt: Date.now() })
    generate.mutate(input)
  }

  function closeDialog() {
    setAttempt(null)
    generate.reset()
  }

  if (isPending) return <Spinner className="size-6" />

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <H1 className="text-2xl font-bold">{t('reporting.title')}</H1>
        <p className="text-sm text-muted-foreground">{t('reporting.subtitle')}</p>
      </div>

      <section className="flex flex-col gap-4 rounded-sm bg-white px-4 py-3">
        {currentUser && (
          <p className="text-sm">
            {t('reporting.signer.notice', {
              signer: `${currentUser.grade} ${currentUser.lastName.toLocaleUpperCase('fr')} ${currentUser.firstName}`,
            })}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Switch
              id={JOURNAL_DETAIL_FIELD_ID}
              checked={detailedJournal}
              onCheckedChange={(checked) => setDetailedJournal(checked)}
            />
            <Label htmlFor={JOURNAL_DETAIL_FIELD_ID}>{t('reporting.journalDetail.label')}</Label>
          </div>
          <p className="text-xs text-muted-foreground">{t('reporting.journalDetail.hint')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="dark"
            size="small"
            disabled={generate.isPending}
            onClick={() => launchGeneration({ type: 'TECHNICAL', journalDetail })}
          >
            {t('reporting.generate.EXPLOITATION')}
          </Button>
          <Button
            variant="grey"
            size="small"
            disabled={generate.isPending}
            onClick={() => launchGeneration({ type: 'TRACEABILITY', journalDetail: 'SUMMARY' })}
          >
            {t('reporting.generate.TRACEABILITY')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('reporting.regenerateNotice')}</p>
        <p className="text-xs text-muted-foreground">{t('reporting.sealNotice')}</p>
      </section>

      <section className="flex flex-col gap-5 rounded-sm bg-white px-4 py-3">
        <h2 className="text-lg font-semibold">{t('reporting.listTitle')}</h2>
        <CaseReportList
          reports={reports ?? []}
          onDownload={(reportId) => download.mutate(reportId)}
          downloadingReportId={download.isPending ? download.variables : undefined}
        />
      </section>

      <ReportGenerationDialog
        open={attempt !== null}
        status={dialogStatus}
        startedAt={attempt?.startedAt ?? 0}
        expectedSeconds={EXPECTED_SECONDS[attempt?.input.type ?? 'TECHNICAL']}
        reportNumber={generatedReportNumber}
        isDownloading={download.isPending}
        onDownload={() => generate.data && download.mutate(generate.data.id)}
        onRetry={() => attempt && launchGeneration(attempt.input)}
        onClose={closeDialog}
      />
    </div>
  )
}
