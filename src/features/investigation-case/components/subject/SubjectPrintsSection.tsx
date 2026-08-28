import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import {
  useBiometricImages,
  useWithdrawBiometricImage,
  useUploadBiometricImage,
} from '@/features/biometric-image/hooks/useBiometricImages'
import SubjectPrintSlot from '@/features/investigation-case/components/subject/SubjectPrintSlot'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'

const FINGER_POSITIONS = ['THUMB', 'INDEX', 'MIDDLE', 'RING', 'LITTLE', 'PALM'] as const
const HAND_SIDES = ['LEFT', 'RIGHT'] as const

type SubjectPrintsSectionProps = {
  caseId: string
  subjectId: string
}

export default function SubjectPrintsSection({ caseId, subjectId }: SubjectPrintsSectionProps) {
  const { t } = useTranslation()
  const { data: referencePrints = [] } = useBiometricImages('reference-prints', caseId)
  const uploadPrint = useUploadBiometricImage('reference-prints')
  const withdrawPrint = useWithdrawBiometricImage('reference-prints', caseId)
  const isCaseClosed = useCaseIsClosed(caseId)

  const printsByPosition = new Map(
    referencePrints.filter((print) => print.subjectId === subjectId).map((print) => [print.position, print])
  )

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Icon name="fingerprint" size={28} color="var(--color-blue-dark-2)" />
        <h2 className="text-xl font-semibold">{t('subject.prints.title')}</h2>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        {HAND_SIDES.map((side) => {
          const filledCount = FINGER_POSITIONS.filter((finger) => printsByPosition.has(`${side}_${finger}`)).length

          return (
            <div key={side} className="flex flex-col gap-3">
              <h3 className="font-medium text-muted-foreground">
                {t(side === 'LEFT' ? 'subject.prints.leftHand' : 'subject.prints.rightHand')}{' '}
                <span className="text-grey-medium-1">{filledCount}</span>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {FINGER_POSITIONS.map((finger) => {
                  const position = `${side}_${finger}`
                  const isUploading = uploadPrint.isPending && uploadPrint.variables?.position === position

                  return (
                    <SubjectPrintSlot
                      key={position}
                      label={t(`subject.prints.positions.${finger}`)}
                      print={printsByPosition.get(position)}
                      isUploading={isUploading}
                      onUpload={(file) => uploadPrint.mutate({ caseId, file, subjectId, position })}
                      onWithdraw={(printId, motive) => withdrawPrint.mutate({ id: printId, motive })}
                      isReadOnly={isCaseClosed}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
