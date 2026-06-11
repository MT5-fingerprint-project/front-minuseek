export type LayerKind = 'annotation' | 'adjustment'

export interface Layer {
  id: string
  kind: LayerKind
  name: string
  /** Thumbnail preview of the layer content */
  thumbnailUrl: string
  visible: boolean
}
