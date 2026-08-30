import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
  traceDescriptionSchema,
  type TraceDescriptionInput,
} from '@/features/biometric-image/types/trace'

type UseTraceDescriptionFormArgs = {
  defaultValues: TraceDescriptionInput
  onSubmit: (values: TraceDescriptionInput) => Promise<unknown> | unknown
  onSuccess?: () => void
}

export function useTraceDescriptionForm({ defaultValues, onSubmit, onSuccess }: UseTraceDescriptionFormArgs) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: traceDescriptionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null)
        await onSubmit(value)
        onSuccess?.()
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : t('common.errors.generic'))
      }
    },
  })

  return { form, submitError }
}
