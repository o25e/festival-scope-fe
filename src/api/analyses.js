import { request } from './http'

const ANALYSES_PATH = '/api/analyses'

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
