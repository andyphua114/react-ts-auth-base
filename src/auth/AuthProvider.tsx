import { useCallback, useReducer } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { authReducer } from './authReducer'
import { getToken, setToken, clearToken } from './tokenStorage'
import { loginRequest } from '@/api/auth'
import type { LoginCredentials } from '@/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: !!getToken(),
    isLoading: false,
    error: null,
  })

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const { access_token } = await loginRequest(credentials)
      setToken(access_token)
      dispatch({ type: 'LOGIN_SUCCESS' })
    } catch {
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Invalid credentials.' } })
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
