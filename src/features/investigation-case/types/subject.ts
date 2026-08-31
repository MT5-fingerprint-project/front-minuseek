import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export const subjectSexSchema = z.enum(['MALE', 'FEMALE'])
export type SubjectSex = z.infer<typeof subjectSexSchema>

export const subjectTypeSchema = z.enum(['CLOSE_ASSOCIATE', 'PERSON_OF_INTEREST', 'VICTIM'])
export type SubjectType = z.infer<typeof subjectTypeSchema>

export interface Subject {
  id: string
  firstName: string
  lastName: string
  birthDate: string | null
  birthPlace: string | null
  firstParentName: string | null
  secondParentName: string | null
  phoneNumber: string | null
  sex: SubjectSex
  type: SubjectType
  color: string | null
  createdAt: string
}

export const subjectCreateSchema = z.object({
  lastName: z.string().trim().min(1, i18n.t('subject.validation.lastNameRequired')),
  firstName: z.string().trim().min(1, i18n.t('subject.validation.firstNameRequired')),
  birthDate: z.string(),
  birthPlace: z.string().trim(),
  sex: z.enum(subjectSexSchema.options, i18n.t('subject.validation.sexRequired')),
  type: z.enum(subjectTypeSchema.options, i18n.t('subject.validation.typeRequired')),
  phoneNumber: z.string().trim(),
  firstParentName: z.string().trim(),
  secondParentName: z.string().trim(),
})

export type SubjectCreateInput = z.infer<typeof subjectCreateSchema>
