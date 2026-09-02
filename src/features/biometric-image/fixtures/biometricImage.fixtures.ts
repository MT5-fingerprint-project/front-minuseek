import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

/* *  * Données factices pour valider visuellement le carrousel sans appeler l'API
 * (utilisables dans des tests ou des stories Storybook).
 */
const baseTimestamp = '2026-06-11T01:44:21.943Z'

const makeFixture = (id: string, label: string): BiometricImage => ({
  id,
  label,
  number: null,
  url: 'https://placehold.co/73x107',
  thumbUrl: null,
  status: 'RECEIVED',
  identified: false,
  notIdentified: false,
  cote: null,
  caseId: 'fixture-case-id',
  subjectId: null,
  position: null,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
  matchings: [],
  withdrawnAt: null,
  withdrawalMotive: null,
  withdrawalMotiveDetail: null,
  imageDestroyedAt: null,
  resolutionDpi: null,
  origin: null,
  location: null,
  revelationTechnique: null,
  hasLocationPhoto: false,
  locationPhoto: null,
})

export const biometricImageFixtures: BiometricImage[] = [
  makeFixture('1', 'trace1.png'),
  makeFixture('2', 'trace2.png'),
  makeFixture('3', 'trace3.png'),
  makeFixture('4', 'trace4.png'),
  makeFixture('5', 'trace5.png'),
  makeFixture('6', 'trace6.png'),
  makeFixture('7', 'trace7.png'),
  makeFixture('8', 'trace8.png'),
  makeFixture('9', 'trace_scene_de_crime_appartement_3eme_etage_2026.png'),
  makeFixture('10', 'trace6.png'),
  makeFixture('11', 'trace7.png'),
  makeFixture('12', 'trace8.png'),
]
