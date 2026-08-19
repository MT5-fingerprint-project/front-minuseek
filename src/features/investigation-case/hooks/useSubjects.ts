import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { SubjectAPI } from '@/features/investigation-case/services/SubjectAPI.services'
import { pickSubjectColor } from '@/features/investigation-case/constants/subject.constants'
import type { Subject, SubjectCreateInput } from '@/features/investigation-case/types/subject'

export const subjectKeys = {
  all: ['subjects'] as const,
  list: (caseId: string) => [...subjectKeys.all, 'list', caseId] as const,
  detail: (id: string) => [...subjectKeys.all, 'detail', id] as const,
}

export function useSubjects(caseId: string) {
  return useQuery({
    queryKey: subjectKeys.list(caseId),
    queryFn: () => SubjectAPI.getAllByCase(caseId),
    enabled: !!caseId,
  })
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: subjectKeys.detail(id),
    queryFn: () => SubjectAPI.getById(id),
    enabled: !!id,
  })
}

export function useCreateSubject(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: SubjectCreateInput) => {
      const subjects = queryClient.getQueryData<Subject[]>(subjectKeys.list(caseId)) ?? []
      return SubjectAPI.create({ ...input, caseId, color: pickSubjectColor(subjects.length) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.list(caseId) })
      toast.success(t('subject.success.created'))
    },
  })
}
