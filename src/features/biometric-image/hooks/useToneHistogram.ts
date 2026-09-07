import { useEffect, useState } from 'react'
import { CURVE_LEVELS } from '@/features/biometric-image/lib/toneCurve'

const SAMPLE_SIDE = 256

const LUMA_RED = 0.299
const LUMA_GREEN = 0.587
const LUMA_BLUE = 0.114

/**
 * Répartition des 256 niveaux de la pièce, sur un échantillon réduit : elle ne
 * sert qu'à situer les points de la courbe sur la masse des pixels, pas à
 * mesurer. Une image servie sans en-tête CORS interdit la lecture du canevas ;
 * l'éditeur s'affiche alors sans fond.
 */
export function useToneHistogram(url: string | null | undefined): number[] | null {
  const [sample, setSample] = useState<{ url: string; bins: number[] } | null>(null)

  useEffect(() => {
    if (!url) return

    let isCurrent = true
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.src = url
    image.onload = () => {
      if (!isCurrent) return
      const longestSide = Math.max(image.width, image.height)
      const scale = longestSide > SAMPLE_SIDE ? SAMPLE_SIDE / longestSide : 1
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0, width, height)

      let pixels: Uint8ClampedArray
      try {
        pixels = context.getImageData(0, 0, width, height).data
      } catch {
        return
      }

      const bins = new Array<number>(CURVE_LEVELS).fill(0)
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const luminance =
          LUMA_RED * pixels[offset] +
          LUMA_GREEN * pixels[offset + 1] +
          LUMA_BLUE * pixels[offset + 2]
        bins[Math.round(luminance)] += 1
      }
      setSample({ url, bins })
    }

    return () => {
      isCurrent = false
      image.onload = null
    }
  }, [url])

  // Rendu depuis l'échantillon lui-même : changer de pièce doit vider le fond
  // sans attendre le décodage de la suivante.
  return sample && sample.url === url ? sample.bins : null
}
