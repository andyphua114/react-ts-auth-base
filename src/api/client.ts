import { getToken, clearToken } from '@/auth/tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}
