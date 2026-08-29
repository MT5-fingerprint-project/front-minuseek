import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { H1 } from '@/features/shared/ui/typography'
import SealDropZone from '@/features/public-verification/components/SealDropZone'
import SealVerdict from '@/features/public-verification/components/SealVerdict'
import { useSealVerification } from '@/features/public-verification/hooks/useSealVerification'

export default function PublicSealVerificationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const verify = useSealVerification(slug ?? '')
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <H1 className="text-2xl font-bold">{t('publicVerification.title')}</H1>
        <p className="text-sm text-muted-foreground">{t('publicVerification.intro')}</p>
        <p className="text-sm font-medium">{t('publicVerification.stayLocal')}</p>
      </div>

      <SealDropZone
        isPending={verify.isPending}
        fileName={fileName}
        onFile={(file) => {
          setFileName(file.name)
          verify.mutate(file)
        }}
        onReset={() => {
          setFileName(null)
          verify.reset()
        }}
      />

      <div aria-live="polite" role="status" className="min-h-6">
        {verify.isPending ? (
          <p className="text-sm text-muted-foreground">{t('publicVerification.pending')}</p>
        ) : (
          <SealVerdict verification={verify.data} error={verify.error} />
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('publicVerification.paperNotice')}</p>
    </main>
  )
}
