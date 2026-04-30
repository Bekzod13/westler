import axios from 'axios'
import { getAdminToken } from './auth'

export const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export const api = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${apiBaseUrl}${path}`
}

export type AdminLoginResponse = {
  access_token: string
  user: { id: number; name: string; login: string }
}

/** Login without sending an existing Bearer token (uses plain axios). */
export async function adminLogin(login: string, password: string): Promise<AdminLoginResponse> {
  const { data } = await axios.post<AdminLoginResponse>(`${apiBaseUrl}/admin/auth/login`, {
    login,
    password,
  })
  return data
}
