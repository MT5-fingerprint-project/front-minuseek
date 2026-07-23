/** Contour SVG des cartes d'affaire (carré) : onglet haut-gauche jusqu'à la moitié, courbe douce vers le bas-droit. */
const SHAPE =
  'M 4,30 Q 4,4 30,4 L 130,4 C 158,4 152,32 180,32 L 270,32 Q 296,32 296,58 L 296,270 Q 296,296 270,296 L 30,296 Q 4,296 4,270 Z'

/**
 * À placer en fond d'un conteneur `relative` carré (300×300) portant la classe `group`.
 * `dashed` = variante pointillée (carte d'ajout). Le hover (fond blue-light-1 / stroke blue-light-2)
 * est piloté par le `group` parent.
 */
export default function NotchedCardFrame({ dashed = false }: { dashed?: boolean }) {
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path
        d={SHAPE}
        fill={dashed ? 'none' : 'white'}
        stroke={dashed ? 'var(--color-blue-dark-1)' : 'var(--color-grey-light-2)'}
        strokeWidth={dashed ? 1.5 : 0.5}
        strokeDasharray={dashed ? '6 6' : undefined}
        vectorEffect="non-scaling-stroke"
        className={
          dashed
            ? 'transition-colors group-hover:fill-[var(--color-blue-light-1)]'
            : 'transition-colors group-hover:fill-[var(--color-blue-light-1)] group-hover:stroke-[var(--color-blue-light-2)]'
        }
      />
    </svg>
  )
}
