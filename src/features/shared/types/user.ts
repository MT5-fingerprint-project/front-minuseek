export const USER_ROLES = ['ADMIN', 'OPERATOR', 'EXPERT'] as const

export type UserRole = (typeof USER_ROLES)[number]

/** `EXPERT` part en dépréciation : plus proposé au choix, mais encore rendu par l'API sur les comptes existants. */
export const SELECTABLE_USER_ROLES = ['ADMIN', 'OPERATOR'] as const satisfies readonly UserRole[]

export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  role: UserRole
  grade: string
  serviceNumber: string
}
