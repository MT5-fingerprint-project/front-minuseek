import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BiometricImageType } from '@/features/biometric-image/types/biometricImage'

type BiometricImageEmptyPlaceholderProps = {
  type: BiometricImageType
}

export default function BiometricImageEmptyPlaceholder({ type }: BiometricImageEmptyPlaceholderProps) {
  const { t } = useTranslation()
  const label = type === 'traces' ? t('biometricImage.import.traces') : t('biometricImage.import.referencePrints')

  return (
    <div className="outline-muted flex w-full items-center justify-center rounded-lg bg-white p-2">
      <div className="flex min-h-[107px] items-center justify-center gap-2">
        <ImageUp className="size-6 text-[var(--ms-blue-medium)]" />
        <span className="text-base text-[var(--ms-blue-medium)]">{label}</span>
      </div>
    </div>
  )
}
