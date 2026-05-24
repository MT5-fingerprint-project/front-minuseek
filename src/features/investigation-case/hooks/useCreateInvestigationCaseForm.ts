import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
  investigationCaseCreateSchema,
  type InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'

const DEFAULT_VALUES: InvestigationCaseCreateInput = {
  caseNumber: '',
  pvNumber: '',
  description: '',
  //location: '',
}

type UseCreateInvestigationCaseFormArgs = {
  onSubmit: (values: InvestigationCaseCreateInput) => Promise<unknown> | unknown
  onSuccess?: () => void
}

export function useCreateInvestigationCaseForm({ onSubmit, onSuccess }: UseCreateInvestigationCaseFormArgs) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: investigationCaseCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null)
        await onSubmit(value)
        form.reset()
        onSuccess?.()
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : t('common.errors.generic'))
      }
    },
  })

  return { form, submitError }
}
