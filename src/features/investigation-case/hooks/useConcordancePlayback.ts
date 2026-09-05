import { useEffect, useRef, useState } from 'react'

export type PlaybackStatus = 'idle' | 'playing' | 'paused'
export type PlaybackSpeed = 0.5 | 1 | 2

/** Délai de base entre deux paires révélées, ajusté par `speed`. */
const STEP_MS = 1500

/**
 * Machine à états de la démonstration des concordances : pur état UI éphémère
 * (aucune donnée serveur, rien n'est enregistré). Avance pair par pair via un
 * `setTimeout` récursif — la vitesse courante n'est lue qu'au moment de
 * planifier le pas suivant, donc un changement de vitesse s'applique
 * immédiatement au pas suivant sans resynchroniser une horloge globale.
 */
export function useConcordancePlayback(pairCount: number) {
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [revealedCount, setRevealedCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const speedRef = useRef(speed)
  useEffect(() => {
    speedRef.current = speed
  }, [speed])
  // Reflète `pairCount` sans capturer une valeur périmée dans la fermeture du
  // `setTimeout` déjà planifié (ex: une paire supprimée pendant la lecture).
  const pairCountRef = useRef(pairCount)
  useEffect(() => {
    pairCountRef.current = pairCount
  }, [pairCount])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timeoutRef.current === null) return
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  const scheduleNext = (index: number) => {
    clearTimer()
    if (index >= pairCount) return
    timeoutRef.current = setTimeout(() => {
      // Une paire supprimée pendant la lecture (suppression concurrente) peut
      // avoir fait chuter `pairCount` sous l'index déjà planifié : s'arrêter
      // proprement plutôt que révéler un index qui n'existe plus.
      if (index >= pairCountRef.current) {
        setStatus('idle')
        setRevealedCount(0)
        setActiveIndex(null)
        return
      }
      setActiveIndex(index)
      setRevealedCount(index + 1)
      scheduleNext(index + 1)
    }, STEP_MS / speedRef.current)
  }

  const play = () => {
    if (pairCount === 0) return
    setStatus('playing')
    setActiveIndex(0)
    setRevealedCount(1)
    scheduleNext(1)
  }

  const pause = () => {
    clearTimer()
    setStatus((current) => (current === 'playing' ? 'paused' : current))
  }

  const resume = () => {
    if (status !== 'paused' || revealedCount >= pairCount) return
    setStatus('playing')
    scheduleNext(revealedCount)
  }

  const toggle = () => {
    if (status === 'playing') pause()
    else if (status === 'paused') resume()
  }

  const stop = () => {
    clearTimer()
    setStatus('idle')
    setRevealedCount(0)
    setActiveIndex(null)
  }

  useEffect(() => clearTimer, [])

  return { status, speed, revealedCount, activeIndex, play, pause, resume, toggle, stop, setSpeed }
}
