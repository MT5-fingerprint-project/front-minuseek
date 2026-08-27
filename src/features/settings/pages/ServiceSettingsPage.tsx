import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Spinner } from '@/features/shared/ui/spinner'
import AppHeader from '@/features/shared/components/AppHeader'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import ServiceSettingsForm from '@/features/settings/components/ServiceSettingsForm'
import { useSaveServiceSettings, useServiceSettings } from '@/features/settings/hooks/useServiceSettings'
import type { ServiceSettingsInput } from '@/features/settings/types/serviceSettings'

export default function ServiceSettingsPage() {
  const { t } = useTranslation()

  const { data: currentUser, isPending: isCurrentUserPending } = useCurrentUser()
  const isServiceManager = currentUser?.role === 'ADMIN'

  const settingsQuery = useServiceSettings(isServiceManager)
  const saveSettings = useSaveServiceSettings()

  async function handleSubmit(values: ServiceSettingsInput) {
    await saveSettings.mutateAsync(values)
  }

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex flex-col gap-10 px-32 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Icon name="settings" size={40} color="var(--color-blue-medium-1)" />
            <H1 className="text-blue-dark-2">{t('settings.page.title')}</H1>
          </div>
          <p className="text-muted-foreground">{t('settings.page.subtitle')}</p>
        </div>

        {isCurrentUserPending ? (
          <Spinner className="size-6" />
        ) : !isServiceManager ? (
          <p className="rounded-sm bg-white px-4 py-3 text-sm text-muted-foreground">{t('settings.page.restricted')}</p>
        ) : settingsQuery.data ? (
          <ServiceSettingsForm settings={settingsQuery.data} onSubmit={handleSubmit} />
        ) : settingsQuery.isError ? (
          <p className="rounded-sm bg-white px-4 py-3 text-sm text-destructive">{t('settings.page.error')}</p>
        ) : (
          <Spinner className="size-6" />
        )}
      </div>
    </div>
  )
}
