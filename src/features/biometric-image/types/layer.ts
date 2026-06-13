export type LayerType = 'ANNOTATION' | 'FILTER'

export interface Layer {
  id: string
  fingerprintId: string
  name: string
  type: LayerType
  zIndex: number
  isVisible: boolean
  settings: Record<string, unknown>
}

export type CreateLayerInput = {
  id?: string
  fingerprintId: string
  name: string
  type: LayerType
  zIndex: number
  settings: Record<string, unknown>
}

export type UpdateLayerInput = {
  name?: string
  zIndex?: number
  isVisible?: boolean
  settings?: Record<string, unknown>
}
