export const USER_ROLES = ['ADMIN', 'OPERATOR', 'EXPERT'] as const

export type UserRole = (typeof USER_ROLES)[number]

/** Modèle de lecture d'un compte de service, commun à `GET /me` et à chaque ligne de `GET /users`. */
export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  role: UserRole
  grade: string
  serviceNumber: string
}
