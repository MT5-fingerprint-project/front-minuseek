import { apiClient } from '@/features/shared/lib/apiClient'
import type { Subject, SubjectCreateInput } from '@/features/investigation-case/types/subject'

export type RegisterSubjectInput = SubjectCreateInput & { caseId: string; color?: string }

export const SubjectAPI = {
  // Un champ laissé vide n'est pas envoyé : le serveur refuse la chaîne vide là
  // où il accepte l'absence.
  create: ({
    phoneNumber,
    firstParentName,
    secondParentName,
    birthDate,
    birthPlace,
    ...input
  }: RegisterSubjectInput) =>
    apiClient
      .post<{ id: string }>('/subjects', {
        ...input,
        birthDate: birthDate || undefined,
        birthPlace: birthPlace || undefined,
        phoneNumber: phoneNumber || undefined,
        firstParentName: firstParentName || undefined,
        secondParentName: secondParentName || undefined,
      })
      .then((res) => res.data),

  getAllByCase: (caseId: string) =>
    apiClient.get<{ data: Subject[] }>('/subjects', { params: { caseId } }).then((res) => res.data.data),

  getById: (id: string) => apiClient.get<Subject>(`/subjects/${id}`).then((res) => res.data),
}
