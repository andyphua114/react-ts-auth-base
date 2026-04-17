import type { AuthState, AuthAction } from '@/types/auth'

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { isAuthenticated: false, isLoading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { isAuthenticated: true, isLoading: false, error: null }
    case 'LOGIN_FAILURE':
      return { isAuthenticated: false, isLoading: false, error: action.payload.error }
    case 'LOGOUT':
      return { isAuthenticated: false, isLoading: false, error: null }
  }
}
