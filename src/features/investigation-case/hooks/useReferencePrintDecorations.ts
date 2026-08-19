import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useSubjects } from '@/features/investigation-case/hooks/useSubjects'
import type { BiometricImageDecoration } from '@/features/biometric-image/types/biometricImage'

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

/**
 * Habillage des vignettes du comparateur : pour chaque empreinte de référence
 * rattachée à un sujet, « Prénom Nom - Majeur droit » + couleur du sujet en bordure.
 */
export function useReferencePrintDecorations(caseId: string) {
  const { t } = useTranslation()
  const { data: subjects = [] } = useSubjects(caseId)
  const { data: referencePrints = [] } = useBiometricImages('reference-prints', caseId)

  return useMemo(() => {
    const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]))
    const decorations: Record<string, BiometricImageDecoration> = {}

    for (const print of referencePrints) {
      const subject = print.subjectId ? subjectsById.get(print.subjectId) : undefined
      if (!subject) continue

      const name = `${subject.firstName} ${subject.lastName}`
      decorations[print.id] = {
        label:
          print.position && isKnownPosition(print.position)
            ? t('subject.prints.printLabel', { name, position: t(`subject.prints.fullPositions.${print.position}`) })
            : name,
        borderColor: subject.color ?? undefined,
      }
    }

    return decorations
  }, [subjects, referencePrints, t])
}
