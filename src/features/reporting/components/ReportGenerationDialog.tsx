import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'
import { Button } from '@/features/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/dialog'
import { Spinner } from '@/features/shared/ui/spinner'

export type ReportGenerationStatus = 'pending' | 'success' | 'error'

const STAGE_KEYS = ['gathering', 'composing', 'sealing'] as const

/** Fractions de la durée attendue auxquelles l'étape suivante prend le relais. */
const STAGE_BOUNDARIES = [0.27, 0.8]

const TICK_MS = 100

/** La barre s'approche de ce plafond sans jamais l'atteindre : seule la réponse du serveur termine l'attente. */
const CREEP_CEILING_PERCENT = 96

/** Plus la constante est grande, plus la barre avance vite au début et ralentit ensuite. */
const CREEP_SHAPE = 2.16

/** Multiple de la durée attendue au-delà duquel on annonce une attente anormale. */
const LONG_WAIT_FACTOR = 2

function useTickingNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!running) return
    const ticker = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(ticker)
  }, [running])

  return now
}

function reachedStageIndex(elapsedSeconds: number, expectedSeconds: number): number {
  return STAGE_BOUNDARIES.filter((boundary) => elapsedSeconds >= boundary * expectedSeconds).length
}

function creepPercent(elapsedSeconds: number, expectedSeconds: number): number {
  return CREEP_CEILING_PERCENT * (1 - Math.exp(-elapsedSeconds / (expectedSeconds / CREEP_SHAPE)))
}

type ReportGenerationDialogProps = {
  open: boolean
  status: ReportGenerationStatus
  startedAt: number
  expectedSeconds: number
  reportNumber?: string
  isDownloading: boolean
  onDownload: () => void
  onRetry: () => void
  onClose: () => void
}

export default function ReportGenerationDialog({
  open,
  status,
  startedAt,
  expectedSeconds,
  reportNumber,
  isDownloading,
  onDownload,
  onRetry,
  onClose,
}: ReportGenerationDialogProps) {
  const { t } = useTranslation()
  const isGenerating = open && status === 'pending'
  const now = useTickingNow(isGenerating)
  const elapsedSeconds = Math.max(0, (now - startedAt) / 1000)
  const currentStage = reachedStageIndex(elapsedSeconds, expectedSeconds)
  const isLongWait = elapsedSeconds > expectedSeconds * LONG_WAIT_FACTOR

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && status !== 'pending' && onClose()}>
      <DialogContent
        showCloseButton={status !== 'pending'}
        onEscapeKeyDown={(event) => status === 'pending' && event.preventDefault()}
        onPointerDownOutside={(event) => status === 'pending' && event.preventDefault()}
      >
        {status === 'pending' && (
          <>
            <DialogHeader>
              <DialogTitle>{t('reporting.progress.title')}</DialogTitle>
              <DialogDescription>{t('reporting.progress.description')}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-5 py-2">
              <Spinner className="size-8 text-blue-dark-1" />

              <div
                role="progressbar"
                aria-valuetext={t(`reporting.progress.stages.${STAGE_KEYS[currentStage]}`)}
                className="h-1.5 w-full overflow-hidden rounded-full bg-blue-light-1"
              >
                <div
                  className="h-full rounded-full bg-blue-dark-1"
                  style={{ width: `${creepPercent(elapsedSeconds, expectedSeconds)}%` }}
                />
              </div>

              <ul className="flex w-full flex-col gap-2">
                {STAGE_KEYS.map((stageKey, index) => (
                  <li
                    key={stageKey}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      index > currentStage && 'text-muted-foreground'
                    )}
                  >
                    {index < currentStage ? (
                      <Icon name="check" size={14} />
                    ) : index === currentStage ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <Icon name="circle" size={14} />
                    )}
                    <span className={cn(index === currentStage && 'font-medium')}>
                      {t(`reporting.progress.stages.${stageKey}`)}
                    </span>
                  </li>
                ))}
              </ul>

              {isLongWait && (
                <p className="text-xs text-muted-foreground">{t('reporting.progress.longWait')}</p>
              )}
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>
                {reportNumber
                  ? t('reporting.progress.ready.title', { number: reportNumber })
                  : t('reporting.progress.ready.titleWithoutNumber')}
              </DialogTitle>
              <DialogDescription>{t('reporting.progress.ready.description')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="grey" size="small" onClick={onClose}>
                {t('reporting.progress.close')}
              </Button>
              <Button variant="dark" size="small" disabled={isDownloading} onClick={onDownload}>
                <Icon name="fileExport" size={12} data-icon="inline-start" />
                {t('reporting.download')}
              </Button>
            </DialogFooter>
          </>
        )}

        {status === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle>{t('reporting.progress.failed.title')}</DialogTitle>
              <DialogDescription>{t('reporting.progress.failed.description')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="grey" size="small" onClick={onClose}>
                {t('reporting.progress.close')}
              </Button>
              <Button variant="dark" size="small" onClick={onRetry}>
                {t('reporting.progress.retry')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
