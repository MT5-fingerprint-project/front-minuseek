import { Navigate, Outlet, useParams } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'


export default function TenantAuthBoundary() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to="/" replace />
  }

  return (
    <AuthProvider slug={slug}>
      <Outlet />
    </AuthProvider>
  )
}
