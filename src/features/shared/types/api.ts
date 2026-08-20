/** Métadonnées de l'enveloppe paginée du back (PageDto). */
export type PaginationMeta = {
  page: number
  limit: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/** Enveloppe de réponse paginée renvoyée par l'API ({ data, meta }). */
export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}
