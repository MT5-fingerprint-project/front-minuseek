import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ServiceSettingsAPI } from '@/features/settings/services/ServiceSettingsAPI.services'
import type { ServiceSettingsInput } from '@/features/settings/types/serviceSettings'

export const serviceSettingsKeys = {
  all: ['service-settings'] as const,
  detail: () => [...serviceSettingsKeys.all, 'detail'] as const,
}

export function useServiceSettings(enabled = true) {
  return useQuery({
    queryKey: serviceSettingsKeys.detail(),
    queryFn: () => ServiceSettingsAPI.get(),
    enabled,
  })
}

export function useSaveServiceSettings() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (settings: ServiceSettingsInput) => ServiceSettingsAPI.save(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceSettingsKeys.detail() })
      toast.success(t('settings.success.headerSaved'))
    },
  })
}
