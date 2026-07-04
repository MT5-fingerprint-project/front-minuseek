import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthContext, type AuthContextValue } from './auth-context'
import { getKeycloak, setActiveKeycloak } from './keycloak'

type AuthProviderProps = {
  slug: string
  children: ReactNode
}

export function AuthProvider({ slug, children }: AuthProviderProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'connecting' | 'authenticated' | 'error'>('connecting')

  useEffect(() => {
    let isActive = true
    const { keycloak, initialization } = getKeycloak(slug)

    initialization
      .then((authenticated) => {
        if (!authenticated) {
          void keycloak.login()
          return
        }
        setActiveKeycloak(keycloak, slug)
        if (isActive) {
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (isActive) {
          setStatus('error')
        }
      })

    return () => {
      isActive = false
    }
  }, [slug])

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t(status === 'error' ? 'auth.error' : 'auth.connecting')}
      </div>
    )
  }

  const { keycloak } = getKeycloak(slug)

  const value: AuthContextValue = {
    slug,
    username: (keycloak.tokenParsed?.preferred_username as string | undefined) ?? undefined,
    logout: () => {
      void keycloak.logout({ redirectUri: `${window.location.origin}/${slug}` })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
