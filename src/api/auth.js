import { ApiError, getAccessTokenFromResponse, request } from './http'

export const signup = ({ email, password, name }, options = {}) =>
  request('/api/auth/signup', {
    ...options,
    method: 'POST',
    auth: false,
    body: { email, password, name },
  })

export const login = ({ email, password }, options = {}) =>
  request('/api/auth/login', {
    ...options,
    method: 'POST',
    auth: false,
    body: { email, password },
  })

export const logout = (refreshToken, options = {}) =>
  request('/api/auth/logout', {
    ...options,
    method: 'POST',
    auth: true,
    skipRefresh: true,
    body: { refreshToken },
  })

export const reissue = async (refreshToken, options = {}) => {
  const response = await request('/api/auth/reissue', {
    ...options,
    method: 'POST',
    auth: false,
    skipRefresh: true,
    body: { refreshToken },
  })
  getAccessTokenFromResponse(response)
  return response
}

const tokenFieldNames = {
  access: ['accessToken', 'access_token'],
  refresh: ['refreshToken', 'refresh_token'],
}

const isRecord = (value) => value !== null && typeof value === 'object'

const findTokenPair = (value) => {
  if (!isRecord(value)) return null

  const accessToken = tokenFieldNames.access
    .map((field) => value[field])
    .find((token) => typeof token === 'string' && token.length > 0)
  const refreshToken = tokenFieldNames.refresh
    .map((field) => value[field])
    .find((token) => typeof token === 'string' && token.length > 0)

  if (accessToken && refreshToken) return { accessToken, refreshToken }

  return Object.values(value)
    .filter(isRecord)
    .map(findTokenPair)
    .find(Boolean)
}

export const getTokenPair = (response) => {
  const tokens = findTokenPair(response)
  if (!tokens) {
    throw new ApiError(
      '로그인 응답에 Access Token과 Refresh Token이 없습니다.',
      { data: response },
    )
  }
  return tokens
}

export const getUser = (response) => {
  if (!isRecord(response)) return null
  if (isRecord(response.user)) return response.user
  if (isRecord(response.data?.user)) return response.data.user
  if (isRecord(response.result?.user)) return response.result.user
  return null
}
