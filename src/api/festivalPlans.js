import { ApiError, request } from './http'

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
