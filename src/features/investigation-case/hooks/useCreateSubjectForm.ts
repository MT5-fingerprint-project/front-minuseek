import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
  subjectCreateSchema,
  type SubjectCreateInput,
  type SubjectSex,
  type SubjectType,
} from '@/features/investigation-case/types/subject'

// Les selects démarrent vides ; le schéma Zod refuse '' à la soumission.
const DEFAULT_VALUES: SubjectCreateInput = {
  lastName: '',
  firstName: '',
  birthDate: '',
  birthPlace: '',
  sex: '' as SubjectSex,
  type: '' as SubjectType,
  phoneNumber: '',
  firstParentName: '',
  secondParentName: '',
}

type UseCreateSubjectFormArgs = {
  onSubmit: (values: SubjectCreateInput) => Promise<unknown> | unknown
  onSuccess?: () => void
}

export function useCreateSubjectForm({ onSubmit, onSuccess }: UseCreateSubjectFormArgs) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: subjectCreateSchema,
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
