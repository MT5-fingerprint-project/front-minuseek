import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export const investigationCaseStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED'])
export type InvestigationCaseStatus = z.infer<typeof investigationCaseStatusSchema>

export type CaseUser = {
  id: string
  firstName: string
  lastName: string
}

export type CaseExpertise = {
  expert: CaseUser | null
  courtReference: string
  oathStatement: string
  swornAt: Date
}

/** Les dates arrivent en chaînes JSON : aucune réponse HTTP n'est parsée. */
export interface CaseJudicialHeader {
  requestDate: string | null
  requesterQuality: string | null
  requesterName: string | null
  requesterService: string | null
  offenseNature: string | null
  offenseLocation: string | null
  offenseDateFrom: string | null
  offenseDateTo: string | null
  interventionDate: string | null
  caseAgainst: string | null
}

export const JUDICIAL_HEADER_FIELDS = [
  'requestDate',
  'requesterQuality',
  'requesterName',
  'requesterService',
  'offenseNature',
  'offenseLocation',
  'offenseDateFrom',
  'offenseDateTo',
  'interventionDate',
  'caseAgainst',
] as const satisfies readonly (keyof CaseJudicialHeader)[]

export const JUDICIAL_DATE_FIELDS = [
  'requestDate',
  'offenseDateFrom',
  'offenseDateTo',
  'interventionDate',
] as const satisfies readonly (keyof CaseJudicialHeader)[]

export interface InvestigationCase extends Partial<CaseJudicialHeader> {
  id: string
  description?: string | undefined
  caseNumber: string
  pvNumber: string
  status: InvestigationCaseStatus
  operator: CaseUser | null
  expertise: CaseExpertise | null
  createdAt: Date
  updatedAt: Date
}

/** Un champ d'en-tête est vide tant qu'il vaut null ou la chaîne vide. */
export function isJudicialHeaderEmpty(investigationCase: InvestigationCase): boolean {
  return JUDICIAL_HEADER_FIELDS.every((field) => !investigationCase[field])
}

/** `<input type="date">` ne comprend que `AAAA-MM-JJ`, l'API rend un instant ISO. */
export function dateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ''
}

export const caseUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

export const caseExpertiseSchema = z.object({
  expert: caseUserSchema.nullable(),
  courtReference: z.string(),
  oathStatement: z.string(),
  swornAt: z.date(),
})

export const investigationCaseSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  caseNumber: z.string().min(1),
  pvNumber: z.string().min(1),
  status: investigationCaseStatusSchema,
  operator: caseUserSchema.nullable(),
  expertise: caseExpertiseSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const listInvestigationCasesResponseSchema = z.object({
  data: z.array(investigationCaseSchema),
})

export const investigationCaseCreateSchema = z.object({
  caseNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.caseNumberRequired')),
  pvNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.pvNumberRequired')),
  description: z.string().trim().max(2000),
})

export type InvestigationCaseCreateInput = z.infer<typeof investigationCaseCreateSchema>

const judicialHeaderShape = {
  requestDate: z.string(),
  requesterQuality: z.string().trim().max(200),
  requesterName: z.string().trim().max(200),
  requesterService: z.string().trim().max(300),
  offenseNature: z.string().trim().max(300),
  offenseLocation: z.string().trim().max(300),
  offenseDateFrom: z.string(),
  offenseDateTo: z.string(),
  interventionDate: z.string(),
  caseAgainst: z.string().trim().max(200),
}

export const investigationCaseEditSchema = z
  .object({
    pvNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.pvNumberRequired')),
    description: z.string().trim().max(2000),
    operatorUserId: z.string(),
    ...judicialHeaderShape,
  })
  // Les deux règles que le domaine oppose à la période : elles se jouent ici
  // pour ne pas partir chercher une 400.
  .refine((values) => values.offenseDateTo === '' || values.offenseDateFrom !== '', {
    path: ['offenseDateTo'],
    message: i18n.t('investigationCase.judicialHeader.validation.offensePeriodWithoutStart'),
  })
  .refine(
    (values) =>
      values.offenseDateTo === '' ||
      values.offenseDateFrom === '' ||
      values.offenseDateTo >= values.offenseDateFrom,
    {
      path: ['offenseDateTo'],
      message: i18n.t('investigationCase.judicialHeader.validation.offensePeriodReversed'),
    }
  )

export type InvestigationCaseEditValues = z.infer<typeof investigationCaseEditSchema>

export type InvestigationCaseCorrections = Partial<CaseJudicialHeader> & {
  pvNumber?: string
  description?: string | null
  operatorUserId?: string
}

export function correctedFieldsOf(
  investigationCase: InvestigationCase,
  values: InvestigationCaseEditValues
): InvestigationCaseCorrections {
  const corrections: InvestigationCaseCorrections = {}

  const pvNumber = values.pvNumber.trim()
  if (pvNumber !== investigationCase.pvNumber) {
    corrections.pvNumber = pvNumber
  }

  const description = values.description.trim()
  if (description !== (investigationCase.description ?? '')) {
    corrections.description = description === '' ? null : description
  }

  if (values.operatorUserId !== (investigationCase.operator?.id ?? '')) {
    corrections.operatorUserId = values.operatorUserId
  }

  // Un champ inchangé n'est pas envoyé, un champ vidé part à `null` : c'est ce
  // qui distingue « je n'y touche pas » de « je l'efface ».
  for (const field of JUDICIAL_HEADER_FIELDS) {
    const stated = values[field].trim()
    const current = isJudicialDateField(field)
      ? dateInputValue(investigationCase[field])
      : (investigationCase[field] ?? '')
    if (stated !== current) {
      Object.assign(corrections, { [field]: stated === '' ? null : stated })
    }
  }

  return corrections
}

function isJudicialDateField(field: keyof CaseJudicialHeader): boolean {
  return (JUDICIAL_DATE_FIELDS as readonly string[]).includes(field)
}

export function judicialHeaderFormValues(
  investigationCase: InvestigationCase
): Record<(typeof JUDICIAL_HEADER_FIELDS)[number], string> {
  return {
    requestDate: dateInputValue(investigationCase.requestDate),
    requesterQuality: investigationCase.requesterQuality ?? '',
    requesterName: investigationCase.requesterName ?? '',
    requesterService: investigationCase.requesterService ?? '',
    offenseNature: investigationCase.offenseNature ?? '',
    offenseLocation: investigationCase.offenseLocation ?? '',
    offenseDateFrom: dateInputValue(investigationCase.offenseDateFrom),
    offenseDateTo: dateInputValue(investigationCase.offenseDateTo),
    interventionDate: dateInputValue(investigationCase.interventionDate),
    caseAgainst: investigationCase.caseAgainst ?? '',
  }
}

export function hasCorrections(corrections: InvestigationCaseCorrections): boolean {
  return Object.keys(corrections).length > 0
}

export function caseUserNameOf({ firstName, lastName }: CaseUser): string {
  return `${firstName} ${lastName}`
}

export type CaseExpertiseDeclaration = {
  oathStatement: string
  courtReference: string
}
