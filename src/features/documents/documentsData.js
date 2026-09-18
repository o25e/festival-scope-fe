export const DOCUMENT_STATUS = {
  COMPLETED: 'completed',
  ANALYZING: 'analyzing',
  WAITING: 'waiting',
}

const formatDate = (value) => {
  if (!value) return '-'
  return String(value).slice(0, 10).replace(/-/g, '.')
}

const formatDateRange = (start, end) => {
  const formattedStart = formatDate(start)
  const formattedEnd = formatDate(end)
  if (formattedStart === '-' || formattedEnd === '-') return formattedStart
  if (formattedStart === formattedEnd) return formattedStart
  return `${formattedStart} ~ ${formattedEnd.slice(5)}`
}

const formatInputDate = (value) => {
  if (!value) return '-'
  const parts = String(value).slice(0, 10).split('-')
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : String(value)
}

export const mapAnalysisDocument = (item = {}) => ({
  ...item,
  analysisId: item.analysisId,
  festivalName: item.festivalName || '-',
  hostRegion: item.hostRegion || '-',
  festivalPeriod: formatDateRange(item.festivalStartDate, item.festivalEndDate),
  inputDate: formatInputDate(item.inputDate),
  status: item.status || DOCUMENT_STATUS.COMPLETED,
  overallScore: item.overallScore ?? null,
  recommendationCount: item.recommendationCount ?? null,
})
