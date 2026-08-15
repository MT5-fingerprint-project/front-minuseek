/**
 * Pastels issus de la palette Tailwind (nuance 300, celle des thèmes shadcn) :
 * couleur attribuée à chaque sujet pour border ses empreintes dans le comparateur.
 * Format #RRGGBB attendu par le back (RegisterSubjectDto.color).
 */
export const SUBJECT_COLORS = [
  '#93C5FD', // blue-300
  '#6EE7B7', // emerald-300
  '#FCD34D', // amber-300
  '#FDA4AF', // rose-300
  '#C4B5FD', // violet-300
  '#67E8F9', // cyan-300
  '#FDBA74', // orange-300
  '#F0ABFC', // fuchsia-300
] as const

/** Attribution cyclique : n-ième sujet créé → n-ième couleur de la palette. */
export function pickSubjectColor(subjectCount: number): string {
  return SUBJECT_COLORS[subjectCount % SUBJECT_COLORS.length]
}
