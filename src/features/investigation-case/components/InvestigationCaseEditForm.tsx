import { useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { Textarea } from '@/features/shared/ui/textarea'
import CaseHandoverDialog from '@/features/investigation-case/components/CaseHandoverDialog'
import OperatorPicker, { type OperatorCandidate } from '@/features/investigation-case/components/OperatorPicker'
import { useEditInvestigationCaseForm } from '@/features/investigation-case/hooks/useEditInvestigationCaseForm'
import {
  hasCorrections,
  operatorNameOf,
  type InvestigationCase,
  type InvestigationCaseCorrections,
} from '@/features/investigation-case/types/investigationCase'

type InvestigationCaseEditFormProps = {
  investigationCase: InvestigationCase | null
  canChangeOperator: boolean
  losesAccessOnHandover: boolean
  onClose: () => void
  onSubmit: (corrections: InvestigationCaseCorrections) => Promise<unknown> | unknown
}

export default function InvestigationCaseEditForm({
  investigationCase,
  canChangeOperator,
  losesAccessOnHandover,
  onClose,
  onSubmit,
}: InvestigationCaseEditFormProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)

  return (
    <Dialog open={investigationCase !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={contentRef}
        className="sm:max-w-2xl rounded-md"
        // Échap doit refermer la liste des comptes, pas le formulaire et les
        // corrections en cours. Radix écoute en phase de capture, donc avant le
        // panneau : quand celui-ci est ouvert, on lui laisse la touche. Le
        // panneau reste monté une fois refermé, d'où `[data-open]`.
        onEscapeKeyDown={(event) => {
          if (contentRef.current?.querySelector('[data-slot="combobox-popup"][data-open]')) {
            event.preventDefault()
          }
        }}
      >
        {investigationCase && (
          <CaseFields
            investigationCase={investigationCase}
            canChangeOperator={canChangeOperator}
            losesAccessOnHandover={losesAccessOnHandover}
            contentRef={contentRef}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type CaseFieldsProps = {
  investigationCase: InvestigationCase
  canChangeOperator: boolean
  losesAccessOnHandover: boolean
  contentRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onSubmit: (corrections: InvestigationCaseCorrections) => Promise<unknown> | unknown
}

function CaseFields({
  investigationCase,
  canChangeOperator,
  losesAccessOnHandover,
  contentRef,
  onClose,
  onSubmit,
}: CaseFieldsProps) {
  const { t } = useTranslation()
  const [isHandoverPending, setIsHandoverPending] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState<OperatorCandidate | null>(
    investigationCase.operator
      ? { id: investigationCase.operator.id, name: operatorNameOf(investigationCase.operator) }
      : null
  )
  const isHandoverConfirmed = useRef(false)

  const { form, submitError } = useEditInvestigationCaseForm({
    investigationCase,
    onSubmit: async (corrections) => {
      if (corrections.operatorUserId !== undefined && !isHandoverConfirmed.current) {
        setIsHandoverPending(true)
        return
      }
      if (hasCorrections(corrections)) {
        try {
          await onSubmit(corrections)
        } finally {
          isHandoverConfirmed.current = false
        }
      }
      onClose()
    },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-medium text-grey-medium-2">
          {t('investigationCase.form.editTitle')}
        </DialogTitle>
        <DialogDescription>
          {t('investigationCase.form.editDescription', { caseNumber: investigationCase.caseNumber })}
        </DialogDescription>
      </DialogHeader>

      <form
        id="edit-case-form"
        className="grid gap-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <section className="grid gap-4">
          <h3 className="text-lg font-medium text-blue-dark-2">{t('investigationCase.form.sections.general')}</h3>
          <form.Field
            name="pvNumber"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.pvNumber.label')}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('investigationCase.form.fields.pvNumber.placeholder')}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </section>

        <section className="grid gap-4">
          <h3 className="text-lg font-medium text-blue-dark-2">{t('investigationCase.form.sections.context')}</h3>
          <form.Field
            name="description"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.description.label')}</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    rows={4}
                    className="min-h-28"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('investigationCase.form.fields.description.placeholder')}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </section>

        {canChangeOperator && (
          <section className="grid gap-4">
            <h3 className="text-lg font-medium text-blue-dark-2">{t('investigationCase.form.sections.operator')}</h3>
            <form.Field
              name="operatorUserId"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.operator.label')}</FieldLabel>
                  <OperatorPicker
                    id={field.name}
                    ariaLabel={t('investigationCase.form.fields.operator.label')}
                    selected={selectedOperator}
                    excludedOperatorId={investigationCase.operator?.id}
                    container={contentRef}
                    onSelect={(candidate) => {
                      setSelectedOperator(candidate)
                      field.handleChange(candidate?.id ?? '')
                    }}
                  />
                  <FieldDescription>{t('investigationCase.form.fields.operator.hint')}</FieldDescription>
                </Field>
              )}
            />
          </section>
        )}

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          {t('common.actions.cancel')}
        </Button>
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button variant="blue" type="submit" form="edit-case-form" disabled={isSubmitting}>
              {isSubmitting ? t('investigationCase.form.editSubmitting') : t('investigationCase.form.editSubmit')}
            </Button>
          )}
        />
      </DialogFooter>

      <CaseHandoverDialog
        isOpen={isHandoverPending}
        newOperatorName={selectedOperator?.name ?? ''}
        losesAccess={losesAccessOnHandover}
        onClose={() => setIsHandoverPending(false)}
        onConfirm={() => {
          isHandoverConfirmed.current = true
          setIsHandoverPending(false)
          form.handleSubmit()
        }}
      />
    </>
  )
}
