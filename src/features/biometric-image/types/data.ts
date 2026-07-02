
export interface DataCompareResult {
  reference_print: string
  score: number
  match: boolean
}

export interface DataCompareResponse {
  results: DataCompareResult[]
}

export type DataCompareInput = {
  case_id: string
  trace_id: string
  reference_print_ids: string[]
  top?: number
}

export type UpdateLayerInput = {
  name?: string
  zIndex?: number
  isVisible?: boolean
  settings?: Record<string, unknown>
}
