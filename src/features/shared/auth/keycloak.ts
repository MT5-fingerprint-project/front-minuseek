import Keycloak from 'keycloak-js'
import { KEYCLOAK_URL } from '@/features/shared/constants/global.constants'

const KEYCLOAK_CLIENT_ID = 'front-minuseek'
function realmForSlug(slug: string): string {
  return `minuseek-${slug}`
}

type KeycloakEntry = {
  keycloak: Keycloak
  initialization: Promise<boolean>
}

const instancesBySlug = new Map<string, KeycloakEntry>()

let activeKeycloak: Keycloak | null = null
let activeTenantSlug: string | null = null

export function setActiveKeycloak(keycloak: Keycloak, slug: string): void {
  activeKeycloak = keycloak
  activeTenantSlug = slug
}

export function getActiveKeycloak(): Keycloak | null {
  return activeKeycloak
}

export function getActiveTenantSlug(): string | null {
  return activeTenantSlug
}

export function getKeycloak(slug: string): KeycloakEntry {
  const existing = instancesBySlug.get(slug)
  if (existing) {
    return existing
  }

  const keycloak = new Keycloak({
    url: KEYCLOAK_URL,
    realm: realmForSlug(slug),
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
