import axios from 'axios'
import { API_URL } from '@/features/shared/constants/global.constants'


const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('accessToken')
      }
      return Promise.reject(error)
    }
  )

  return client
}



export const apiClient = createApiClient(API_URL)