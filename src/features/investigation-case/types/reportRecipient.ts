import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

/** Une fiche du carnet de service, réutilisable d'un dossier à l'autre. */
export interface ReportRecipient {
  id: string
  authority: string
  attentionQuality: string | null
  attentionName: string | null
}

/** Ce qu'un dossier porte du destinataire : une copie des trois lignes. */
export interface CaseRecipient {
  recipientAuthority: string | null
  recipientAttentionQuality: string | null
  recipientAttentionName: string | null
}

export const caseRecipientSchema = z.object({
  authority: z.string().trim().min(1, i18n.t('investigationCase.recipient.validation.authorityRequired')),
  attentionQuality: z.string().trim().max(200),
  attentionName: z.string().trim().max(200),
  saveToBook: z.boolean(),
})

export type CaseRecipientFormValues = z.infer<typeof caseRecipientSchema>

export type CaseRecipientInput = {
  authority: string
  attentionQuality?: string
  attentionName?: string
}

/** L'option qui laisse saisir un destinataire inhabituel sans toucher au carnet. */
export const ONE_OFF_RECIPIENT = 'one-off'
