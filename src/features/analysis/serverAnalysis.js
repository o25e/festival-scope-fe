import { YEARS } from '../../data/prototype'

const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatDemandNumber = (value) => {
  const number = asNumber(value)
  return number === null ? '-' : number.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

const firstValue = (value, keys) => {
  for (const key of keys) {
    if (value?.[key] !== null && value?.[key] !== undefined && value[key] !== '') {
      return value[key]
    }
  }
  return null
}

const getItem = (summary, itemType) =>
  Array.isArray(summary?.items)
    ? summary.items.find((item) => item?.itemType === itemType) || null
    : null

const getScore = (item) =>
  item && Object.prototype.hasOwnProperty.call(item, 'score')
    ? asNumber(item.score)
    : null

const normalizePriority = (value) => {
  const numeric = asNumber(value)
  if (numeric !== null) return numeric
  return {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    IMMEDIATE: 1,
    REVIEW: 2,
    OPTIONAL: 3,
  }[String(value || '').toUpperCase()] || 3
}

const normalizeReportPriority = (value) => {
  const numeric = asNumber(value)
  if (numeric !== null) return numeric
  return (
    {
      IMMEDIATE: 1,
      REVIEW: 2,
      OPTIONAL: 3,
    }[String(value || '').toUpperCase()] ?? normalizePriority(value)
  )
}

const normalizeRecommendations = (detail) => {
  if (!Array.isArray(detail?.recommendations)) return null
  return detail.recommendations
    .slice()
    .sort((a, b) => (asNumber(a?.displayOrder) ?? 0) - (asNumber(b?.displayOrder) ?? 0))
    .map((item) => ({
      p: normalizePriority(item?.priority),
      t: item?.title ?? '-',
      d: item?.content ?? '-',
    }))
}

const normalizeAnalysisContent = (detail) => {
  const interpretation = detail?.resultInterpretation || {}
  return {
    summary: interpretation.summary ?? null,
    detail: interpretation.detail ?? null,
    recommendations: normalizeRecommendations(detail),
  }
}

const REPORT_ITEM_TYPES = [
  'TARGET_VISITOR',
  'TREND_FIT',
  'DEMAND_FIT',
  'CONFLICT_RISK',
  'WEATHER_RISK',
  'TOURISM_LINKAGE',
]

const REPORT_ITEM_FIELDS = {
  TARGET_VISITOR: ['targetVisitor', 'targetVisitorAnalysis', 'targetVisitorResult', 'targetVisitorAnalysisResult', 'TARGET_VISITOR'],
  TREND_FIT: ['trendFit', 'trendFitAnalysis', 'trendFitResult', 'trendFitAnalysisResult', 'TREND_FIT'],
  DEMAND_FIT: ['demandFit', 'demandFitAnalysis', 'demandFitResult', 'demandFitAnalysisResult', 'DEMAND_FIT'],
  CONFLICT_RISK: ['conflictRisk', 'conflictRiskAnalysis', 'conflictRiskResult', 'conflictRiskAnalysisResult', 'CONFLICT_RISK'],
  WEATHER_RISK: ['weatherRisk', 'weatherRiskAnalysis', 'weatherRiskResult', 'weatherRiskAnalysisResult', 'WEATHER_RISK'],
  TOURISM_LINKAGE: ['tourismLinkage', 'tourismLinkageAnalysis', 'tourismLinkageResult', 'tourismLinkageAnalysisResult', 'TOURISM_LINKAGE'],
}

const reportOwnValue = (value, keys) => {
  if (!value || typeof value !== 'object') return undefined
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) return value[key]
  }
  return undefined
}

const reportRecordValue = (value, keys) => {
  const direct = reportOwnValue(value, keys)
  if (direct !== undefined) return direct
  const entries = value && typeof value === 'object' ? Object.entries(value) : []
  const normalizedKeys = keys.map((key) => key.toLowerCase())
  const entry = entries.find(([key]) => normalizedKeys.includes(key.toLowerCase()))
  return entry?.[1]
}

const unwrapReportDetail = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  if (value.detail !== null && value.detail !== undefined) return value.detail
  if (value.data && typeof value.data === 'object' && !Array.isArray(value.data)) return value.data
  return value
}

const normalizeReportRecommendations = (value) => {
  if (!Array.isArray(value)) return []
  return value
    .slice()
    .sort((a, b) => (asNumber(a?.displayOrder) ?? 0) - (asNumber(b?.displayOrder) ?? 0))
    .map((item) => ({
      itemType: item?.itemType ?? item?.analysisItemType ?? null,
      p: normalizeReportPriority(item?.priority ?? item?.priorityLevel),
      t: item?.title ?? item?.recommendationTitle ?? '-',
      d: item?.content ?? item?.description ?? item?.recommendationContent ?? '-',
      source: item?.source ?? item?.itemTitle ?? null,
      raw: item,
    }))
}

export const normalizeAnalysisReport = (response) => {
  const root = response?.summary
    ? response
    : response?.data?.summary
      ? response.data
      : response?.data && typeof response.data === 'object'
        ? response.data
        : response || {}
  const summary = root?.summary || {}
  const summaryItems = Array.isArray(summary.items) ? summary.items : []
  const items = Object.fromEntries(
    REPORT_ITEM_TYPES.map((itemType) => [
      itemType,
      summaryItems.find((item) => item?.itemType === itemType) || null,
    ]),
  )
  const details = {}
  const resultRows = [root?.analysisResults, root?.results, root?.itemResults].find((value) => Array.isArray(value)) || []
  REPORT_ITEM_TYPES.forEach((itemType) => {
    const candidates = [
      reportRecordValue(root, REPORT_ITEM_FIELDS[itemType]),
      reportRecordValue(root?.details, REPORT_ITEM_FIELDS[itemType]),
      reportRecordValue(root?.analyses, REPORT_ITEM_FIELDS[itemType]),
      resultRows.find((item) => item?.itemType === itemType),
    ]
    const detail = candidates.find((candidate) => candidate !== null && candidate !== undefined)
    if (detail !== undefined) details[itemType] = unwrapReportDetail(detail)
  })

  const summaryRecommendations = summaryItems.flatMap((item) =>
    Array.isArray(item?.recommendations)
      ? item.recommendations.map((recommendation) => ({
          ...recommendation,
          itemType: recommendation?.itemType ?? item.itemType,
        }))
      : [],
  )
  const recommendationValue = [
    root?.recommendations,
    root?.recommendationResults,
    root?.recommendationList,
    root?.modificationRecommendations,
    root?.recommendedActions,
    summaryRecommendations.length ? summaryRecommendations : undefined,
  ].find((value) => Array.isArray(value))
  const recommendations = normalizeReportRecommendations(recommendationValue)
  REPORT_ITEM_TYPES.forEach((itemType) => {
    const itemRecommendations = recommendations.filter((item) => item.itemType === itemType)
    if (!itemRecommendations.length) return
    details[itemType] = {
      ...(details[itemType] || {}),
      recommendations: itemRecommendations.map(({ raw, itemType: _itemType, ...item }) => ({
        priority: item.p,
        title: item.t,
        content: item.d,
        displayOrder: raw?.displayOrder,
      })),
    }
  })

  return {
    raw: root,
    summary,
    items,
    details,
    recommendations,
    hasRecommendations: Array.isArray(recommendationValue),
  }
}

const normalizeWeatherContent = (detail) => {
  const content = normalizeAnalysisContent(detail)
  if (!detail) return content
  return {
    summary: content.summary ?? '-',
    detail: content.detail ?? '-',
    recommendations: content.recommendations ?? [],
  }
}

const normalizePoiRange = (value) => {
  const range = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  return {
    totalCount: asNumber(range.totalCount),
    tourismCultureCount: asNumber(range.tourismCultureCount),
    foodShoppingCount: asNumber(range.foodShoppingCount),
    accommodationCount: asNumber(range.accommodationCount),
  }
}

const normalizePoi = (row, fallbackCategory = null) => {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null
  return {
    name: firstValue(row, ['poiName', 'placeName', 'name', 'title']),
    category: firstValue(row, ['category', 'poiCategory', 'type']) || fallbackCategory,
    distanceKm: asNumber(firstValue(row, ['distanceKm', 'distance'])),
    address: firstValue(row, ['address', 'roadAddress', 'jibunAddress']),
    poiType: row.poiType ?? null,
    linkageType: row.linkageType ?? null,
    distanceMeter: asNumber(row.distanceMeter),
    distanceRange: row.distanceRange ?? null,
    imageUrl: row.imageUrl ?? null,
    latitude: asNumber(row.latitude),
    longitude: asNumber(row.longitude),
  }
}

const normalizePoiList = (linkage) => {
  const groups = [
    { keys: ['tourismCulturePois', 'tourismCulturePoiList', 'tourismCulturePlaces', 'tourismCulture'], category: '관광·문화' },
    { keys: ['foodShoppingPois', 'foodShoppingPoiList', 'foodShoppingPlaces', 'foodShopping'], category: '음식·쇼핑' },
    { keys: ['accommodationPois', 'accommodationPoiList', 'accommodationPlaces', 'accommodation'], category: '숙박' },
    { keys: ['poiList', 'pois'], category: null },
  ]
  const result = []
  groups.forEach(({ keys, category }) => {
    const rows = arrayValue(linkage, keys)
    if (rows === undefined) return
    rows.forEach((row) => {
      const normalized = normalizePoi(row, category)
      if (normalized) result.push(normalized)
    })
  })
  return result
}

const normalizeRegionalIndicator = (value) => {
  const indicator = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  return {
    name: indicator.name ?? null,
    value: asNumber(indicator.value),
  }
}

const normalizeTourismLinkageModel = (summary, detail) => {
  const linkage = detail?.tourismLinkage && typeof detail.tourismLinkage === 'object'
    ? detail.tourismLinkage
    : {}
  const regionalIndicators = detail?.regionalIndicators && typeof detail.regionalIndicators === 'object'
    ? detail.regionalIndicators
    : linkage.regionalIndicators || {}
  const score = Object.prototype.hasOwnProperty.call(detail || {}, 'score')
    ? asNumber(detail.score)
    : getScore(summary)
  return {
    score,
    totalCandidatePoiCount: asNumber(linkage.totalCandidatePoiCount),
    tourismCultureCount: asNumber(linkage.tourismCultureCount),
    foodShoppingCount: asNumber(linkage.foodShoppingCount),
    accommodationCount: asNumber(linkage.accommodationCount),
    tourismLinkageSummary: linkage.tourismLinkageSummary ?? null,
    consumptionLinkageSummary: linkage.consumptionLinkageSummary ?? null,
    stayLinkageSummary: linkage.stayLinkageSummary ?? null,
    poiSummary: {
      within3km: normalizePoiRange(linkage.poiSummary?.within3km),
      between3And5km: normalizePoiRange(linkage.poiSummary?.between3And5km),
      within5km: normalizePoiRange(linkage.poiSummary?.within5km),
    },
    regionalIndicators: {
      resourceDemand: normalizeRegionalIndicator(regionalIndicators.resourceDemand),
      consumptionIntensity: normalizeRegionalIndicator(regionalIndicators.consumptionIntensity),
      stayIntensity: normalizeRegionalIndicator(regionalIndicators.stayIntensity),
    },
    pois: normalizePoiList(linkage),
  }
}

const ownValue = (value, keys) => {
  for (const key of keys) {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) return value[key]
  }
  return undefined
}

const arrayValue = (value, keys) => {
  const result = ownValue(value, keys)
  return Array.isArray(result) ? result : result === undefined ? undefined : []
}

const conflictPayload = (detail) => {
  const nested = ['conflictRisk', 'conflictAnalysis', 'overlap', 'conflict'].find(
    (key) => detail?.[key] && typeof detail[key] === 'object' && !Array.isArray(detail[key]),
  )
  return nested ? detail[nested] : detail
}

const conflictValue = (detail, payload, keys) => {
  const value = ownValue(detail, keys)
  return value !== undefined ? value : ownValue(payload, keys)
}

const parseApiDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value)
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null
}

const normalizeTimelineRange = (startValue, endValue, targetYear) => {
  const start = parseApiDate(startValue)
  const end = parseApiDate(endValue)
  if (!start || !end || !Number.isInteger(targetYear)) return { b1: start, b2: end }
  const b1 = new Date(targetYear, start.getMonth(), start.getDate())
  let b2 = new Date(targetYear, end.getMonth(), end.getDate())
  if (b2 < b1) b2 = new Date(targetYear + 1, end.getMonth(), end.getDate())
  return { b1, b2 }
}

const normalizeConflictLevel = (value, fallback = null) => {
  if (value === null) return null
  const normalized = String(value ?? '').trim().toUpperCase()
  return (
    {
      DIRECT: 'direct',
      DIRECT_OVERLAP: 'direct',
      OVERLAP: 'direct',
      PERIOD_OVERLAP: 'direct',
      NEAR: 'near',
      NEARBY_PERIOD: 'near',
      ADJACENT: 'near',
      ADJACENT_PERIOD: 'near',
      HISTORICAL_SAME_PERIOD: 'watch',
      WATCH: 'watch',
      WARNING: 'watch',
    }[normalized] || (value === '직접 중복' ? 'direct' : value === '인접' ? 'near' : fallback)
  )
}

const conflictTypeLabel = (value) =>
  ({
    HISTORICAL_SAME_PERIOD: '과거 동일 시기',
    DIRECT_OVERLAP: '기간 중복',
    NEARBY_PERIOD: '인접 시기',
    HISTORICAL: '과거 이력',
  })[String(value || '').trim().toUpperCase()] || null

const normalizeRiskStatus = (value) => {
  if (value === null) return null
  const normalized = String(value ?? '').trim().toUpperCase()
  return (
    {
      HIGH: '높음',
      MEDIUM: '보통',
      MODERATE: '보통',
      LOW: '낮음',
      NONE: '없음',
      SAFE: '낮음',
    }[normalized] || (value === undefined ? '-' : value || '-')
  )
}

const normalizeConflictEvent = (row, fallbackLevel = null, targetYear = null) => {
  const conflictType = firstValue(row, ['conflictType'])
  const eventBasis = firstValue(row, ['eventBasis'])
  const region = firstValue(row, ['region', 'hostRegion', 'location', 'locationName', 'area'])
  const sido = firstValue(row, ['sido'])
  const sigungu = firstValue(row, ['sigungu'])
  const typeLabel = conflictTypeLabel(conflictType) || conflictTypeLabel(eventBasis)
  const startDate = firstValue(row, ['startDate', 'eventStartDate', 'festivalStartDate', 'dateFrom', 'start'])
  const endDate = firstValue(row, ['endDate', 'eventEndDate', 'festivalEndDate', 'dateTo', 'end'])
  const timelineRange = normalizeTimelineRange(startDate, endDate, targetYear)
  const level = normalizeConflictLevel(
    ownValue(row, ['level', 'conflictLevel', 'overlapType', 'riskType', 'type', 'status', 'conflictType']),
    fallbackLevel,
  )
  return {
    n: firstValue(row, ['festivalName', 'festivalTitle', 'eventName', 'name', 'title']) || '-',
    reg: region || [sido, sigungu].filter(Boolean).join(' ') || '-',
    km: asNumber(firstValue(row, ['distanceKm', 'distance', 'km'])),
    scale: asNumber(firstValue(row, ['visitorCount', 'visitors', 'scale', 'expectedVisitors', 'capacity'])),
    held: asNumber(firstValue(row, ['heldCount', 'timesHeld', 'occurrenceCount', 'count'])),
    b1: timelineRange.b1,
    b2: timelineRange.b2,
    startDate,
    endDate,
    gap: asNumber(firstValue(row, ['gapDays', 'dateGap', 'gap'])),
    eventYear: asNumber(firstValue(row, ['eventYear', 'year', 'heldYear'])),
    eventBasis,
    conflictType,
    regionRelation: firstValue(row, ['regionRelation']),
    sameTheme: firstValue(row, ['sameTheme']),
    overlapDays: asNumber(firstValue(row, ['overlapDays'])),
    relation: firstValue(row, ['scheduleRelation', 'overlapRelation', 'relation']) || typeLabel,
    locationRelation: firstValue(row, ['locationRelation', 'venueRelation']),
    lv: level,
  }
}

const conflictEvents = (detail, targetYear = null) => {
  const payload = conflictPayload(detail)
  const directRows = arrayValue(detail, [
    'directOverlapEvents',
    'directOverlapFestivals',
    'directOverlaps',
    'directConflicts',
    'periodOverlapEvents',
    'overlappingEvents',
  ]) ?? arrayValue(payload, [
    'directOverlapEvents',
    'directOverlapFestivals',
    'directOverlaps',
    'directConflicts',
    'periodOverlapEvents',
    'overlappingEvents',
  ])
  const nearRows = arrayValue(detail, [
    'adjacentEvents',
    'nearbyEvents',
    'nearConflicts',
    'adjacentConflicts',
    'adjacentOverlapEvents',
    'nearbyOverlapFestivals',
    'adjacentOverlaps',
    'nearbyFestivals',
  ]) ?? arrayValue(payload, [
    'adjacentEvents',
    'nearbyEvents',
    'nearConflicts',
    'adjacentConflicts',
    'adjacentOverlapEvents',
    'nearbyOverlapFestivals',
    'adjacentOverlaps',
    'nearbyFestivals',
  ])
  if (directRows !== undefined || nearRows !== undefined) {
    return [
      ...(directRows || []).map((row) => normalizeConflictEvent(row, 'direct', targetYear)),
      ...(nearRows || []).map((row) => normalizeConflictEvent(row, 'near', targetYear)),
    ]
  }
  const rows = arrayValue(detail, ['conflictEvents', 'overlapEvents', 'conflicts', 'events']) ??
    arrayValue(payload, ['conflictEvents', 'overlapEvents', 'conflicts', 'events'])
  return rows === undefined ? null : rows.map((row) => normalizeConflictEvent(row, null, targetYear))
}

const conflictCount = (detail, keys, events, level) => {
  const explicit = conflictValue(detail, conflictPayload(detail), keys)
  if (explicit !== undefined) return asNumber(explicit)
  if (events !== null) return events.filter((event) => event.lv === level).length
  return null
}

const normalizeConflictModel = (baseAnalysis, summary, detail) => {
  const payload = conflictPayload(detail)
  const historyPeriod = conflictValue(detail, payload, ['historyPeriod'])
  const targetPeriod = conflictValue(detail, payload, ['targetPeriod'])
  const targetStartValue = firstValue(targetPeriod, ['startDate'])
  const targetEndValue = firstValue(targetPeriod, ['endDate'])
  const targetStart = parseApiDate(targetStartValue)
  const targetEnd = parseApiDate(targetEndValue)
  const targetYear = targetStart?.getFullYear() ?? parseApiDate(baseAnalysis?.p?.start)?.getFullYear() ?? null
  const events = conflictEvents(detail, targetYear)
  const directEvents = events?.filter((event) => event.lv === 'direct') || []
  const nearEvents = events?.filter((event) => event.lv === 'near') || []
  const scoreValue = conflictValue(detail, payload, ['score'])
  const score = scoreValue !== undefined ? asNumber(scoreValue) : getScore(summary)
  const statusValue = conflictValue(detail, payload, ['riskLevel', 'riskStatus', 'status', 'risk'])
  const status = normalizeRiskStatus(statusValue !== undefined ? statusValue : summary?.status)
  const periodValue = conflictValue(detail, payload, ['analysisPeriod', 'period', 'analyzedPeriod'])
  const periodObject = periodValue && typeof periodValue === 'object' ? periodValue : null
  const period = typeof periodValue === 'string' ? periodValue : null
  const historyStartYear = firstValue(historyPeriod, ['startYear'])
  const historyEndYear = firstValue(historyPeriod, ['endYear'])
  const periodStart = firstValue(detail, ['analysisStartDate', 'periodStartDate', 'startDate']) || firstValue(periodObject, ['startDate', 'from', 'start'])
  const periodEnd = firstValue(detail, ['analysisEndDate', 'periodEndDate', 'endDate']) || firstValue(periodObject, ['endDate', 'to', 'end'])
  const eventOverlapDays = events?.map((event) => event.overlapDays).filter((value) => value !== null && value !== undefined) || []
  const explicitOverlapDays = conflictValue(detail, payload, ['overlapDays', 'totalOverlapDays', 'conflictDays'])
  const overlapDays =
    explicitOverlapDays !== undefined
      ? asNumber(explicitOverlapDays)
      : eventOverlapDays.length === 1
        ? eventOverlapDays[0]
        : null
  return {
    s4: score,
    v4: status,
    nDirect: conflictCount(detail, ['directOverlapCount', 'directOverlapEventCount', 'directConflictCount', 'overlapEventCount'], events, 'direct'),
    nNear: conflictCount(detail, ['nearbyPeriodCount', 'adjacentEventCount', 'adjacentOverlapEventCount', 'nearbyEventCount', 'nearConflictCount'], events, 'near'),
    cf: events || [],
    overlapDays,
    stayPressure: asNumber(conflictValue(detail, payload, ['stayPressure', 'accommodationPressure'])),
    rivalStayDemand: asNumber(conflictValue(detail, payload, ['rivalStayDemand', 'competitorStayDemand'])),
    stayRooms: asNumber(conflictValue(detail, payload, ['stayRooms', 'availableRooms', 'accommodationRooms'])),
    analysisPeriod:
      period ||
      (historyStartYear !== null && historyStartYear !== undefined && historyEndYear !== null && historyEndYear !== undefined
        ? `${historyStartYear}~${historyEndYear}`
        : periodStart && periodEnd
          ? `${periodStart}~${periodEnd}`
          : null),
    analysisPeriodStart: periodStart,
    analysisPeriodEnd: periodEnd,
    historyPeriod: historyPeriod || null,
    targetPeriod: targetPeriod || null,
    targetPeriodStart: targetStart,
    targetPeriodEnd: targetEnd,
    historicalSamePeriodCount: asNumber(conflictValue(detail, payload, ['historicalSamePeriodCount'])),
    sameRegionCount: asNumber(conflictValue(detail, payload, ['sameRegionCount'])),
    directEvents,
    nearEvents,
    best: null,
  }
}

const getGrade = (score) => {
  if (score === null) return null
  if (score >= 85) return 'A'
  if (score >= 75) return 'B+'
  if (score >= 65) return 'B'
  if (score >= 55) return 'C'
  return 'D'
}

const toFivePointSeries = (values) => {
  const series = values.map(asNumber).filter((value) => value !== null)
  if (series.length >= YEARS.length) return series.slice(-YEARS.length)
  if (series.length === 1) return YEARS.map(() => series[0])
  if (series.length > 1) return [...Array(YEARS.length - series.length).fill(series[0]), ...series]
  return []
}

const visitorCount = (row) =>
  asNumber(firstValue(row, ['visitorCount', 'visitors', 'totalVisitors', 'count', 'value']))

const visitorSeries = (row) => {
  const values = firstValue(row, [
    'yearlyVisitors',
    'visitorHistory',
    'yearlyVisitorCounts',
    'series',
  ])
  if (Array.isArray(values)) {
    return toFivePointSeries(
      values.map((value) =>
        typeof value === 'object'
          ? firstValue(value, ['visitorCount', 'visitors', 'count', 'value'])
          : value,
      ),
    )
  }
  const count = visitorCount(row)
  return count === null ? [] : toFivePointSeries([count])
}

const visitorRecords = (detail) => {
  const rows = [
    ...(Array.isArray(detail?.sameFestivalHistories) ? detail.sameFestivalHistories : []),
  ]
  const grouped = new Map()

  rows.forEach((row, index) => {
    const name = firstValue(row, ['festivalName', 'name', 'title']) || `유사 축제 ${index + 1}`
    const current = grouped.get(name) || {
      n: name,
      reg: firstValue(row, ['region', 'hostRegion', 'location']) || '',
      days: asNumber(firstValue(row, ['days', 'durationDays'])) || 1,
      values: [],
      points: [],
    }
    const year = asNumber(firstValue(row, ['year', 'heldYear']))
    const count = visitorCount(row)
    if (year !== null && count !== null) current.points.push({ year, count })
    const series = visitorSeries(row)
    if (series.length) current.values.push(...series)
    grouped.set(name, current)
  })

  return [...grouped.values()]
    .map((row) => ({
      n: row.n,
      reg: row.reg,
      days: row.days,
      series: toFivePointSeries(
        row.points.length
          ? row.points.sort((a, b) => a.year - b.year).map((point) => point.count)
          : row.values,
      ),
    }))
    .filter((row) => row.series.length)
}

const averageSeries = (records, fallback) => {
  const values = YEARS.map((_, index) => {
    const points = records.map((record) => record.series[index]).filter((value) => value !== undefined)
    return points.length ? points.reduce((sum, value) => sum + value, 0) / points.length : null
  })
  return values.every((value) => value === null)
    ? fallback === null
      ? []
      : YEARS.map(() => fallback)
    : values.map((value) => value ?? fallback)
}

const normalizeTargetHistory = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      rank: asNumber(row?.rank),
      festivalId: asNumber(row?.festivalId),
      festivalHistoryId: asNumber(row?.festivalHistoryId),
      festivalName: firstValue(row, ['festivalName', 'name', 'title']) || '-',
      year: asNumber(row?.year),
      budget: asNumber(row?.budget),
      visitorCount: asNumber(row?.visitorCount),
    }))
    .filter((row) => row.year !== null)
    .sort((a, b) => a.year - b.year)

const normalizeTargetSimilarFestival = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      rank: asNumber(row?.rank),
      festivalName: firstValue(row, ['festivalName', 'name', 'title']) || '-',
      year: asNumber(row?.year),
      visitorCount: asNumber(row?.visitorCount),
      themeSimilarity: asNumber(row?.themeSimilarity),
      regionSimilarity: asNumber(row?.regionSimilarity),
      periodSimilarity: asNumber(row?.periodSimilarity),
      similarityScore: asNumber(row?.similarityScore),
    }))
    .filter((row) => row.festivalName !== '-')
    .sort((a, b) => {
      if (a.rank !== null && b.rank !== null) return a.rank - b.rank
      if (a.rank !== null) return -1
      if (b.rank !== null) return 1
      return 0
    })

const targetHistorySeries = (rows) => {
  const years = [...new Set(rows.map((row) => row.year).filter((year) => year !== null))].sort(
    (a, b) => a - b,
  )
  const byYear = new Map(rows.map((row) => [row.year, row.visitorCount]))
  return {
    years,
    values: years.map((year) => byYear.get(year) ?? null),
  }
}

const normalizeTrendInterest = (values) => {
  if (!Array.isArray(values)) return []
  return values
    .slice()
    .sort((a, b) => {
      const aYear = asNumber(a?.year)
      const bYear = asNumber(b?.year)
      if (aYear === null && bYear === null) return 0
      if (aYear === null) return 1
      if (bYear === null) return -1
      return aYear - bYear
    })
    .map((entry) => ({
      year: asNumber(entry?.year),
      interest: asNumber(firstValue(entry, ['interest', 'value'])),
    }))
}

const normalizeTrendGrowthRates = (values) => {
  if (!Array.isArray(values)) return []
  return values
    .slice()
    .sort((a, b) => {
      const aYear = asNumber(a?.toYear)
      const bYear = asNumber(b?.toYear)
      if (aYear === null && bYear === null) return 0
      if (aYear === null) return 1
      if (bYear === null) return -1
      return aYear - bYear
    })
    .map((entry) => ({
      fromYear: asNumber(entry?.fromYear),
      toYear: asNumber(entry?.toYear),
      rate: asNumber(entry?.rate),
    }))
}

const trendCagr = (points) => {
  if (!Array.isArray(points) || points.length < 2) return null
  const first = points[0]
  const latest = points[points.length - 1]
  if (first?.interest === null || latest?.interest === null || first?.interest === 0) return null
  const periods =
    first.year !== null && latest.year !== null
      ? latest.year - first.year
      : points.length - 1
  if (periods <= 0) return null
  const value = Math.pow(latest.interest / first.interest, 1 / periods) - 1
  return Number.isFinite(value) ? value : null
}

const trendDirectionFromInterestChange = (points) => {
  if (!Array.isArray(points) || points.length < 2) return '-'
  const first = points[0]?.interest
  const latest = points[points.length - 1]?.interest
  if (first === null || latest === null) return '-'
  const change = latest - first
  return change > 12 ? '상승' : change < -12 ? '하락' : '유지'
}

const normalizePreviousYearAroundEventPeriod = (values) => {
  if (!Array.isArray(values)) return []
  return values.map((entry) => ({
    keyword: firstValue(entry, ['keyword', 'name', 'title']) || null,
    monthlyInterest: Array.isArray(entry?.monthlyInterest)
      ? entry.monthlyInterest.map((row) => ({
          month: row?.month ?? null,
          interest: asNumber(row?.interest),
        }))
      : [],
  }))
}

const trendDetails = (detail) => {
  const keywords = Array.isArray(detail?.keywords) ? detail.keywords : []
  return keywords
    .map((keyword) => {
      const yearlyInterest = normalizeTrendInterest(keyword?.yearlyInterest)
      const yearlyGrowthRate = normalizeTrendGrowthRates(keyword?.yearlyGrowthRate)
      return {
        k: firstValue(keyword, ['keyword', 'name', 'title']) || '-',
        v: yearlyInterest.map((point) => point.interest),
        years: yearlyInterest.map((point) => point.year),
        yearlyInterest,
        yearlyGrowthRate,
        firstYear: yearlyInterest[0]?.year ?? null,
        latestYear: yearlyInterest[yearlyInterest.length - 1]?.year ?? null,
        firstInterest: yearlyInterest[0]?.interest ?? null,
        latestInterest: yearlyInterest[yearlyInterest.length - 1]?.interest ?? null,
        latestGrowthRate:
          yearlyGrowthRate.length > 0
            ? yearlyGrowthRate[yearlyGrowthRate.length - 1].rate
            : null,
        d: trendDirectionFromInterestChange(yearlyInterest),
        cagr: trendCagr(yearlyInterest),
      }
    })
    .filter((keyword) => keyword.v.length)
}

const demandModel = (baseAnalysis, summary, detail) => {
  const regionalDemand = detail?.regionalDemand || {}
  const seasonalDemand = detail?.seasonalDemand || {}
  const accessibility = detail?.accessibility || {}
  const bus = accessibility.bus || {}
  const rail = accessibility.rail || {}
  const parking = accessibility.parking || {}
  const monthlyRows = Array.isArray(seasonalDemand.monthlyAverage)
    ? seasonalDemand.monthlyAverage
    : []
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const row = monthlyRows.find((candidate) => asNumber(candidate?.month) === index + 1)
    return row ? asNumber(row.visitorAverage) : null
  })
  const eventMonth = asNumber(seasonalDemand.eventMonth)
  const eventMonthAverage =
    asNumber(seasonalDemand.eventMonthAverage) ??
    asNumber(monthlyRows.find((row) => asNumber(row?.month) === eventMonth)?.visitorAverage)
  const monthlyRank = asNumber(seasonalDemand.eventMonthRank)
  const eventMonthPercentile = asNumber(seasonalDemand.eventMonthPercentile)
  const regionalVisitorCount = asNumber(regionalDemand.visitorCount)
  const regionalAverage = asNumber(regionalDemand.comparisonAverage)
  const regionalMedian = asNumber(regionalDemand.comparisonMedian)
  const score = getScore(detail) ?? getScore(summary)
  const status = summary?.status || detail?.status || '-'
  const recommendedWeek = asNumber(seasonalDemand.recommendedWeek)
  const weeklyDemandRows = (Array.isArray(seasonalDemand.weeklyDemand)
    ? seasonalDemand.weeklyDemand
    : [])
    .map((row, index) => {
      const week = asNumber(firstValue(row, ['week', 'weekNumber']))
      const startDay = firstValue(row, ['startDay'])
      const endDay = firstValue(row, ['endDay'])
      return {
        label: firstValue(row, ['label', 'weekLabel']) || `${week ?? index + 1}주차`,
        range:
          firstValue(row, ['range', 'dateRange', 'period']) ||
          (startDay !== null && endDay !== null ? `${startDay}일~${endDay}일` : ''),
        value: asNumber(
          firstValue(row, ['averageDailyVisitors', 'visitorAverage', 'visitorCount', 'value']),
        ),
        rank: asNumber(firstValue(row, ['rank'])),
        highlight: recommendedWeek !== null && week === recommendedWeek,
      }
    })
    .filter((row) => row.value !== null)
  const weeklyVisitorPeak = weeklyDemandRows.reduce((peak, row) => {
    if (!peak) return row
    if (row.rank !== null && peak.rank !== null) return row.rank < peak.rank ? row : peak
    if (row.rank !== null) return row
    if (peak.rank !== null) return peak
    return row.value > peak.value ? row : peak
  }, null)
  return {
    R: {
      ...baseAnalysis.R,
      name: regionalDemand.region || '-',
      monthly,
      eventMonth,
      baseDemand: regionalVisitorCount,
      baseDemandUnit: '명',
      annual: regionalDemand.totalRegions ? `${regionalDemand.totalRegions}개 권역 비교` : '-',
      baseNote:
        regionalAverage === null && regionalMedian === null
          ? '-'
          : `비교 권역 평균 ${formatDemandNumber(regionalAverage)}명 · 중앙값 ${formatDemandNumber(regionalMedian)}명`,
      comparisonAverage: regionalAverage,
      comparisonMedian: regionalMedian,
      access: {
        station: rail.nearestStationName ?? null,
        stationDistanceM: asNumber(rail.nearestStationDistanceM),
        stationLines: Array.isArray(rail.nearestStationLines) ? rail.nearestStationLines : null,
        stationsWithin1Km: asNumber(rail.stationsWithin1Km),
        nearbyStations: Array.isArray(rail.nearbyStations) ? rail.nearbyStations : null,
        stopCount500m: asNumber(bus.stopCount500m),
        stopCount1km: asNumber(bus.stopCount1km),
        routeCount: asNumber(bus.routeCount),
        nearestStopName: bus.nearestStopName ?? null,
        nearestStopDistanceM: asNumber(bus.nearestStopDistanceM),
        parkingCount: asNumber(parking.parkingCount),
        parkingCapacity: asNumber(parking.parkingCapacity),
        transitScore: '-',
        transitNote: `버스 ${asNumber(bus.stopCount500m) ?? '-'}개(500m) · 노선 ${asNumber(bus.routeCount) ?? '-'}개`,
        parkingSummary:
          asNumber(parking.parkingCount) === null
            ? '-'
            : `주차장 ${asNumber(parking.parkingCount)}곳`,
      },
      weeklyVisitorData: weeklyDemandRows,
      weeklyVisitorPeak,
      weeklyDemandUnit: '명',
      weeklyDemandBasis: `${regionalDemand.region || '-'} · ${eventMonth ?? '-'}월 기준`,
      recommendedWeek,
      parkingBasis: '※ 서버가 제공한 주차장 수와 주차 수용면수입니다.',
    },
    v: {
      s3: score === null ? '-' : score,
      v3: status,
      mIdx: eventMonthAverage,
      mRank: monthlyRank,
      mPercentile: eventMonthPercentile,
      accScore: '-',
      regionalVisitorCount: asNumber(regionalDemand.visitorCount),
      regionalRank: asNumber(regionalDemand.rank),
      regionalTotal: asNumber(regionalDemand.totalRegions),
      regionalPercentile: asNumber(regionalDemand.percentile),
    },
  }
}

const weatherModel = (baseAnalysis, detail) => {
  const station = detail?.station && typeof detail.station === 'object' ? detail.station : {}
  const period =
    detail?.analysisPeriod && typeof detail.analysisPeriod === 'object'
      ? detail.analysisPeriod
      : {}
  const rain = detail?.rain && typeof detail.rain === 'object' ? detail.rain : {}
  const temperature =
    detail?.temperature && typeof detail.temperature === 'object' ? detail.temperature : {}
  const score = Object.prototype.hasOwnProperty.call(detail || {}, 'score')
    ? asNumber(detail.score)
    : null
  const occurrenceYears = asNumber(rain.occurrenceYears)
  const rainDays = asNumber(rain.rainDays)
  const actualYears = asNumber(period.actualYears)
  const weatherMonthlyRain = Array.isArray(detail?.monthlyRainOccurrenceRates)
    ? detail.monthlyRainOccurrenceRates.map((row) => asNumber(row?.occurrenceRate))
    : null
  const weatherValues = {
    occurrenceYears,
    occurrenceRate: asNumber(rain.occurrenceRate),
    validDays: asNumber(rain.validDays),
    rainDays,
    rainDayRate: asNumber(rain.rainDayRate),
    averageRainfallMm: asNumber(rain.averageRainfallMm),
    averageTemperature: asNumber(temperature.averageTemperature),
    averageMaxTemperature: asNumber(temperature.averageMaxTemperature),
    averageMinTemperature: asNumber(temperature.averageMinTemperature),
    temperatureValidDays: asNumber(temperature.validDays),
    hotOccurrenceYears: asNumber(temperature.hotOccurrenceYears),
    hotOccurrenceRate: asNumber(temperature.hotOccurrenceRate),
    coldOccurrenceYears: asNumber(temperature.coldOccurrenceYears),
    coldOccurrenceRate: asNumber(temperature.coldOccurrenceRate),
    windValidDays: asNumber(detail?.wind?.validDays),
    averageWindSpeed: asNumber(detail?.wind?.averageWindSpeed),
    maxWindSpeed: asNumber(detail?.wind?.maxWindSpeed),
    strongWindOccurrenceYears: asNumber(detail?.wind?.strongWindOccurrenceYears),
    strongWindOccurrenceRate: asNumber(detail?.wind?.strongWindOccurrenceRate),
    strongWindDays: asNumber(detail?.wind?.strongWindDays),
    strongWindDayRate: asNumber(detail?.wind?.strongWindDayRate),
  }

  const display = (value, suffix = '') =>
    value === null || value === undefined ? '-' : `${value}${suffix}`
  const isMissing = (value) => value === null || value === undefined
  const coldHistory =
    weatherValues.coldOccurrenceYears === 0 && weatherValues.coldOccurrenceRate === 0
      ? ''
      : isMissing(weatherValues.coldOccurrenceYears) && isMissing(weatherValues.coldOccurrenceRate)
        ? '한파 데이터 없음'
        : `한파 ${display(weatherValues.coldOccurrenceYears, '년')}(${display(weatherValues.coldOccurrenceRate, '%')})`
  const strongWindHistory =
    weatherValues.strongWindOccurrenceYears === 0 && weatherValues.strongWindDays === 0
      ? `최근 ${display(actualYears, '년')}간 강풍 발생 없음`
      : isMissing(weatherValues.strongWindOccurrenceYears) &&
          isMissing(weatherValues.strongWindOccurrenceRate) &&
          isMissing(weatherValues.strongWindDays) &&
          isMissing(weatherValues.strongWindDayRate)
        ? '강풍 발생 데이터 없음'
        : `강풍 ${display(weatherValues.strongWindOccurrenceYears, '년')}(${display(weatherValues.strongWindOccurrenceRate, '%')}) · 강풍일 ${display(weatherValues.strongWindDays, '일')}(${display(weatherValues.strongWindDayRate, '%')})`
  const wFlags = [
    {
      t: '강수',
      p: `최근 ${display(actualYears, '년')} 중 ${display(occurrenceYears, '년')}`,
      d: `최근 ${display(actualYears, '년')} 중 ${display(occurrenceYears, '년')} 강수 발생(${display(weatherValues.occurrenceRate, '%')}) · 관측 ${display(weatherValues.validDays, '일')} 중 강수 ${display(rainDays, '일')}(${display(weatherValues.rainDayRate, '%')}) · 평균 강수량 ${display(weatherValues.averageRainfallMm, 'mm')}`,
      risk: null,
      status: null,
    },
    {
      t: '기온',
      p: `유효 관측일 ${display(weatherValues.temperatureValidDays, '일')}`,
      d: `평균 ${display(weatherValues.averageTemperature, '℃')} · 최고 ${display(weatherValues.averageMaxTemperature, '℃')} · 최저 ${display(weatherValues.averageMinTemperature, '℃')} · 최근 ${display(actualYears, '년')} 중 고온 ${display(weatherValues.hotOccurrenceYears, '년')}(${display(weatherValues.hotOccurrenceRate, '%')})${coldHistory ? ` · ${coldHistory}` : ''}`,
      risk: null,
      status: null,
    },
    {
      t: '강풍',
      p: `유효 관측일 ${display(weatherValues.windValidDays, '일')}`,
      d: `평균 풍속 ${display(weatherValues.averageWindSpeed, 'm/s')} · 최대 ${display(weatherValues.maxWindSpeed, 'm/s')} · ${strongWindHistory}`,
      risk: null,
      status: null,
    },
  ]

  return {
    R: {
      ...baseAnalysis.R,
      weather: {
        station,
        analysisPeriod: period,
        festivalCondition: detail?.festivalCondition || null,
        weatherMonthlyRain,
        occurrenceYears,
        actualYears,
        ...weatherValues,
        rainYears: [],
        heavyYears: [],
        note: `${display(station.stationId)} · ${station.stationName || '-'}(${display(station.distanceKm, 'km')}) · 요청 ${display(period.requestedYears, '년')} · 실제 ${display(actualYears, '년')} · ${display(period.startYear)}~${display(period.endYear)}년 · 총 ${display(period.totalDays, '일')}${weatherMonthlyRain === null ? ' · 월별 데이터 없음' : ''}`,
      },
    },
    v: {
      wRisk: score,
      v5: null,
      rainP: weatherValues.occurrenceRate,
      rainOccurrenceYears: occurrenceYears,
      rainValidDays: weatherValues.validDays,
      rainDays,
      rainDayRate: weatherValues.rainDayRate,
      averageRainfallMm: weatherValues.averageRainfallMm,
      averageTemperature: weatherValues.averageTemperature,
      averageMaxTemperature: weatherValues.averageMaxTemperature,
      averageMinTemperature: weatherValues.averageMinTemperature,
      temperatureValidDays: weatherValues.temperatureValidDays,
      hotOccurrenceYears: weatherValues.hotOccurrenceYears,
      hotOccurrenceRate: weatherValues.hotOccurrenceRate,
      coldOccurrenceYears: weatherValues.coldOccurrenceYears,
      coldOccurrenceRate: weatherValues.coldOccurrenceRate,
      windValidDays: weatherValues.windValidDays,
      averageWindSpeed: weatherValues.averageWindSpeed,
      maxWindSpeed: weatherValues.maxWindSpeed,
      strongWindOccurrenceYears: weatherValues.strongWindOccurrenceYears,
      strongWindOccurrenceRate: weatherValues.strongWindOccurrenceRate,
      strongWindDays: weatherValues.strongWindDays,
      strongWindDayRate: weatherValues.strongWindDayRate,
      weatherStation: station,
      weatherAnalysisPeriod: period,
      wFlags,
    },
  }
}

export const mergeServerAnalysis = (baseAnalysis, summary, details = {}, report = null) => {
  const targetSummary = getItem(summary, 'TARGET_VISITOR')
  const trendSummary = getItem(summary, 'TREND_FIT')
  const demandSummary = getItem(summary, 'DEMAND_FIT')
  const conflictSummary = getItem(summary, 'CONFLICT_RISK')
  const weatherSummary = getItem(summary, 'WEATHER_RISK')
  const linkageSummary = getItem(summary, 'TOURISM_LINKAGE')
  const hasTargetDetail =
    Object.prototype.hasOwnProperty.call(details, 'TARGET_VISITOR') &&
    details.TARGET_VISITOR !== null &&
    details.TARGET_VISITOR !== undefined
  const targetDetail = hasTargetDetail ? details.TARGET_VISITOR : null
  const targetVisitor =
    targetDetail?.targetVisitor && typeof targetDetail.targetVisitor === 'object'
      ? targetDetail.targetVisitor
      : null
  const trendDetail = details.TREND_FIT || {}
  const demandDetail = details.DEMAND_FIT || {}
  const hasWeatherDetail = Object.prototype.hasOwnProperty.call(details, 'WEATHER_RISK') && details.WEATHER_RISK !== null && details.WEATHER_RISK !== undefined
  const weatherDetail = hasWeatherDetail ? details.WEATHER_RISK : null
  const hasConflictDetail = Object.prototype.hasOwnProperty.call(details, 'CONFLICT_RISK') && details.CONFLICT_RISK !== null && details.CONFLICT_RISK !== undefined
  const conflictDetail = hasConflictDetail ? details.CONFLICT_RISK : null
  const hasLinkageDetail = Object.prototype.hasOwnProperty.call(details, 'TOURISM_LINKAGE') && details.TOURISM_LINKAGE !== null && details.TOURISM_LINKAGE !== undefined
  const linkageDetail = hasLinkageDetail ? details.TOURISM_LINKAGE : null
  const linkage = hasLinkageDetail ? normalizeTourismLinkageModel(linkageSummary, linkageDetail) : null
  const conflict = hasConflictDetail ? normalizeConflictModel(baseAnalysis, conflictSummary, conflictDetail) : null
  const totalScore = Object.prototype.hasOwnProperty.call(summary || {}, 'totalScore')
    ? asNumber(summary.totalScore)
    : baseAnalysis.composite
  const targetScore = targetSummary ? getScore(targetDetail) ?? getScore(targetSummary) : null
  const trendScore = trendSummary ? getScore(trendDetail) ?? getScore(trendSummary) : null
  const demand = demandSummary
    ? demandModel(baseAnalysis, demandSummary, demandDetail)
    : { R: baseAnalysis.R, v: {} }
  const weather = hasWeatherDetail
    ? weatherModel({ ...baseAnalysis, R: demand.R }, weatherDetail)
    : null

  const target = hasTargetDetail
    ? asNumber(targetVisitor?.targetVisitorCount)
    : baseAnalysis.p.target
  const median = hasTargetDetail ? asNumber(targetVisitor?.visitorMedian) : baseAnalysis.v.median
  const average = hasTargetDetail ? asNumber(targetVisitor?.visitorAverage) : baseAnalysis.v.avg
  const minimum = hasTargetDetail ? asNumber(targetVisitor?.visitorMin) : null
  const maximum = hasTargetDetail ? asNumber(targetVisitor?.visitorMax) : baseAnalysis.v.top
  const gapRate = hasTargetDetail
    ? asNumber(targetVisitor?.gapRate)
    : target !== null && median !== null && median !== 0
      ? target / median - 1
      : null
  const similarityThreshold = hasTargetDetail
    ? asNumber(targetVisitor?.similarityThreshold)
    : null
  const similarFestivalCount = hasTargetDetail
    ? asNumber(targetVisitor?.similarFestivalCount)
    : null
  const visitorDataCount = hasTargetDetail ? asNumber(targetVisitor?.visitorDataCount) : null
  const sameFestivalHistories = hasTargetDetail
    ? normalizeTargetHistory(targetVisitor?.sameFestivalHistories)
    : []
  const topSimilarFestivals = hasTargetDetail
    ? normalizeTargetSimilarFestival(targetVisitor?.topSimilarFestivals)
    : []
  const historySeries = hasTargetDetail
    ? targetHistorySeries(sameFestivalHistories)
    : { years: YEARS, values: baseAnalysis.v.yearAvg }
  const records = hasTargetDetail ? [] : baseAnalysis.v.sims
  const visitorYearAverage = historySeries.values
  const ratio = target !== null && median !== null && median !== 0 ? target / median : null
  const visitorTop = maximum
  const simCagr = hasTargetDetail ? null : baseAnalysis.v.simCagr
  const targetStatus =
    targetSummary?.status || (ratio === null ? '-' : ratio > 1.3 ? '다소 높음' : '적정 범위')

  const integratedTrend = trendDetail.integratedTrend || {}
  const yearlyInterest = normalizeTrendInterest(integratedTrend.yearlyInterest)
  const yearlyGrowthRate = normalizeTrendGrowthRates(integratedTrend.yearlyGrowthRate)
  const series = yearlyInterest.map((point) => point.interest)
  const years = yearlyInterest.map((point) => point.year)
  const trendCagrValue = trendCagr(yearlyInterest)
  const latestGrowthRate =
    yearlyGrowthRate.length > 0
      ? yearlyGrowthRate[yearlyGrowthRate.length - 1].rate
      : null
  const trendDetailRows = trendDetails(trendDetail)
  const trendStatus =
    trendSummary?.status ||
    (trendCagrValue === null ? '-' : trendCagrValue > 0.06 ? '상승' : trendCagrValue > -0.03 ? '유지' : '하락')
  const trendModel = {
    ...baseAnalysis.T,
    years,
    series,
    yearlyInterest,
    yearlyGrowthRate,
    firstYear: years[0] ?? null,
    latestYear: years[years.length - 1] ?? null,
    firstInterest: series[0] ?? null,
    latestInterest: series[series.length - 1] ?? null,
    latestGrowthRate,
    previousYearAroundEventPeriod: normalizePreviousYearAroundEventPeriod(
      trendDetail.previousYearAroundEventPeriod,
    ),
    detail: trendDetailRows,
    kw: trendDetailRows.map((row) => row.k).join(', '),
  }
  const analysisContent = {
    visitor: normalizeAnalysisContent(targetDetail),
    trend: normalizeAnalysisContent(trendDetail),
    demand: normalizeAnalysisContent(demandDetail),
    overlap: normalizeAnalysisContent(details.CONFLICT_RISK),
    weather: hasWeatherDetail
      ? normalizeWeatherContent(weatherDetail)
      : normalizeAnalysisContent(details.WEATHER_RISK),
    link: normalizeAnalysisContent(details.TOURISM_LINKAGE),
  }

  const festivalName = summary?.festivalName ?? baseAnalysis.p?.name
  return {
    ...baseAnalysis,
    p: {
      ...baseAnalysis.p,
      name: festivalName,
      planName: festivalName,
    },
    R: weather?.R || demand.R,
    T: trendModel,
    composite: totalScore,
    grade: summary?.scoreGrade ?? getGrade(totalScore) ?? baseAnalysis.grade,
    analysisContent,
    report,
    server: {
      analysisId: summary?.analysisId ?? null,
      festivalPlanId: summary?.festivalPlanId ?? null,
      festivalName: summary?.festivalName ?? null,
      scoreGrade: summary?.scoreGrade ?? null,
      analysisStatus: summary?.analysisStatus ?? null,
      createdAt: summary?.createdAt ?? null,
      items: {
        TARGET_VISITOR: targetSummary ? { summary: targetSummary, detail: targetDetail } : null,
        TREND_FIT: trendSummary ? { summary: trendSummary, detail: trendDetail } : null,
      DEMAND_FIT: demandSummary ? { summary: demandSummary, detail: demandDetail } : null,
        CONFLICT_RISK: conflictSummary || hasConflictDetail ? { summary: conflictSummary, detail: conflictDetail } : null,
        WEATHER_RISK: weatherSummary || hasWeatherDetail ? { summary: weatherSummary, detail: weatherDetail } : null,
        TOURISM_LINKAGE: linkageSummary || hasLinkageDetail ? { summary: linkageSummary, detail: linkageDetail } : null,
      },
    },
    linkage,
    v: {
      ...baseAnalysis.v,
      sims: records,
      targetSource: hasTargetDetail ? 'server' : 'prototype',
      targetVisitorCount: target,
      similarFestivalCount,
      visitorDataCount,
      visitorAverage: average,
      median,
      visitorMin: minimum,
      visitorMax: maximum,
      gapRate,
      similarityThreshold,
      sameFestivalHistories,
      topSimilarFestivals,
      sameFestivalYears: historySeries.years,
      sameFestivalSeries: historySeries.values,
      avg: average,
      top: visitorTop,
      ratio,
      yearAvg: visitorYearAverage,
      simCagr,
      s1: targetScore === null ? '-' : targetScore,
      v1: targetStatus,
      rec1: {
        first: median === null ? null : Math.round((median * 1.1) / 5000) * 5000,
        stretch: visitorTop === null ? null : Math.round((visitorTop * 1.15) / 5000) * 5000,
      },
      tCagr: trendCagrValue,
      s2: trendScore === null ? '-' : trendScore,
      v2: trendStatus,
      ...demand.v,
      ...(conflict || {}),
      ...(weather?.v || {}),
      ...(linkage ? { s6: linkage.score, v6: null } : {}),
    },
  }
}

export const mergeAnalysisReport = (baseAnalysis, response) => {
  const report = normalizeAnalysisReport(response)
  return mergeServerAnalysis(baseAnalysis, report.summary, report.details, report)
}

export const toNumber = asNumber
