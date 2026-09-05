import type { InvestigationCaseStatus } from '@/features/investigation-case/types/investigationCase'

export const CASE_STATUS_STYLES: Record<InvestigationCaseStatus, string> = {
  OPEN: 'bg-grey-light-1 text-grey-dark border-grey-dark',
  IN_PROGRESS: 'bg-orange-light text-orange-medium border-orange-medium',
  UNDER_REVIEW: 'bg-blue-light-1 text-blue-dark-1 border-blue-dark-1',
  CLOSED: 'bg-green-light text-green-medium border-green-medium',
}

export const CASE_STATUS_PILL =
  'inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium leading-[16px]'
