import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from '../auth/authStorage'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, cause = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.cause = cause
  }
}

const getErrorMessage = (data, status) => {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const message = data.message || data.error || data.detail
    if (typeof message === 'string' && message.trim()) return message
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors
        .map((error) =>
          typeof error === 'string' ? error : error?.message || String(error),
        )
        .join(', ')
    }
  }
  return status
    ? `요청에 실패했습니다. (${status})`
    : '네트워크 오류가 발생했습니다.'
}

const parseResponseBody = async (response) => {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const accessTokenFields = ['accessToken', 'access_token']
const isRecord = (value) => value !== null && typeof value === 'object'

const findAccessToken = (value) => {
  if (!isRecord(value)) return null

  const accessToken = accessTokenFields
    .map((field) => value[field])
    .find((token) => typeof token === 'string' && token.length > 0)
  if (accessToken) return accessToken

  return Object.values(value)
    .filter(isRecord)
    .map(findAccessToken)
    .find(Boolean)
}

export const getAccessTokenFromResponse = (response) => {
  const accessToken = findAccessToken(response)
  if (!accessToken) {
    throw new ApiError(
      '재발급 응답에 유효한 Access Token이 없습니다.',
      { data: response },
    )
  }
  return accessToken
}

const getExpirySignals = (data) => {
  if (typeof data === 'string') return [data]
  if (!isRecord(data)) return []

  const values = []
  const visit = (value, key = '') => {
    if (typeof value === 'string') {
      if (
        !key ||
        /^(code|errorCode|error_code|reason|type|message|error|detail)$/i.test(
          key,
        )
      )
        values.push(value)
      return
    }
    if (!isRecord(value)) return
    Object.entries(value).forEach(([childKey, childValue]) =>
      visit(childValue, childKey),
    )
  }
  visit(data)
  return values
}

const isAccessTokenExpiredResponse = (status, data) => {
  if (status !== 401) return false

  return getExpirySignals(data).some((signal) => {
    const normalized = signal.toLowerCase().replace(/[\s_-]/g, '')
    return (
      normalized.includes('accesstokenexpired') ||
      normalized.includes('accesstoken이만료') ||
      normalized.includes('jwtexpired') ||
      normalized.includes('tokenexpired') ||
      normalized.includes('token만료') ||
      normalized.includes('expiredaccesstoken') ||
      /(access[\s_-]*token|jwt|token).{0,30}(expired|expire|만료)/i.test(
        signal,
      )
    )
  })
}

let refreshPromise = null

const reissueAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuthSession()
    throw new ApiError('Refresh Token이 없습니다.')
  }

  try {
    const response = await request('/api/auth/reissue', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
      skipRefresh: true,
    })
    const accessToken = getAccessTokenFromResponse(response)
    updateAccessToken(accessToken)
    return accessToken
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

const getRefreshedAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = reissueAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function request(
  path,
  {
    method = 'GET',
    body,
    headers = {},
    signal,
    auth = false,
    skipRefresh = false,
    retry = false,
  } = {},
) {
  const requestHeaders = new Headers(headers)
  const isFormDataBody =
    typeof FormData !== 'undefined' && body instanceof FormData
  if (isFormDataBody) requestHeaders.delete('Content-Type')
  else if (body !== undefined)
    requestHeaders.set('Content-Type', 'application/json')

  const requestAccessToken = auth ? getAccessToken() : null
  if (auth) {
    if (requestAccessToken)
      requestHeaders.set('Authorization', `Bearer ${requestAccessToken}`)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormDataBody
            ? body
            : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError('네트워크 오류가 발생했습니다.', { cause: error })
  }

  const data = await parseResponseBody(response)
  if (!response.ok) {
    const error = new ApiError(getErrorMessage(data, response.status), {
      status: response.status,
      data,
    })

    const canRefresh =
      auth &&
      !skipRefresh &&
      !retry &&
      isAccessTokenExpiredResponse(response.status, data)

    if (!canRefresh) throw error

    const currentAccessToken = getAccessToken()
    if (!currentAccessToken) {
      clearAuthSession()
      throw error
    }

    if (currentAccessToken === requestAccessToken) {
      await getRefreshedAccessToken()
    }

    return request(path, {
      method,
      body,
      headers,
      signal,
      auth,
      skipRefresh: true,
      retry: true,
    })
  }

  return data
}
