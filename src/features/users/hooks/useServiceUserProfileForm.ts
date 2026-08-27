import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { DuplicateServiceNumberError } from '@/features/users/services/ServiceUserAPI.services'
import {
  serviceUserProfileSchema,
  type ServiceUser,
  type ServiceUserProfileInput,
} from '@/features/users/types/serviceUser'

type UseServiceUserProfileFormArgs = {
  user: ServiceUser
  onSubmit: (values: ServiceUserProfileInput) => Promise<unknown> | unknown
  onSuccess?: () => void
}

export function useServiceUserProfileForm({ user, onSubmit, onSuccess }: UseServiceUserProfileFormArgs) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      lastName: user.lastName,
      firstName: user.firstName,
      grade: user.grade,
      serviceNumber: user.serviceNumber,
    } satisfies ServiceUserProfileInput,
    validators: {
      onSubmit: serviceUserProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null)
        await onSubmit(value)
        onSuccess?.()
      } catch (error) {
        setSubmitError(
          error instanceof DuplicateServiceNumberError
            ? t('users.errors.serviceNumberTaken')
            : t('users.errors.updateFailed')
        )
      }
    },
  })

  return { form, submitError }
}
