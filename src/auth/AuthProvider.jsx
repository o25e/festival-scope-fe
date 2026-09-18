import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  getTokenPair,
  getUser,
  login as loginRequest,
  logout as logoutRequest,
  reissue as reissueRequest,
  signup,
} from '../api/auth'
import { getAccessTokenFromResponse } from '../api/http'
import {
  clearAuthSession,
  AUTH_SESSION_CHANGED_EVENT,
  getAuthSession,
  getRefreshToken,
  saveAuthSession,
  updateAccessToken,
} from './authStorage'

const AuthContext = createContext(null)

const emptySession = {
  accessToken: null,
  refreshToken: null,
  user: null,
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getAuthSession)
  const [pendingAction, setPendingAction] = useState(null)
  const logoutPromiseRef = useRef(null)

  useEffect(() => {
    const syncSession = (event) => {
      setSession(event.detail || getAuthSession())
    }

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncSession)
    return () =>
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncSession)
  }, [])

  const handleSignup = useCallback(async (credentials, options) => {
    setPendingAction('signup')
    try {
      return await signup(credentials, options)
    } finally {
      setPendingAction(null)
    }
  }, [])

  const handleLogin = useCallback(async (credentials, options) => {
    setPendingAction('login')
    try {
      const response = await loginRequest(credentials, options)
      const tokens = getTokenPair(response)
      const nextSession = saveAuthSession({
        ...tokens,
        user: getUser(response),
      })
      setSession(nextSession)
      return response
    } finally {
      setPendingAction(null)
    }
  }, [])

  const handleLogout = useCallback(async (options) => {
    if (logoutPromiseRef.current) return logoutPromiseRef.current

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearAuthSession()
      setSession(emptySession)
      return null
    }

    setPendingAction('logout')
    logoutPromiseRef.current = (async () => {
      try {
        const response = await logoutRequest(refreshToken, options)
        clearAuthSession()
        setSession(emptySession)
        return response
      } catch (error) {
        const errorCode =
          error?.data?.errorCode ||
          error?.data?.code ||
          error?.data?.error?.errorCode ||
          error?.data?.error?.code

        // The server no longer has this refresh token. The client is already
        // logged out from the user's perspective, so discard the stale session.
        if (error?.status === 401 && errorCode === 'AUTH_004') {
          clearAuthSession()
          setSession(emptySession)
          return null
        }

        throw error
      } finally {
        setPendingAction(null)
        logoutPromiseRef.current = null
      }
    })()

    return logoutPromiseRef.current
  }, [])

  const handleReissue = useCallback(async (options) => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearAuthSession()
      return null
    }

    setPendingAction('reissue')
    try {
      const response = await reissueRequest(refreshToken, options)
      const nextSession = updateAccessToken(getAccessTokenFromResponse(response))
      setSession(nextSession)
      return response
    } catch (error) {
      clearAuthSession()
      throw error
    } finally {
      setPendingAction(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.accessToken && session.refreshToken),
      pendingAction,
      isPending: pendingAction !== null,
      signup: handleSignup,
      login: handleLogin,
      logout: handleLogout,
      reissue: handleReissue,
    }),
    [handleLogin, handleLogout, handleReissue, handleSignup, pendingAction, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.')
  return context
}
