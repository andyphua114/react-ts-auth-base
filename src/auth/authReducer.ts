import type { AuthState, AuthAction } from '@/types/auth'

export const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
  error: null,
}

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'BOOTSTRAP_SUCCESS':
      return { status: 'authenticated', user: action.payload.user, error: null }
    case 'BOOTSTRAP_FAILURE':
      return { status: 'unauthenticated', user: null, error: null }
    case 'LOGIN_START':
      return { status: 'loading', user: null, error: null }
    case 'LOGIN_SUCCESS':
      return { status: 'authenticated', user: action.payload.user, error: null }
    case 'LOGIN_FAILURE':
      return { status: 'unauthenticated', user: null, error: action.payload.error }
    case 'LOGOUT':
      return { status: 'unauthenticated', user: null, error: null }
  }
}
