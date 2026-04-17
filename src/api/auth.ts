import type { LoginCredentials, AuthResponse } from '@/types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`)
  }

  return res.json() as Promise<AuthResponse>
}
