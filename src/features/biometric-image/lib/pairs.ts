import type { Layer } from '@/features/biometric-image/types/layer'

const ANNOTATION_FRAME = 'source-pixels'
const ANNOTATION_SCHEMA_VERSION = 1

export type PairSettings = {
  type: 'pair'
  referencePrintId: string
  traceMinutiaId: string
  referenceMinutiaId: string
  frame: typeof ANNOTATION_FRAME
  schemaVersion: typeof ANNOTATION_SCHEMA_VERSION
}

export function isPairSettings(settings: Record<string, unknown>): settings is PairSettings {
  return settings.type === 'pair'
}

export function pairSettings(
  referencePrintId: string,
  traceMinutiaId: string,
  referenceMinutiaId: string,
): PairSettings {
  return {
    type: 'pair',
    referencePrintId,
    traceMinutiaId,
    referenceMinutiaId,
    frame: ANNOTATION_FRAME,
    schemaVersion: ANNOTATION_SCHEMA_VERSION,
  }
}

export type MinutiaPair = {
  layerId: string
  traceMinutiaId: string
  referenceMinutiaId: string
  /** Rang parmi les paires de cette empreinte de référence, dans l'ordre de création — pas stocké,
   *  recalculé à chaque lecture : défaire une paire renumérote les suivantes sans laisser de trou. */
  number: number
}

/** Les paires vivent en calques ANNOTATION sur la trace (L7-2a) ; on ne garde que celles de l'empreinte affichée. */
export function derivePairs(traceLayers: Layer[], referencePrintId: string | undefined): MinutiaPair[] {
  if (!referencePrintId) return []
  return traceLayers
    .filter((layer): layer is Layer & { settings: PairSettings } => isPairSettings(layer.settings))
    .filter((layer) => layer.settings.referencePrintId === referencePrintId)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((layer, index) => ({
      layerId: layer.id,
      traceMinutiaId: layer.settings.traceMinutiaId,
      referenceMinutiaId: layer.settings.referenceMinutiaId,
      number: index + 1,
    }))
}

/** Numéro de paire par id de minutie, des deux côtés à la fois (les ids sont uniques globalement). */
export function pairNumberByMinutiaId(pairs: MinutiaPair[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const pair of pairs) {
    map.set(pair.traceMinutiaId, pair.number)
    map.set(pair.referenceMinutiaId, pair.number)
  }
  return map
}
