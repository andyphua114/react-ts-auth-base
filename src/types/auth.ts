export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS' }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}
