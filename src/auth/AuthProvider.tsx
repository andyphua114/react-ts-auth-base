import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { authReducer, initialAuthState } from './authReducer'
import { loginRequest, logoutSession, refreshSession } from '@/api/auth'
import { createAuthorizedFetch } from '@/api/client'
import type { LoginCredentials } from '@/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  const tokenRef = useRef<string | null>(null)
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null)

  const getToken = useCallback(() => tokenRef.current, [])

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current

    refreshInFlightRef.current = refreshSession()
      .then(({ access_token, user }) => {
        tokenRef.current = access_token
        dispatch({ type: 'BOOTSTRAP_SUCCESS', payload: { user } })
        return access_token
      })
      .catch(() => {
        tokenRef.current = null
        dispatch({ type: 'BOOTSTRAP_FAILURE' })
        return null
      })
      .finally(() => {
        refreshInFlightRef.current = null
      })

    return refreshInFlightRef.current
  }, [])

  const logout = useCallback(async () => {
    tokenRef.current = null
    dispatch({ type: 'LOGOUT' })
    await logoutSession().catch(() => {})
  }, [])

  const authenticatedFetch = useMemo(
    () => createAuthorizedFetch({ getToken, refreshAccessToken, onAuthFailure: logout }),
    [getToken, refreshAccessToken, logout],
  )

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const { access_token, user } = await loginRequest(credentials)
      tokenRef.current = access_token
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } })
    } catch {
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Invalid credentials.' } })
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    refreshSession()
      .then(({ access_token, user }) => {
        if (cancelled) return
        tokenRef.current = access_token
        dispatch({ type: 'BOOTSTRAP_SUCCESS', payload: { user } })
      })
      .catch(() => {
        if (cancelled) return
        dispatch({ type: 'BOOTSTRAP_FAILURE' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: state.status === 'authenticated',
        authenticatedFetch,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
