
export interface DataCompareResponse {
  reference_print: string
  score: number
  match: boolean
}

export type DataCompareInput = {
  trace: File
  reference_prints: File[]
  top?: number
}

export type UpdateLayerInput = {
  name?: string
  zIndex?: number
  isVisible?: boolean
  settings?: Record<string, unknown>
}
