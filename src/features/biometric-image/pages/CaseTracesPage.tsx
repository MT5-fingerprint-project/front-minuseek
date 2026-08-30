import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Badge } from '@/features/shared/ui/badge'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/shared/ui/table'
import { H1 } from '@/features/shared/ui/typography'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import BiometricImageImportButton from '@/features/biometric-image/components/carousel/BiometricImageImportButton'
import TraceDetailsPanel from '@/features/biometric-image/components/trace/TraceDetailsPanel'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { traceStateBadge } from '@/features/biometric-image/lib/traceState'

const TRACE_PARAM = 'trace'

function NotProvided() {
  const { t } = useTranslation()

  return <span className="text-muted-foreground">{t('trace.panel.notProvided')}</span>
}

function LocationPhotoCell({ hasLocationPhoto }: { hasLocationPhoto: boolean }) {
  const { t } = useTranslation()
  const label = t(hasLocationPhoto ? 'trace.locationPhoto.present' : 'trace.locationPhoto.absent')

  return (
    <span title={label}>
      <span className="sr-only">{label}</span>
      {hasLocationPhoto ? (
        <Icon name="location" size={20} color="var(--color-blue-medium-1)" aria-hidden />
      ) : (
        <span aria-hidden className="text-muted-foreground">
          —
        </span>
      )}
    </span>
  )
}

export default function CaseTracesPage() {
  const { id } = useParams<{ id: string }>()
  const caseId = id ?? ''
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: investigationCase } = useInvestigationCase(caseId)
  const { data: traces = [], isPending } = useBiometricImages('traces', caseId)

  const selectedTraceId = searchParams.get(TRACE_PARAM)
  // Le tiroir garde sa trace le temps de se refermer : l'adresse, elle, est vidée au premier clic.
  const [openedTraceId, setOpenedTraceId] = useState(selectedTraceId)
  const isStateHidden = traces.some((trace) => traceStateBadge(trace) === null)
  const identifiedCount = traces.filter((trace) => trace.identified).length

  const openTrace = (traceId: string) => {
    setOpenedTraceId(traceId)
    setSearchParams(
      (params) => {
        params.set(TRACE_PARAM, traceId)
        return params
      },
      { replace: true }
    )
  }

  const closePanel = () => {
    setSearchParams(
      (params) => {
        params.delete(TRACE_PARAM)
        return params
      },
      { replace: true }
    )
  }

  if (isPending) return <Spinner className="size-6" />

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <H1 className="text-2xl font-bold">
            {t('trace.list.title', { caseNumber: investigationCase?.caseNumber ?? '' })}
          </H1>
          <p className="text-sm text-muted-foreground">
            {isStateHidden
              ? t('trace.list.summaryWithoutState', { count: traces.length })
              : t('trace.list.summary', { count: traces.length, identified: identifiedCount })}
          </p>
        </div>
        <BiometricImageImportButton type="traces" caseId={caseId} variant="blue" />
      </div>

      <div className="rounded-sm bg-white">
        {traces.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t('trace.list.empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('trace.list.columns.number')}</TableHead>
                <TableHead>{t('trace.list.columns.image')}</TableHead>
                <TableHead>{t('trace.list.columns.origin')}</TableHead>
                <TableHead>{t('trace.list.columns.location')}</TableHead>
                <TableHead className="w-16">{t('trace.list.columns.locationPhoto')}</TableHead>
                <TableHead>{t('trace.list.columns.revelation')}</TableHead>
                <TableHead>{t('trace.list.columns.state')}</TableHead>
                <TableHead>{t('trace.list.columns.depositedOn')}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{t('trace.list.columns.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traces.map((trace) => {
                const state = traceStateBadge(trace)

                return (
                  <TableRow
                    key={trace.id}
                    data-selected={trace.id === selectedTraceId}
                    onClick={() => openTrace(trace.id)}
                    className="group cursor-pointer"
                  >
                    <TableCell className="font-semibold">
                      <button
                        type="button"
                        onClick={() => openTrace(trace.id)}
                        className="rounded-[2px] outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                      >
                        {trace.label}
                      </button>
                    </TableCell>
                    <TableCell>
                      <img
                        src={trace.url ?? undefined}
                        alt={trace.label}
                        loading="lazy"
                        decoding="async"
                        className="size-12 rounded-sm object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      {trace.origin ? t(`trace.origin.${trace.origin}`) : <NotProvided />}
                    </TableCell>
                    <TableCell className="max-w-64">
                      {trace.location ? (
                        <span className="block truncate" title={trace.location}>
                          {trace.location}
                        </span>
                      ) : (
                        <NotProvided />
                      )}
                    </TableCell>
                    <TableCell>
                      <LocationPhotoCell hasLocationPhoto={trace.hasLocationPhoto} />
                    </TableCell>
                    <TableCell>
                      {trace.revelationTechnique ? (
                        t(`trace.technique.${trace.revelationTechnique}`)
                      ) : (
                        <NotProvided />
                      )}
                    </TableCell>
                    <TableCell>{state && <Badge variant={state.variant}>{t(state.labelKey)}</Badge>}</TableCell>
                    <TableCell>{new Date(trace.createdAt).toLocaleDateString(i18n.language)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="greySecondary"
                        size="small"
                        aria-label={t('trace.panel.open')}
                        onClick={() => openTrace(trace.id)}
                        className="size-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Icon name="chevronRight" size={20} color="currentColor" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <TraceDetailsPanel
        traceId={selectedTraceId ?? openedTraceId ?? ''}
        caseId={caseId}
        traces={traces}
        isOpen={selectedTraceId !== null}
        onClose={closePanel}
      />
    </div>
  )
}
