import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

/**
 * Données factices pour valider visuellement le carrousel tant que les endpoints
 * back (`GET /api/traces`, `GET /api/reference-prints`) ne sont pas disponibles.
 */
export const biometricImageFixtures: BiometricImage[] = [
  { id: '1', fileName: 'trace1.png', url: 'https://placehold.co/73x107' },
  { id: '2', fileName: 'trace2.png', url: 'https://placehold.co/73x107' },
  { id: '3', fileName: 'trace3.png', url: 'https://placehold.co/73x107' },
  { id: '4', fileName: 'trace4.png', url: 'https://placehold.co/73x107' },
  { id: '5', fileName: 'trace5.png', url: 'https://placehold.co/73x107' },
  { id: '6', fileName: 'trace6.png', url: 'https://placehold.co/73x107' },
  { id: '7', fileName: 'trace7.png', url: 'https://placehold.co/73x107' },
  { id: '8', fileName: 'trace8.png', url: 'https://placehold.co/73x107' },
  { id: '9', fileName: 'trace_scene_de_crime_appartement_3eme_etage_2026.png', url: 'https://placehold.co/73x107' },
  { id: '10', fileName: 'trace6.png', url: 'https://placehold.co/73x107' },
  { id: '11', fileName: 'trace7.png', url: 'https://placehold.co/73x107' },
  { id: '12', fileName: 'trace8.png', url: 'https://placehold.co/73x107' },
]
