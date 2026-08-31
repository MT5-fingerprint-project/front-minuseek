import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { CaseCorrectionRefusedError } from '@/features/investigation-case/services/InvestigationCaseAPI.services'
import {
  correctedFieldsOf,
  investigationCaseEditSchema,
  judicialHeaderFormValues,
  type InvestigationCase,
  type InvestigationCaseCorrections,
  type InvestigationCaseEditValues,
} from '@/features/investigation-case/types/investigationCase'

type UseEditInvestigationCaseFormArgs = {
  investigationCase: InvestigationCase
  onSubmit: (corrections: InvestigationCaseCorrections) => Promise<unknown> | unknown
}

export function useEditInvestigationCaseForm({ investigationCase, onSubmit }: UseEditInvestigationCaseFormArgs) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      pvNumber: investigationCase.pvNumber,
      description: investigationCase.description ?? '',
      operatorUserId: investigationCase.operator?.id ?? '',
      ...judicialHeaderFormValues(investigationCase),
    } satisfies InvestigationCaseEditValues,
    validators: {
      onSubmit: investigationCaseEditSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null)
        await onSubmit(correctedFieldsOf(investigationCase, value))
      } catch (error) {
        setSubmitError(
          error instanceof CaseCorrectionRefusedError
            ? t(`investigationCase.errors.${error.refusal}`)
            : t('investigationCase.errors.correctionFailed')
        )
      }
    },
  })

  return { form, submitError }
}
