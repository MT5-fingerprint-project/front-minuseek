import { useTranslation } from 'react-i18next'


export default function TenantRequiredPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold">{t('auth.tenantRequired.title')}</h1>
      <p className="text-muted-foreground">{t('auth.tenantRequired.message')}</p>
    </div>
  )
}
