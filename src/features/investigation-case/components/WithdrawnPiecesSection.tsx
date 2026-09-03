import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import {
  useRestoreBiometricImage,
  useWithdrawnBiometricImages,
} from '@/features/biometric-image/hooks/useBiometricImages'
import type {
  BiometricImage,
  BiometricImageType,
} from '@/features/biometric-image/types/biometricImage'

type WithdrawnPieceRowProps = {
  piece: BiometricImage
  type: BiometricImageType
  caseId: string
}

function WithdrawnPieceRow({ piece, type, caseId }: WithdrawnPieceRowProps) {
  const { t, i18n } = useTranslation()
  const restorePiece = useRestoreBiometricImage(type, caseId)
  const withdrawnDate = piece.withdrawnAt
    ? new Date(piece.withdrawnAt).toLocaleDateString(i18n.language)
    : ''
  // Sous « Autre », c'est la phrase de l'opérateur qui fait foi, comme dans le rapport.
  const motiveLabel =
    piece.withdrawalMotive === 'OTHER' && piece.withdrawalMotiveDetail
      ? `« ${piece.withdrawalMotiveDetail} »`
      : piece.withdrawalMotive
        ? t(`withdrawalMotive.${piece.withdrawalMotive}`)
        : ''

  return (
    <li className="flex items-center gap-4 rounded-sm bg-white px-3 py-2">
      <img
        src={piece.thumbUrl ?? piece.url ?? undefined}
        alt={piece.label}
        loading="lazy"
        decoding="async"
        className="h-16 w-12 shrink-0 rounded-xs object-cover"
      />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium break-all">{piece.label}</span>
        <span className="text-xs text-muted-foreground">
          {t(`investigationCase.withdrawn.kind.${type}`)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('investigationCase.withdrawn.withdrawnAt', {
            date: withdrawnDate,
            motive: motiveLabel,
          })}
        </span>
      </div>
      <Button
        variant="outline"
        size="small"
        disabled={restorePiece.isPending}
        onClick={() => restorePiece.mutate(piece.id)}
      >
        {t('biometricImage.restore.action')}
        <Icon name="undo" size={12} data-icon="inline-end" color="currentColor" />
      </Button>
    </li>
  )
}

/** Rétablir ne détruit rien : pas de boîte de confirmation. */
export default function WithdrawnPiecesSection({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const { data: traces = [] } = useWithdrawnBiometricImages('traces', caseId)
  const { data: referencePrints = [] } = useWithdrawnBiometricImages('reference-prints', caseId)

  if (traces.length === 0 && referencePrints.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t('investigationCase.withdrawn.title')}</h2>
      <ul className="flex flex-col gap-2">
        {traces.map((piece) => (
          <WithdrawnPieceRow key={piece.id} piece={piece} type="traces" caseId={caseId} />
        ))}
        {referencePrints.map((piece) => (
          <WithdrawnPieceRow key={piece.id} piece={piece} type="reference-prints" caseId={caseId} />
        ))}
      </ul>
    </section>
  )
}
