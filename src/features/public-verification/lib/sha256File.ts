export const MAX_VERIFIABLE_BYTES = 100 * 1024 * 1024

export class FileTooLargeError extends Error {
  constructor() {
    super('Fichier trop volumineux pour être vérifié dans le navigateur')
    this.name = 'FileTooLargeError'
  }
}

export class InsecureContextError extends Error {
  constructor() {
    super("Le calcul d'empreinte exige une connexion sécurisée")
    this.name = 'InsecureContextError'
  }
}

function toHex(digest: ArrayBuffer): string {
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashFileSha256(file: File): Promise<string> {
  if (file.size > MAX_VERIFIABLE_BYTES) {
    throw new FileTooLargeError()
  }
  if (!globalThis.crypto?.subtle) {
    throw new InsecureContextError()
  }
  return toHex(await globalThis.crypto.subtle.digest('SHA-256', await file.arrayBuffer()))
}
