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
  // Ref synchrone (garde anti double-clic) + state (reflété dans l'UI) : le state
  // seul arriverait trop tard pour bloquer un deuxième clic dans la même frame.
  const isApplyingRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

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

  const apply = async (entry: LayerHistoryEntry, direction: 'undo' | 'redo') => {
    if (entry.kind === 'create') {
      if (direction === 'undo') await deleteLayer.mutateAsync(entry.input.id)
      else await createLayer.mutateAsync(entry.input)
      return
    }
    if (entry.kind === 'update') {
      await updateLayer.mutateAsync({
        id: entry.id,
        input: { settings: direction === 'undo' ? entry.before : entry.after },
      })
      return
    }
    if (direction === 'undo') {
      const { id, fingerprintId, name, type, zIndex, settings } = entry.layer
      await createLayer.mutateAsync({ id, fingerprintId, name, type, zIndex, settings })
    } else {
      await deleteLayer.mutateAsync(entry.layer.id)
    }
  }

  // Si la mutation échoue (déjà toastée par son propre hook), l'entrée retourne sur
  // sa pile d'origine plutôt que d'avancer : la pile ne doit jamais promettre un état
  // serveur qui n'a pas été atteint.
  const undo = async () => {
    if (isApplyingRef.current) return
    const entry = undoStack.current.pop()
    if (!entry) return
    isApplyingRef.current = true
    setIsApplying(true)
    sync()
    try {
      await apply(entry, 'undo')
      redoStack.current.push(entry)
    } catch {
      undoStack.current.push(entry)
    } finally {
      isApplyingRef.current = false
      setIsApplying(false)
      sync()
    }
  }

  const redo = async () => {
    if (isApplyingRef.current) return
    const entry = redoStack.current.pop()
    if (!entry) return
    isApplyingRef.current = true
    setIsApplying(true)
    sync()
    try {
      await apply(entry, 'redo')
      undoStack.current.push(entry)
    } catch {
      redoStack.current.push(entry)
    } finally {
      isApplyingRef.current = false
      setIsApplying(false)
      sync()
    }
  }

  return { record, undo, redo, canUndo, canRedo, isApplying }
}
