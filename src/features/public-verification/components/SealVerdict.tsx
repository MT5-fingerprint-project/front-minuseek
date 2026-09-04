import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'
import {
  FileTooLargeError,
  InsecureContextError,
} from '@/features/public-verification/lib/sha256File'
import type { SealVerification } from '@/features/public-verification/types/seal'

type SealVerdictProps = {
  verification?: SealVerification
  error: Error | null
}

const TONES = {
  sealed: { panel: 'border-green-medium bg-green-light', accent: 'text-green-medium' },
  unknown: { panel: 'border-red-medium bg-red-medium/5', accent: 'text-red-medium' },
  caveat: { panel: 'border-orange-medium bg-orange-light', accent: 'text-orange-medium' },
  technical: { panel: 'border-grey-light-2 bg-grey-light-1/60', accent: 'text-grey-medium-2' },
} as const

type VerdictPanelProps = {
  tone: keyof typeof TONES
  icon: IconName
  headline?: string
  children?: ReactNode
}

function dateOf(value: string, language: string): string {
  return new Date(value).toLocaleDateString(language, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function VerdictPanel({ tone, icon, headline, children }: VerdictPanelProps) {
  return (
    <div className={cn('flex items-start gap-3 rounded-sm border p-4', TONES[tone].panel)}>
      <span className={cn('shrink-0', TONES[tone].accent)}>
        <Icon name={icon} size={24} color="currentColor" />
      </span>
      <div className="flex min-w-0 flex-col gap-2">
        {headline && <p className={cn('font-medium', TONES[tone].accent)}>{headline}</p>}
        {children}
      </div>
    </div>
  )
}

function FileDigest({ sha256 }: { sha256: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-1 rounded-sm bg-grey-light-1/70 px-4 py-3">
      <p className="text-xs font-medium text-grey-dark">{t('publicVerification.digest')}</p>
      <p className="font-mono text-xs break-all select-all text-blue-dark-2">{sha256}</p>
    </div>
  )
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

    return <VerdictPanel tone="technical" icon="information" headline={message} />
  }

  if (!verification) return null

  const { sha256, lookup } = verification

  if (!lookup.known) {
    return (
      <div className="flex flex-col gap-3">
        <VerdictPanel tone="unknown" icon="close" headline={t('publicVerification.verdict.unknown')} />
        <FileDigest sha256={sha256} />
      </div>
    )
  }

  const hasVersionCaveat = lookup.precededByEarlierReport || lookup.supersededByNewerReport

  return (
    <div className="flex flex-col gap-3">
      <VerdictPanel
        tone="sealed"
        icon="verified"
        headline={t('publicVerification.verdict.sealed', {
          laboratory: lookup.laboratory,
          date: dateOf(lookup.sealedAt, i18n.language),
        })}
      >
        <p className="text-sm text-blue-dark-2">{t(`publicVerification.kind.${lookup.kind}`)}</p>
        {lookup.anchoredAt && (
          <p className="flex items-center gap-1.5 text-sm text-grey-medium-2">
            <Icon name="link" size={16} color="currentColor" className="shrink-0" />
            {t('publicVerification.verdict.anchored', { date: dateOf(lookup.anchoredAt, i18n.language) })}
          </p>
        )}
      </VerdictPanel>

      {hasVersionCaveat && (
        <VerdictPanel tone="caveat" icon="information">
          {lookup.precededByEarlierReport && (
            <p className="text-sm text-blue-dark-2">{t('publicVerification.verdict.earlierReport')}</p>
          )}
          {lookup.supersededByNewerReport && (
            <p className="text-sm text-blue-dark-2">{t('publicVerification.verdict.newerReport')}</p>
          )}
        </VerdictPanel>
      )}

      <FileDigest sha256={sha256} />
    </div>
  )
}
