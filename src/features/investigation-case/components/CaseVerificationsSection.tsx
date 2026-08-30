import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import OperatorPicker, {
  type OperatorCandidate,
} from '@/features/investigation-case/components/OperatorPicker'
import { useCaseVerifications, useEntrustVerification } from '@/features/investigation-case/hooks/useVerifications'
import {
  isInProgress,
  verifierNameOf,
  type CaseVerification,
} from '@/features/investigation-case/types/verification'

type CaseVerificationsSectionProps = {
  caseId: string
  operatorUserId: string | null
  canEntrust: boolean
}

export default function CaseVerificationsSection({
  caseId,
  operatorUserId,
  canEntrust,
}: CaseVerificationsSectionProps) {
  const { t, i18n } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [chosen, setChosen] = useState<OperatorCandidate | null>(null)
  const { data: verifications = [], isPending } = useCaseVerifications(caseId)
  const entrust = useEntrustVerification(caseId)

  const excludedIds = [
    ...(operatorUserId ? [operatorUserId] : []),
    ...verifications.filter(isInProgress).map((verification) => verification.verifierUserId),
  ]

  function statusLabel(verification: CaseVerification): string {
    return t(`verification.status.${verification.status}`)
  }

  function requestedOn(verification: CaseVerification): string {
    return new Date(verification.requestedAt).toLocaleDateString(i18n.language)
  }

  async function handleEntrust() {
    if (!chosen) return
    await entrust.mutateAsync(chosen.id).catch(() => undefined)
    setChosen(null)
  }

  return (
    <section ref={sectionRef} className="flex flex-col gap-5 px-4 py-3 rounded-sm bg-white">
      <h2 className="text-lg font-semibold">{t('verification.section.title')}</h2>

      {isPending ? (
        <Spinner className="size-5" />
      ) : verifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('verification.section.none')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {verifications.map((verification) => (
            <li key={verification.id} className="flex items-center gap-3 text-sm">
              <span className="font-medium">
                {verifierNameOf(verification) ?? t('verification.section.removedAccount')}
              </span>
              <span className="text-muted-foreground">{statusLabel(verification)}</span>
              <span className="text-muted-foreground">
                {t('verification.section.requestedOn', { date: requestedOn(verification) })}
              </span>
            </li>
          ))}
        </ul>
      )}

      {canEntrust && (
        <div className="flex items-end gap-3">
          <div className="w-72">
            <OperatorPicker
              ariaLabel={t('verification.section.pickerLabel')}
              selected={chosen}
              excludedIds={excludedIds}
              container={sectionRef}
              onSelect={setChosen}
            />
          </div>
          <Button
            type="button"
            variant="blue"
            disabled={!chosen || entrust.isPending}
            onClick={() => void handleEntrust()}
          >
            {t('verification.section.entrust')}
          </Button>
        </div>
      )}
    </section>
  )
}
