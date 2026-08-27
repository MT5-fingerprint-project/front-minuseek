import { apiClient } from '@/features/shared/lib/apiClient'
import type { ServiceSettings, ServiceSettingsInput } from '@/features/settings/types/serviceSettings'

type ServiceSettingsResponse = Partial<Record<keyof ServiceSettings, string | null>> | null

function toServiceSettings(response: ServiceSettingsResponse): ServiceSettings {
  return {
    administration: response?.administration ?? '',
    serviceName: response?.serviceName ?? '',
    postalAddress: response?.postalAddress ?? '',
    phoneNumber: response?.phoneNumber ?? '',
    email: response?.email ?? '',
    signatureCity: response?.signatureCity ?? '',
  }
}

export const ServiceSettingsAPI = {
  get: () => apiClient.get<ServiceSettingsResponse>('/service-settings').then((res) => toServiceSettings(res.data)),

  save: (settings: ServiceSettingsInput) => apiClient.put<void>('/service-settings', settings).then((res) => res.data),
}
