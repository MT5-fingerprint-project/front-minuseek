import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Spinner } from '@/features/shared/ui/spinner'
import SealDropZone from '@/features/public-verification/components/SealDropZone'
import SealVerdict from '@/features/public-verification/components/SealVerdict'
import { useSealVerification } from '@/features/public-verification/hooks/useSealVerification'

export default function PublicSealVerificationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const verify = useSealVerification(slug ?? '')
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      <header className="border-b border-grey-light-2 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <span className="text-2xl font-light text-blue-dark-2">MINUSEEK</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Icon name="verified" size={40} color="var(--color-blue-medium-1)" />
            <H1 className="text-3xl font-semibold text-blue-dark-2">{t('publicVerification.title')}</H1>
          </div>
          <p className="leading-6 text-grey-dark">{t('publicVerification.intro')}</p>
        </div>

        <section className="flex flex-col gap-5 rounded-sm bg-white p-6">
          <p className="flex items-start gap-2 rounded-sm bg-blue-light-1 px-3 py-2 text-sm text-blue-dark-2">
            <Icon name="information" size={18} color="currentColor" className="mt-0.5 shrink-0" />
            {t('publicVerification.stayLocal')}
          </p>

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
              <p className="flex items-center gap-2 text-sm text-grey-medium-2">
                <Spinner aria-hidden className="size-4" />
                {t('publicVerification.pending')}
              </p>
            ) : (
              <SealVerdict verification={verify.data} error={verify.error} />
            )}
          </div>
        </section>

        <p className="text-xs text-grey-dark">{t('publicVerification.paperNotice')}</p>
      </main>
    </div>
  )
}
