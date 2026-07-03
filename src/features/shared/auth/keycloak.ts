import Keycloak from 'keycloak-js'
import { KEYCLOAK_URL } from '@/features/shared/constants/global.constants'

const KEYCLOAK_CLIENT_ID = 'front-minuseek'

type KeycloakEntry = {
  keycloak: Keycloak
  initialization: Promise<boolean>
}

// Une instance par tenant (realm = slug), initialisée une seule fois — le
// double-montage de StrictMode ne doit jamais rappeler keycloak.init().
const instancesBySlug = new Map<string, KeycloakEntry>()

// Instance du tenant courant : consommée par apiClient pour obtenir un token
// frais à chaque requête — le token ne vit qu'en mémoire (jamais en storage,
// la persistance de session est portée par le cookie HttpOnly de Keycloak).
let activeKeycloak: Keycloak | null = null

export function setActiveKeycloak(keycloak: Keycloak): void {
  activeKeycloak = keycloak
}

export function getActiveKeycloak(): Keycloak | null {
  return activeKeycloak
}

export function getKeycloak(slug: string): KeycloakEntry {
  const existing = instancesBySlug.get(slug)
  if (existing) {
    return existing
  }

  const keycloak = new Keycloak({
    url: KEYCLOAK_URL,
    realm: slug,
    clientId: KEYCLOAK_CLIENT_ID,
  })

  const initialization = keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })

  const entry: KeycloakEntry = { keycloak, initialization }
  instancesBySlug.set(slug, entry)
  return entry
}
