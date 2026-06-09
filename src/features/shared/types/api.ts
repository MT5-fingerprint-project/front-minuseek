/** Enveloppe de réponse paginée renvoyée par l'API ({ data, meta }). */
export type PaginatedResponse<T> = {
  data: T[]
  // À affiner quand le DTO de pagination du back sera figé.
  meta: Record<string, unknown>
}
