import { ApiError, request } from './http'

const ANALYSES_PATH = '/api/analyses'

const isAnalysisId = (value) => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0
  return typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value.trim())
}

export const getAnalysisId = (response) => {
  const value = response?.data ?? response?.analysisId
  return isAnalysisId(value) ? String(value).trim() : null
}

const assertSuccess = (response, fallbackMessage) => {
  if (response?.success === false) {
    throw new ApiError(response.message || fallbackMessage, { data: response })
  }
  return response
}

const unwrapAnalysisData = (response, fallbackMessage) => {
  const successfulResponse = assertSuccess(response, fallbackMessage)
  if (!successfulResponse || !Object.prototype.hasOwnProperty.call(successfulResponse, 'data')) {
    throw new ApiError(fallbackMessage, { data: response })
  }
  return successfulResponse.data
}

export const getAnalysisDocuments = ({ page = 0, size = 10, signal } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  return request(`${ANALYSES_PATH}?${params.toString()}`, {
    auth: true,
    signal,
  })
}

export const getAnalysis = (analysisId, options = {}) => {
  if (!isAnalysisId(analysisId)) {
    throw new ApiError('분석 결과를 조회할 analysisId가 유효하지 않습니다.')
  }

  return request(`${ANALYSES_PATH}/${encodeURIComponent(String(analysisId).trim())}`, {
    ...options,
    auth: true,
  }).then((response) =>
    unwrapAnalysisData(response, '분석 결과 요약을 불러오지 못했습니다.'),
  )
}

export const getAnalysisReport = (analysisId, options = {}) => {
  if (!isAnalysisId(analysisId)) {
    throw new ApiError('분석 리포트 조회 조건이 유효하지 않습니다.')
  }

  return request(
    `${ANALYSES_PATH}/${encodeURIComponent(String(analysisId).trim())}/report`,
    {
      ...options,
      auth: true,
    },
  ).then((response) => {
    const successfulResponse = assertSuccess(response, '분석 최종 리포트를 불러오지 못했습니다.')
    if (successfulResponse?.summary) return successfulResponse
    if (successfulResponse?.data?.summary) return successfulResponse.data
    return successfulResponse
  })
}

export const getAnalysisItem = (analysisId, itemType, options = {}) => {
  if (!isAnalysisId(analysisId) || typeof itemType !== 'string' || !itemType.trim()) {
    throw new ApiError('분석 상세 결과 조회 조건이 유효하지 않습니다.')
  }

  return request(
    `${ANALYSES_PATH}/${encodeURIComponent(String(analysisId).trim())}/items/${encodeURIComponent(itemType.trim())}`,
    {
      ...options,
      auth: true,
    },
  ).then((response) =>
    unwrapAnalysisData(response, `${itemType} 분석 결과를 불러오지 못했습니다.`),
  )
}

export const getTargetVisitorAnalysis = (analysisId, options = {}) =>
  getAnalysisItem(analysisId, 'TARGET_VISITOR', options)

export const getTrendFitAnalysis = (analysisId, options = {}) =>
  getAnalysisItem(analysisId, 'TREND_FIT', options)

export const getDemandFitAnalysis = (analysisId, options = {}) =>
  getAnalysisItem(analysisId, 'DEMAND_FIT', options)

export const getConflictRiskAnalysis = (analysisId, options = {}) =>
  getAnalysisItem(analysisId, 'CONFLICT_RISK', options)

export const getWeatherRiskAnalysis = (analysisId, options = {}) =>
  getAnalysisItem(analysisId, 'WEATHER_RISK', options)

export const getTourismLinkageAnalysis = (analysisId, options = {}) =>
  getAnalysisItem(analysisId, 'TOURISM_LINKAGE', options)

const normalizePlanId = (planId) => {
  const value = typeof planId === 'string' ? planId.trim() : planId
  if (
    (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) &&
    (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value))
  ) {
    throw new ApiError('분석을 실행할 축제 기획안 ID가 유효하지 않습니다.')
  }
  return String(value)
}

export const executeFestivalPlanAnalysis = (planId, options = {}) => {
  const normalizedPlanId = normalizePlanId(planId)

  return request(
    `/api/festival-plans/${encodeURIComponent(normalizedPlanId)}/analyses`,
    {
      ...options,
      method: 'POST',
      auth: true,
      body: undefined,
    },
  ).then((response) => {
    if (response?.success === false) {
      throw new ApiError(response.message || '축제 기획안 분석 실행에 실패했습니다.', {
        data: response,
      })
    }
    return response
  })
}
