import type { TFunction } from 'i18next'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'
import type { Subject } from '@/features/investigation-case/types/subject'

const FULL_POSITIONS = [
  'LEFT_THUMB',
  'LEFT_INDEX',
  'LEFT_MIDDLE',
  'LEFT_RING',
  'LEFT_LITTLE',
  'LEFT_PALM',
  'RIGHT_THUMB',
  'RIGHT_INDEX',
  'RIGHT_MIDDLE',
  'RIGHT_RING',
  'RIGHT_LITTLE',
  'RIGHT_PALM',
] as const

type FullPosition = (typeof FULL_POSITIONS)[number]

function isKnownPosition(position: string): position is FullPosition {
  return (FULL_POSITIONS as readonly string[]).includes(position)
}

function positionLabel(t: TFunction, position: string | null): string | null {
  if (!position || !isKnownPosition(position)) return null
  return t(`subject.prints.fullPositions.${position}`)
}

/**
 * Désignations écrites sous chaque image de la démonstration. Elles reprennent
 * mot pour mot la formulation de l'annexe B du rapport : la vidéo et le PDF
 * décrivent la même paire, et deux libellés différents pour une même
 * démonstration feraient une question à l'audience.
 */
export function traceCaptionOf(t: TFunction, trace: BiometricImage | undefined): string {
  if (!trace) return ''
  if (trace.cote) return t('investigationCase.comparison.videoCaption.traceCote', { cote: trace.cote })
  if (trace.number !== null) {
    return t('investigationCase.comparison.videoCaption.traceNumber', { number: trace.number })
  }
  return trace.label
}

export function referenceCaptionOf(
  t: TFunction,
  referencePrint: BiometricImage | undefined,
  subject: Subject | undefined
): string {
  if (!referencePrint) return ''
  const where = positionLabel(t, referencePrint.position)
  const named = subject
    ? t('investigationCase.comparison.videoCaption.named', {
        civility: t(`investigationCase.comparison.videoCaption.civility.${subject.sex}`),
        lastName: subject.lastName.toLocaleUpperCase('fr'),
        firstName: subject.firstName,
      })
    : null

  if (where !== null) {
    return named === null
      ? where
      : t('investigationCase.comparison.videoCaption.positionOf', { position: where, named })
  }
  return named === null
    ? t('investigationCase.comparison.videoCaption.referencePrint')
    : t('investigationCase.comparison.videoCaption.referencePrintOf', { named })
}
