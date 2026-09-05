import { sanitizeCaseNumber } from '@/features/biometric-image/lib/exportImage'

/** Cadence à laquelle `captureStream` ré-échantillonne le canvas composite —
 * indépendante de la fréquence à laquelle on le redessine. */
export const VIDEO_FPS = 30
/** Le contenu ne bouge que par paliers (`STEP_MS / speed`, 1500ms mini) : pas
 * besoin de redessiner le composite plus finement que ça. */
export const DRAW_INTERVAL_MS = 150
/** Même ratio que l'export image (`EXPORT_PIXEL_RATIO`) : la démonstration
 * doit rester lisible en projection, quitte à rastériser un peu plus souvent
 * (l'enregistrement reste un usage ponctuel, pas un rendu 60fps continu). */
export const VIDEO_FRAME_PIXEL_RATIO = 2
/** Débit cible du flux encodé — le défaut du navigateur, calé sur des usages
 * de visioconférence, compresserait trop fort le détail d'une empreinte. */
export const VIDEO_BITRATE_BPS = 8_000_000
/** Laisse un tick de dessin capturer l'état final complet avant de couper le
 * flux — sans ça la dernière minutie révélée peut manquer à l'appel. */
export const RECORDING_STOP_GRACE_MS = 400
/** Bandeau au-dessus des deux images : quelle fenêtre est laquelle, et le
 * compteur de paires — perdus dans la vidéo sinon (seul le canvas Konva de
 * chaque fenêtre est capturé, pas le titre ni les contrôles autour). */
export const VIDEO_HEADER_HEIGHT = 32

export type ConcordanceVideoFormat = {
  mimeType: string
  extension: 'mp4' | 'webm'
  /** Nom affiché dans l'interface (bouton, toast) — cf. critère "le format est dit dans l'interface". */
  label: 'MP4' | 'WebM'
}

/**
 * MP4/H.264 d'abord : Chrome et Edge récents savent l'enregistrer nativement
 * via `MediaRecorder` (pas de conversion chargée dans la page — juste un autre
 * type MIME du même appel natif que pour le WebM), et c'est le format le plus
 * lisible partout, y compris pour un dossier judiciaire. WebM reste le repli
 * pour les navigateurs qui ne savent produire que ça (ex. Firefox).
 */
const CANDIDATE_FORMATS: ConcordanceVideoFormat[] = [
  { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4', label: 'MP4' },
  { mimeType: 'video/mp4', extension: 'mp4', label: 'MP4' },
  { mimeType: 'video/webm;codecs=vp9', extension: 'webm', label: 'WebM' },
  { mimeType: 'video/webm;codecs=vp8', extension: 'webm', label: 'WebM' },
  { mimeType: 'video/webm', extension: 'webm', label: 'WebM' },
]

export function isVideoRecordingSupported(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    'captureStream' in HTMLCanvasElement.prototype
  )
}

export function pickConcordanceVideoFormat(): ConcordanceVideoFormat | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return CANDIDATE_FORMATS.find((format) => MediaRecorder.isTypeSupported(format.mimeType))
}

export function concordanceVideoFileName(caseNumber: string, at: Date, extension: 'mp4' | 'webm'): string {
  const sanitized = sanitizeCaseNumber(caseNumber)
  const pad = (n: number) => String(n).padStart(2, '0')
  const datePart = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}-${pad(at.getHours())}${pad(at.getMinutes())}`
  return `affaire-${sanitized}-demonstration-${datePart}.${extension}`
}
