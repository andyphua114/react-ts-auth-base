let _token: string | null = null

const SESSION_KEY = 'auth_token'

export function getToken(): string | null {
  if (_token) return _token
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    _token = stored
  }
  return _token
}

export function setToken(token: string): void {
  _token = token
  sessionStorage.setItem(SESSION_KEY, token)
}

export function clearToken(): void {
  _token = null
  sessionStorage.removeItem(SESSION_KEY)
}
