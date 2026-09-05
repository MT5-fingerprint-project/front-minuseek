import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import OperatorHomePage from '@/features/operator-home/pages/OperatorHomePage'
import ServiceHomePage from '@/features/statistics/pages/ServiceHomePage'

// Deux accueils distincts derrière la même URL : le responsable pilote un stock
// qu'il ne traite pas, l'opérateur reprend le sien. Tant que le rôle n'est pas
// connu, on ne rend ni l'un ni l'autre — afficher puis remplacer ferait
// clignoter un écran à chaque ouverture.
export default function HomeRoute() {
  const { data: currentUser, isPending } = useCurrentUser()

  if (isPending) return null
  return currentUser?.role === 'ADMIN' ? <ServiceHomePage /> : <OperatorHomePage />
}
