import { ApiError, request } from './http'

const PLAN_ID_FIELDS = ['planId', 'festivalPlanId', 'id']

const isPlanId = (value) => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0
  return typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value.trim())
}

const findPlanId = (value) => {
  if (!value || typeof value !== 'object') return null

  for (const field of PLAN_ID_FIELDS) {
    if (isPlanId(value[field])) return String(value[field]).trim()
  }

  for (const field of ['data', 'result', 'payload']) {
    const nested = value[field]
    if (isPlanId(nested)) return String(nested).trim()
    if (nested && typeof nested === 'object') {
      const found = findPlanId(nested)
      if (found) return found
    }
  }

  return null
}

export const getFestivalPlanId = (response) => {
  if (isPlanId(response?.data)) return String(response.data).trim()
  return findPlanId(response)
}

export const createFestivalPlan = (payload, options = {}) =>
  request('/api/festival-plans', {
    ...options,
    method: 'POST',
    auth: true,
    body: payload,
  }).then((response) => {
    if (response?.success === false) {
      throw new ApiError(response.message || '축제 기획안 등록에 실패했습니다.', {
        data: response,
      })
    }
    return response
  })

export const parseFestivalPlan = (file, options = {}) => {
  const formData = new FormData()
  formData.append('file', file, file.name)

  return request('/api/festival-plans/parse', {
    ...options,
    method: 'POST',
    auth: true,
    body: formData,
  })
}
