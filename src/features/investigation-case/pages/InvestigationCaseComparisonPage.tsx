import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { H1 } from '@/features/shared/ui/typography'
import { BiometricImageCarousel, BiometricSplitView } from '@/features/biometric-image'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

export default function InvestigationCaseComparisonPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [selectedTrace, setSelectedTrace] = useState<BiometricImage>()
  const [selectedReferencePrint, setSelectedReferencePrint] = useState<BiometricImage>()

  if (!id) return null

  return (
    <div className="flex h-full flex-col gap-4">
      <H1>{t('investigationCase.comparison.title', { id })}</H1>

      <div className="flex gap-4">
        <BiometricImageCarousel
          type="traces"
          caseId={id}
          selectedId={selectedTrace?.id}
          onSelect={setSelectedTrace}
        />
        <BiometricImageCarousel
          type="reference-prints"
          caseId={id}
          selectedId={selectedReferencePrint?.id}
          onSelect={setSelectedReferencePrint}
        />
      </div>

      <BiometricSplitView traceImage={selectedTrace} referencePrintImage={selectedReferencePrint} />
    </div>
  )
}
