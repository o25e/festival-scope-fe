const STORAGE_KEY = 'festivalscope.auth'
export const AUTH_SESSION_CHANGED_EVENT = 'festivalscope:auth-session-changed'

const emptySession = () => ({
  accessToken: null,
  refreshToken: null,
  user: null,
})

const getStorage = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

const notifySessionChange = (session) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: session }),
  )
}

export const getAuthSession = () => {
  const storage = getStorage()
  if (!storage) return emptySession()

  try {
    const stored = JSON.parse(storage.getItem(STORAGE_KEY) || 'null')
    if (!stored || typeof stored !== 'object') return emptySession()
    return {
      accessToken: stored.accessToken || null,
      refreshToken: stored.refreshToken || null,
      user: stored.user || null,
    }
  } catch {
    return emptySession()
  }
}

export const saveAuthSession = ({ accessToken, refreshToken, user = null }) => {
  const session = { accessToken, refreshToken, user }
  const storage = getStorage()
  if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(session))
  notifySessionChange(session)
  return session
}

export const updateAccessToken = (accessToken) => {
  const session = getAuthSession()
  const nextSession = { ...session, accessToken }
  const storage = getStorage()
  if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
  notifySessionChange(nextSession)
  return nextSession
}

export const clearAuthSession = () => {
  const storage = getStorage()
  if (storage) storage.removeItem(STORAGE_KEY)
  notifySessionChange(emptySession())
}

export const getAccessToken = () => getAuthSession().accessToken
export const getRefreshToken = () => getAuthSession().refreshToken
export const getCurrentUser = () => getAuthSession().user
