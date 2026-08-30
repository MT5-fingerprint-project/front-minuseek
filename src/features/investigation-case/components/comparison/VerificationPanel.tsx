import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import {
  useCompleteVerification,
  useRecordConclusion,
  useVerificationDetail,
} from '@/features/investigation-case/hooks/useVerifications'
import type {
  VerificationConclusion,
  VerificationExploitability,
} from '@/features/shared/types/verification'

const NOT_IDENTIFIED = 'none'

type VerificationPanelProps = {
  verificationId: string
  caseId: string
}

export default function VerificationPanel({ verificationId, caseId }: VerificationPanelProps) {
  const { t } = useTranslation()
  const { data: traces = [] } = useBiometricImages('traces', caseId)
  const { data: referencePrints = [] } = useBiometricImages('reference-prints', caseId)
  const { data: verification, isPending } = useVerificationDetail(verificationId)
  const recordConclusion = useRecordConclusion(verificationId)
  const complete = useCompleteVerification(verificationId)

  if (isPending || !verification) return <Spinner className="size-5" />

  const conclusionOf = (traceId: string): VerificationConclusion | undefined =>
    verification.conclusions.find((conclusion) => conclusion.traceId === traceId)

  const missingCount = traces.filter((trace) => !conclusionOf(trace.id)).length
  const isCompleted = verification.status !== 'PENDING'
  const discordantTraceIds = verification.conclusions
    .filter((conclusion) => conclusion.outcome === 'DISCORDANT')
    .map((conclusion) => conclusion.traceId)

  function labelOf(traceId: string): string {
    return traces.find((trace) => trace.id === traceId)?.fileName ?? traceId
  }

  function state(traceId: string, exploitability: VerificationExploitability) {
    const current = conclusionOf(traceId)
    recordConclusion.mutate({
      traceId,
      exploitability,
      identifiedReferencePrintId:
        exploitability === 'EXPLOITABLE' ? (current?.identifiedReferencePrintId ?? null) : null,
    })
  }

  function identify(traceId: string, referencePrintId: string) {
    recordConclusion.mutate({
      traceId,
      exploitability: 'EXPLOITABLE',
      identifiedReferencePrintId: referencePrintId === NOT_IDENTIFIED ? null : referencePrintId,
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-sm bg-white px-4 py-3">
      <h2 className="text-lg font-semibold">{t('verification.conclusions.title')}</h2>

      {isCompleted && (
        <p
          className={
            verification.status === 'CONCORDANT'
              ? 'rounded-sm bg-blue-light-1 px-3 py-2 text-sm'
              : 'rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive'
          }
        >
          {verification.status === 'CONCORDANT'
            ? t('verification.conclusions.concordant')
            : t('verification.conclusions.discordant', {
                traces: discordantTraceIds.map(labelOf).join(', '),
              })}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {traces.map((trace) => {
          const conclusion = conclusionOf(trace.id)
          return (
            <li key={trace.id} className="flex flex-wrap items-center gap-3 text-sm">
              <span className="min-w-40 font-medium">{trace.fileName}</span>
              <Button
                type="button"
                size="small"
                variant={conclusion?.exploitability === 'EXPLOITABLE' ? 'blue' : 'outline'}
                onClick={() => state(trace.id, 'EXPLOITABLE')}
              >
                {t('verification.conclusions.exploitable')}
              </Button>
              <Button
                type="button"
                size="small"
                variant={conclusion?.exploitability === 'NOT_EXPLOITABLE' ? 'blue' : 'outline'}
                onClick={() => state(trace.id, 'NOT_EXPLOITABLE')}
              >
                {t('verification.conclusions.notExploitable')}
              </Button>
              {conclusion?.exploitability === 'EXPLOITABLE' && (
                <Select
                  value={conclusion.identifiedReferencePrintId ?? NOT_IDENTIFIED}
                  onValueChange={(value) => identify(trace.id, value)}
                >
                  <SelectTrigger
                    aria-label={t('verification.conclusions.identificationLabel')}
                    className="min-w-56"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NOT_IDENTIFIED}>
                      {t('verification.conclusions.notIdentified')}
                    </SelectItem>
                    {referencePrints.map((print) => (
                      <SelectItem key={print.id} value={print.id}>
                        {print.fileName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </li>
          )
        })}
      </ul>

      {isCompleted ? (
        <p className="text-sm text-muted-foreground">
          {t('verification.conclusions.revisable')}
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="blue"
            disabled={missingCount > 0 || complete.isPending}
            onClick={() => complete.mutate()}
          >
            {t('verification.conclusions.validate')}
          </Button>
          {missingCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {t('verification.conclusions.missing', { missingCount })}
            </span>
          )}
        </div>
      )}
    </section>
  )
}
