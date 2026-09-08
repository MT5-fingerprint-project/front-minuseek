import { useEffect, useRef, useState } from 'react'
import { useCreateLayer, useDeleteLayer, useUpdateLayer } from './useLayers'
import type { CreateLayerInput, Layer } from '@/features/biometric-image/types/layer'

export type LayerHistoryEntry =
  | { kind: 'create'; input: CreateLayerInput & { id: string } }
  | { kind: 'update'; id: string; before: Record<string, unknown>; after: Record<string, unknown> }
  | { kind: 'delete'; layer: Layer }

/**
 * Pile d'annulation/rétablissement des calques (annotations posées, type de minutie),
 * propre à l'image affichée : elle se vide dès que `fingerprintId` change, pour ne
 * jamais annuler par erreur l'édition d'une autre image.
 *
 * Les filtres/transformations (luminosité, rotation…) et la requalification en cascade
 * d'une minutie appariée (qui touche aussi la minutie en face, côté serveur) n'y passent
 * volontairement pas : un curseur se rajuste à la main, et une cascade serveur ne peut
 * pas être défaite de façon fiable depuis le client.
 */
export function useLayerHistory(fingerprintId: string | undefined) {
  const createLayer = useCreateLayer()
  const updateLayer = useUpdateLayer()
  const deleteLayer = useDeleteLayer()
  const undoStack = useRef<LayerHistoryEntry[]>([])
  const redoStack = useRef<LayerHistoryEntry[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const sync = () => {
    setCanUndo(undoStack.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }

  useEffect(() => {
    undoStack.current = []
    redoStack.current = []
    sync()
  }, [fingerprintId])

  const record = (entry: LayerHistoryEntry) => {
    undoStack.current.push(entry)
    redoStack.current = []
    sync()
  }

  const apply = (entry: LayerHistoryEntry, direction: 'undo' | 'redo') => {
    if (entry.kind === 'create') {
      if (direction === 'undo') deleteLayer.mutate(entry.input.id)
      else createLayer.mutate(entry.input)
      return
    }
    if (entry.kind === 'update') {
      updateLayer.mutate({ id: entry.id, input: { settings: direction === 'undo' ? entry.before : entry.after } })
      return
    }
    if (direction === 'undo') {
      const { id, fingerprintId, name, type, zIndex, settings } = entry.layer
      createLayer.mutate({ id, fingerprintId, name, type, zIndex, settings })
    } else {
      deleteLayer.mutate(entry.layer.id)
    }
  }

  const undo = () => {
    const entry = undoStack.current.pop()
    if (!entry) return
    apply(entry, 'undo')
    redoStack.current.push(entry)
    sync()
  }

  const redo = () => {
    const entry = redoStack.current.pop()
    if (!entry) return
    apply(entry, 'redo')
    undoStack.current.push(entry)
    sync()
  }

  return { record, undo, redo, canUndo, canRedo }
}
