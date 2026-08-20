export type PaginationMeta = {
  page: number
  limit: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}
