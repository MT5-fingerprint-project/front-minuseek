import { useTranslation } from 'react-i18next'
import type { ServiceSettings } from '@/features/settings/types/serviceSettings'

type ReportHeaderPreviewProps = {
  settings: ServiceSettings
}

export default function ReportHeaderPreview({ settings }: ReportHeaderPreviewProps) {
  const { t } = useTranslation()
  const { administration, serviceName, postalAddress, phoneNumber, email, signatureCity } = settings

  const administrationLine = administration.trim()
  const contactLine = [phoneNumber.trim(), email.trim()].filter((contact) => contact !== '').join(' — ')
  const lines = [
    { key: 'serviceName', value: serviceName.trim() },
    { key: 'postalAddress', value: postalAddress.trim() },
    { key: 'contact', value: contactLine },
  ].filter((line) => line.value !== '')
  const city = signatureCity.trim()

  const hasLetterhead = administrationLine !== '' || lines.length > 0

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium text-blue-dark-2">{t('settings.header.preview.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('settings.header.preview.description')}</p>
      </div>

      <div className="rounded-sm bg-white px-6 py-8">
        {hasLetterhead || city !== '' ? (
          <div className="mx-auto max-w-[178mm] text-[#111]">
            {hasLetterhead && (
              <div className="border-b border-black pb-[6px] text-center font-[family-name:Arial,Helvetica,sans-serif] text-[8pt] leading-[1.3] tracking-[0.04em]">
                {administrationLine !== '' && <strong className="block text-[9pt] font-bold">{administrationLine}</strong>}
                {lines.map((line) => (
                  <span key={line.key} className="block">
                    {line.value}
                  </span>
                ))}
              </div>
            )}
            {city !== '' && (
              <p className="mt-8 text-right font-[family-name:Times_New_Roman,Georgia,serif] text-[9.5pt]">
                {t('settings.header.preview.signature', { city })}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('settings.header.preview.empty')}</p>
        )}
      </div>
    </section>
  )
}
