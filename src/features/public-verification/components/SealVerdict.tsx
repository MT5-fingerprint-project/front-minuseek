import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import {
  FileTooLargeError,
  InsecureContextError,
} from '@/features/public-verification/lib/sha256File'
import type { SealVerification } from '@/features/public-verification/types/seal'

type SealVerdictProps = {
  verification?: SealVerification
  error: Error | null
}

function dateOf(value: string, language: string): string {
  return new Date(value).toLocaleDateString(language, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function SealVerdict({ verification, error }: SealVerdictProps) {
  const { t, i18n } = useTranslation()

  if (error) {
    const message =
      error instanceof FileTooLargeError
        ? t('publicVerification.errors.tooLarge')
        : error instanceof InsecureContextError
          ? t('publicVerification.errors.insecureContext')
          : t('publicVerification.errors.unavailable')

    return (
      <p className="flex items-center gap-2 text-sm">
        <Icon name="information" size={16} />
        {message}
      </p>
    )
  }

  if (!verification) return null

  const { sha256, lookup } = verification

  if (!lookup.known) {
    return (
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Icon name="close" size={16} />
          {t('publicVerification.verdict.unknown')}
        </p>
        <p className="font-mono text-xs break-all select-all text-muted-foreground">{sha256}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon name="verified" size={16} />
        {t('publicVerification.verdict.sealed', {
          laboratory: lookup.laboratory,
          date: dateOf(lookup.sealedAt, i18n.language),
        })}
      </p>
      <p className="text-sm">{t(`publicVerification.kind.${lookup.kind}`)}</p>
      <p className="text-sm text-muted-foreground">
        {lookup.anchoredAt
          ? t('publicVerification.verdict.anchored', { date: dateOf(lookup.anchoredAt, i18n.language) })
          : t('publicVerification.verdict.notAnchored')}
      </p>
      {lookup.precededByEarlierReport && (
        <p className="text-sm">{t('publicVerification.verdict.earlierReport')}</p>
      )}
      {lookup.supersededByNewerReport && (
        <p className="text-sm">{t('publicVerification.verdict.newerReport')}</p>
      )}
      <p className="font-mono text-xs break-all select-all text-muted-foreground">{sha256}</p>
    </div>
  )
}
