import axios from 'axios'
import { API_URL } from '@/features/shared/constants/global.constants'
import { getActiveKeycloak } from '@/features/shared/auth/keycloak'

const TOKEN_MIN_VALIDITY_SECONDS = 30

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


apiClient.interceptors.request.use(async (config) => {
  const keycloak = getActiveKeycloak()
  if (keycloak?.token) {
    try {
      await keycloak.updateToken(TOKEN_MIN_VALIDITY_SECONDS)
    } catch {
      await keycloak.login()
    }
    config.headers.Authorization = `Bearer ${keycloak.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await getActiveKeycloak()?.login()
    }
    return Promise.reject(error)
  }
)
