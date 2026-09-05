import { useEffect, useRef, useState } from 'react'
import type { VideoFrameHandle } from '@/features/biometric-image/components/canvas/BiometricImageCanvas'
import type { MinutiaPair } from '@/features/investigation-case/types/minutiaPair'
import {
  boundingRectOf,
  compositeCanvasSize,
  drawCompositeFrame,
  type ScreenPosition,
} from '@/features/investigation-case/lib/concordanceVideoCompositor'
import {
  DRAW_INTERVAL_MS,
  VIDEO_BITRATE_BPS,
  VIDEO_FPS,
  VIDEO_FRAME_PIXEL_RATIO,
  isVideoRecordingSupported,
  pickConcordanceVideoFormat,
  type ConcordanceVideoFormat,
} from '@/features/investigation-case/lib/exportConcordanceVideo'

const DEFAULT_FORMAT: ConcordanceVideoFormat = { mimeType: 'video/webm', extension: 'webm', label: 'WebM' }

export type ConcordanceRecordingResult = { blob: Blob; format: ConcordanceVideoFormat }

type StartParams = {
  trace: React.RefObject<VideoFrameHandle | null>
  reference: React.RefObject<VideoFrameHandle | null>
  /** Figées pour toute la durée de l'enregistrement : la désignation écrite
   * sous chaque image. */
  traceCaption: string
  referenceCaption: string
  getTracePosition: (minutiaId: string) => ScreenPosition | null
  getReferencePosition: (minutiaId: string) => ScreenPosition | null
}

/**
 * Enregistrement vidéo de la démonstration des concordances (L7-4) : compose
 * les deux `Stage` Konva du comparateur, leurs désignations et le trait de
 * liaison de la paire montrée, sur un canvas
 * hors-écran, redessiné à intervalle régulier pendant que `MediaRecorder`
 * capture son flux (`captureStream`). Pur état UI éphémère côté client —
 * aucune donnée serveur, rien n'est enregistré côté back.
 */
export function useConcordanceRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const isMountedRef = useRef(true)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const originRef = useRef({ x: 0, y: 0 })
  const paramsRef = useRef<StartParams | null>(null)
  const linkStateRef = useRef<{
    pairs: MinutiaPair[]
    activePairId: string | null
    counterLabel: string
    activeTypeLabel: string
  }>({
    pairs: [],
    activePairId: null,
    counterLabel: '',
    activeTypeLabel: '',
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const formatRef = useRef<ConcordanceVideoFormat>(DEFAULT_FORMAT)

  const canRecord = isVideoRecordingSupported()

  const setLinkState = (
    pairs: MinutiaPair[],
    activePairId: string | null,
    counterLabel: string,
    activeTypeLabel: string
  ) => {
    linkStateRef.current = { pairs, activePairId, counterLabel, activeTypeLabel }
  }

  const drawTick = () => {
    const ctx = ctxRef.current
    const params = paramsRef.current
    if (!ctx || !params) return
    const traceFrame = params.trace.current?.captureFrame()
    const referenceFrame = params.reference.current?.captureFrame()
    if (!traceFrame || !referenceFrame) return
    const { pairs, activePairId, counterLabel, activeTypeLabel } = linkStateRef.current
    drawCompositeFrame(ctx, {
      origin: originRef.current,
      pixelRatio: VIDEO_FRAME_PIXEL_RATIO,
      traceFrame,
      referenceFrame,
      traceCaption: params.traceCaption,
      referenceCaption: params.referenceCaption,
      counterLabel,
      activeTypeLabel,
      pairs,
      activePairId,
      getTracePosition: params.getTracePosition,
      getReferencePosition: params.getReferencePosition,
    })
  }

  const cleanup = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Chrome ne capture fiablement le flux d'un canvas via `captureStream()`
    // que s'il participe à l'arbre du document — un canvas jamais attaché
    // laisse `MediaRecorder` encoder des images partiellement à jour (le
    // bandeau d'en-tête, dessiné en dernier, n'apparaissait jamais). Retiré
    // du DOM une fois l'enregistrement terminé.
    ctxRef.current?.canvas.remove()
    recorderRef.current = null
    chunksRef.current = []
    paramsRef.current = null
    ctxRef.current = null
  }

  /** Démarre l'enregistrement ; retourne `false` sans rien déclencher si la capture n'est pas possible. */
  const start = (params: StartParams): boolean => {
    if (!canRecord || isRecording) return false
    const traceFrame = params.trace.current?.captureFrame()
    const referenceFrame = params.reference.current?.captureFrame()
    if (!traceFrame || !referenceFrame) return false

    const bounds = boundingRectOf(traceFrame.rect, referenceFrame.rect)
    const canvas = document.createElement('canvas')
    const size = compositeCanvasSize(bounds, VIDEO_FRAME_PIXEL_RATIO)
    canvas.width = size.width
    canvas.height = size.height
    // Hors écran mais dans le DOM (cf. note dans `cleanup`) : nécessaire pour
    // que `captureStream()` reflète fidèlement chaque dessin.
    canvas.style.position = 'fixed'
    canvas.style.left = '-99999px'
    canvas.style.top = '0'
    canvas.style.pointerEvents = 'none'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return false
    }

    ctxRef.current = ctx
    originRef.current = { x: bounds.x, y: bounds.y }
    paramsRef.current = params
    drawTick() // première image dessinée avant que le flux ne commence à échantillonner

    const requestedFormat = pickConcordanceVideoFormat()
    const recorder = new MediaRecorder(canvas.captureStream(VIDEO_FPS), {
      ...(requestedFormat ? { mimeType: requestedFormat.mimeType } : {}),
      videoBitsPerSecond: VIDEO_BITRATE_BPS,
    })
    // Le conteneur réellement choisi par le navigateur prime sur le candidat demandé.
    formatRef.current = recorder.mimeType.includes('mp4')
      ? { mimeType: recorder.mimeType, extension: 'mp4', label: 'MP4' }
      : (requestedFormat ?? DEFAULT_FORMAT)
    chunksRef.current = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }
    recorderRef.current = recorder
    recorder.start()
    intervalRef.current = setInterval(drawTick, DRAW_INTERVAL_MS)
    setIsRecording(true)
    return true
  }

  /** Arrête proprement et résout le blob vidéo final (`null` si rien n'a pu être capturé). */
  const finish = (): Promise<ConcordanceRecordingResult | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      cleanup()
      if (isMountedRef.current) setIsRecording(false)
      return Promise.resolve(null)
    }
    const format = formatRef.current
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || format.mimeType })
        cleanup()
        if (isMountedRef.current) setIsRecording(false)
        resolve({ blob, format })
      }
      recorder.stop()
    })
  }

  /** Abandon (pas de fichier) : détachement de la fenêtre référence, suppression d'une paire pendant la lecture… */
  const cancel = () => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    cleanup()
    if (isMountedRef.current) setIsRecording(false)
  }

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { canRecord, isRecording, start, finish, cancel, setLinkState }
}
