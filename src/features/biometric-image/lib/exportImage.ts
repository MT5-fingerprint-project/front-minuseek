import type Konva from 'konva'

export const EXPORT_PIXEL_RATIO = 2

/**
 * Rend la scène sur un fond blanc et l'encode en PNG. Passe par un canevas
 * intermédiaire plutôt que par `stage.toBlob` : ce dernier est typé trop
 * largement pour `URL.createObjectURL`, le canevas intermédiaire est ce qui
 * permet de peindre le fond, et `stage.toCanvas` est synchrone et bien typé.
 */
export async function stageToPngBlob(stage: Konva.Stage): Promise<Blob> {
  const sourceCanvas = stage.toCanvas({ pixelRatio: EXPORT_PIXEL_RATIO })

  const canvas = document.createElement('canvas')
  canvas.width = sourceCanvas.width
  canvas.height = sourceCanvas.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(sourceCanvas, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas export produced an empty blob'))
    }, 'image/png')
  })
}

function sanitizeCaseNumber(caseNumber: string): string {
  return caseNumber
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function exportFileName(caseNumber: string, kind: 'trace' | 'reference', at: Date): string {
  const sanitized = sanitizeCaseNumber(caseNumber)
  const kindLabel = kind === 'trace' ? 'trace' : 'empreinte'
  const pad = (n: number) => String(n).padStart(2, '0')
  const datePart = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}-${pad(at.getHours())}${pad(at.getMinutes())}`
  return `affaire-${sanitized}-${kindLabel}-${datePart}.png`
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
