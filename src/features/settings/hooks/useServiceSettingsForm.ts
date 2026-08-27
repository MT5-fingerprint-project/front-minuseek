import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
  serviceSettingsSchema,
  type ServiceSettings,
  type ServiceSettingsInput,
} from '@/features/settings/types/serviceSettings'

type UseServiceSettingsFormArgs = {
  settings: ServiceSettings
  onSubmit: (values: ServiceSettingsInput) => Promise<unknown> | unknown
}

export function useServiceSettingsForm({ settings, onSubmit }: UseServiceSettingsFormArgs) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      administration: settings.administration,
      serviceName: settings.serviceName,
      postalAddress: settings.postalAddress,
      phoneNumber: settings.phoneNumber,
      email: settings.email,
      signatureCity: settings.signatureCity,
    } satisfies ServiceSettingsInput,
    validators: {
      onSubmit: serviceSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null)
        await onSubmit(serviceSettingsSchema.parse(value))
      } catch {
        setSubmitError(t('settings.errors.saveFailed'))
      }
    },
  })

  return { form, submitError }
}
