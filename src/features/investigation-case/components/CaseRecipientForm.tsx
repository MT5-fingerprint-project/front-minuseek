import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/dialog'
import { Field, FieldLabel, FieldError } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/shared/ui/select'
import { Switch } from '@/features/shared/ui/switch'
import {
  caseRecipientSchema,
  ONE_OFF_RECIPIENT,
  type CaseRecipientFormValues,
  type CaseRecipientInput,
  type ReportRecipient,
} from '@/features/investigation-case/types/reportRecipient'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

type CaseRecipientFormProps = {
  investigationCase: InvestigationCase | null
  book: ReportRecipient[]
  onClose: () => void
  onSubmit: (input: CaseRecipientInput, alsoSaveToBook: boolean) => Promise<unknown>
  onRemoveFromBook: (id: string) => void
}

function RecipientField({ field, label, placeholder }: { field: AnyFieldApi; label: string; placeholder: string }) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default function CaseRecipientForm({
  investigationCase,
  book,
  onClose,
  onSubmit,
  onRemoveFromBook,
}: CaseRecipientFormProps) {
  return (
    <Dialog open={investigationCase !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md sm:max-w-2xl">
        {investigationCase && (
          <RecipientFields
            investigationCase={investigationCase}
            book={book}
            onClose={onClose}
            onSubmit={onSubmit}
            onRemoveFromBook={onRemoveFromBook}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RecipientFields({
  investigationCase,
  book,
  onClose,
  onSubmit,
  onRemoveFromBook,
}: CaseRecipientFormProps & { investigationCase: InvestigationCase }) {
  const { t } = useTranslation()
  const [pickedFromBook, setPickedFromBook] = useState(ONE_OFF_RECIPIENT)

  const defaultValues: CaseRecipientFormValues = {
    authority: investigationCase.recipientAuthority ?? '',
    attentionQuality: investigationCase.recipientAttentionQuality ?? '',
    attentionName: investigationCase.recipientAttentionName ?? '',
    saveToBook: false,
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: caseRecipientSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(
        {
          authority: value.authority.trim(),
          attentionQuality: value.attentionQuality.trim(),
          attentionName: value.attentionName.trim(),
        },
        value.saveToBook
      )
      onClose()
    },
  })

  /** Reprendre une fiche pré-remplit les trois champs, qui restent modifiables. */
  function prefillFrom(entryId: string) {
    setPickedFromBook(entryId)
    const entry = book.find((candidate) => candidate.id === entryId)
    if (!entry) return
    form.setFieldValue('authority', entry.authority)
    form.setFieldValue('attentionQuality', entry.attentionQuality ?? '')
    form.setFieldValue('attentionName', entry.attentionName ?? '')
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-medium text-grey-medium-2">
          {t('investigationCase.recipient.choose')}
        </DialogTitle>
        <DialogDescription>{t('investigationCase.recipient.title')}</DialogDescription>
      </DialogHeader>

      <form
        id="case-recipient-form"
        className="grid gap-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <Field>
          <FieldLabel htmlFor="recipient-from-book">{t('investigationCase.recipient.fromBook')}</FieldLabel>
          <Select value={pickedFromBook} onValueChange={prefillFrom}>
            <SelectTrigger id="recipient-from-book" className="h-11 w-full rounded-xs border-grey-light-2 bg-white">
              <SelectValue placeholder={t('investigationCase.recipient.fromBookPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ONE_OFF_RECIPIENT}>{t('investigationCase.recipient.oneOff')}</SelectItem>
              {book.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {entry.authority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {book.length > 0 && (
          <ul className="flex flex-col gap-1">
            {book.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="truncate">{entry.authority}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  aria-label={t('investigationCase.recipient.removeFromBook')}
                  onClick={() => onRemoveFromBook(entry.id)}
                >
                  <Icon name="closeSmall" size={16} color="currentColor" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-4">
          <form.Field
            name="authority"
            children={(field) => (
              <RecipientField
                field={field}
                label={t('investigationCase.recipient.fields.authority.label')}
                placeholder={t('investigationCase.recipient.fields.authority.placeholder')}
              />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field
              name="attentionQuality"
              children={(field) => (
                <RecipientField
                  field={field}
                  label={t('investigationCase.recipient.fields.attentionQuality.label')}
                  placeholder={t('investigationCase.recipient.fields.attentionQuality.placeholder')}
                />
              )}
            />
            <form.Field
              name="attentionName"
              children={(field) => (
                <RecipientField
                  field={field}
                  label={t('investigationCase.recipient.fields.attentionName.label')}
                  placeholder={t('investigationCase.recipient.fields.attentionName.placeholder')}
                />
              )}
            />
          </div>
        </div>

        <form.Field
          name="saveToBook"
          children={(field) => (
            <div className="flex items-center gap-3">
              <Switch
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
              <FieldLabel htmlFor={field.name}>{t('investigationCase.recipient.saveToBook')}</FieldLabel>
            </div>
          )}
        />
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          {t('common.actions.cancel')}
        </Button>
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button variant="blue" type="submit" form="case-recipient-form" disabled={isSubmitting}>
              {isSubmitting ? t('investigationCase.form.editSubmitting') : t('investigationCase.form.editSubmit')}
            </Button>
          )}
        />
      </DialogFooter>
    </>
  )
}
