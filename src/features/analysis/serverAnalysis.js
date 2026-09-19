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
  return { HIGH: 1, MEDIUM: 2, LOW: 3 }[String(value || '').toUpperCase()] || 3
}

const normalizeRecommendations = (detail) => {
  if (!Array.isArray(detail?.recommendations)) return null
  return detail.recommendations
    .slice()
    .sort((a, b) => (asNumber(a?.displayOrder) ?? 0) - (asNumber(b?.displayOrder) ?? 0))
    .map((item) => ({
      p: normalizePriority(item?.priority),
      t: item?.title || '-',
      d: item?.content || '-',
    }))
}

const normalizeAnalysisContent = (detail) => {
  const interpretation = detail?.resultInterpretation || {}
  return {
    summary: interpretation.summary || null,
    detail: interpretation.detail || null,
    recommendations: normalizeRecommendations(detail),
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
    ...(Array.isArray(detail?.topSimilarFestivals) ? detail.topSimilarFestivals : []),
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

const trendSeries = (values) => {
  if (!Array.isArray(values)) return []
  return toFivePointSeries(
    values
      .slice()
      .sort((a, b) => (a?.year ?? 0) - (b?.year ?? 0))
      .map((entry) => (typeof entry === 'object' ? firstValue(entry, ['interest', 'value']) : entry)),
  )
}

const trendRate = (value, series) => {
  const explicit = asNumber(value)
  if (explicit !== null) return Math.abs(explicit) > 1 ? explicit / 100 : explicit
  if (series.length < 2 || series[0] === 0) return null
  return Math.pow(series[series.length - 1] / series[0], 1 / 4) - 1
}

const trendDetails = (detail) => {
  const keywords = Array.isArray(detail?.keywords) ? detail.keywords : []
  return keywords
    .map((keyword) => {
      const series = trendSeries(keyword?.yearlyInterest)
      const rate = trendRate(keyword?.yearlyGrowthRate, series)
      const change = series.length > 1 ? series[series.length - 1] - series[0] : 0
      return {
        k: firstValue(keyword, ['keyword', 'name', 'title']) || '-',
        v: series,
        d: change > 12 ? '상승' : change < -12 ? '하락' : '유지',
        rate,
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

export const mergeServerAnalysis = (baseAnalysis, summary, details = {}) => {
  const targetSummary = getItem(summary, 'TARGET_VISITOR')
  const trendSummary = getItem(summary, 'TREND_FIT')
  const demandSummary = getItem(summary, 'DEMAND_FIT')
  const conflictSummary = getItem(summary, 'CONFLICT_RISK')
  const targetDetail = details.TARGET_VISITOR || {}
  const trendDetail = details.TREND_FIT || {}
  const demandDetail = details.DEMAND_FIT || {}
  const hasConflictDetail = Object.prototype.hasOwnProperty.call(details, 'CONFLICT_RISK') && details.CONFLICT_RISK !== null && details.CONFLICT_RISK !== undefined
  const conflictDetail = hasConflictDetail ? details.CONFLICT_RISK : null
  const conflict = hasConflictDetail ? normalizeConflictModel(baseAnalysis, conflictSummary, conflictDetail) : null
  const totalScore = Object.prototype.hasOwnProperty.call(summary || {}, 'totalScore')
    ? asNumber(summary.totalScore)
    : baseAnalysis.composite
  const targetScore = targetSummary ? getScore(targetDetail) ?? getScore(targetSummary) : null
  const trendScore = trendSummary ? getScore(trendDetail) ?? getScore(trendSummary) : null
  const demand = demandSummary
    ? demandModel(baseAnalysis, demandSummary, demandDetail)
    : { R: baseAnalysis.R, v: {} }

  const target = asNumber(targetDetail.targetVisitorCount) ?? baseAnalysis.p.target
  const median = asNumber(targetDetail.visitorMedian)
  const average = asNumber(targetDetail.visitorAverage)
  const maximum = asNumber(targetDetail.visitorMax)
  const records = visitorRecords(targetDetail)
  const visitorYearAverage = averageSeries(records, average)
  const ratio = target !== null && median ? target / median : null
  const visitorTop =
    maximum ??
    (records.length
      ? Math.max(...records.map((row) => row.series[row.series.length - 1]))
      : null)
  const simCagr =
    visitorYearAverage.length > 1 && visitorYearAverage[0]
      ? Math.pow(
          visitorYearAverage[visitorYearAverage.length - 1] / visitorYearAverage[0],
          1 / 4,
        ) - 1
      : 0
  const targetStatus =
    targetSummary?.status || (ratio === null ? '-' : ratio > 1.3 ? '다소 높음' : '적정 범위')

  const integratedTrend = trendDetail.integratedTrend || {}
  const series = trendSeries(integratedTrend.yearlyInterest)
  const trendRateValue = trendRate(integratedTrend.yearlyGrowthRate, series)
  const trendDetailRows = trendDetails(trendDetail)
  const trendStatus =
    trendSummary?.status ||
    (trendRateValue === null ? '-' : trendRateValue > 0.06 ? '상승' : trendRateValue > -0.03 ? '유지' : '하락')
  const trendModel = {
    ...baseAnalysis.T,
    series,
    detail: trendDetailRows,
    kw: trendDetailRows.map((row) => row.k).join(', '),
  }
  const analysisContent = {
    visitor: normalizeAnalysisContent(targetDetail),
    trend: normalizeAnalysisContent(trendDetail),
    demand: normalizeAnalysisContent(demandDetail),
    overlap: normalizeAnalysisContent(details.CONFLICT_RISK),
    weather: normalizeAnalysisContent(details.WEATHER_RISK),
    link: normalizeAnalysisContent(details.TOURISM_LINKAGE),
  }

  return {
    ...baseAnalysis,
    R: demand.R,
    T: trendModel,
    composite: totalScore,
    grade: getGrade(totalScore) || baseAnalysis.grade,
    analysisContent,
    server: {
      analysisId: summary?.analysisId ?? null,
      festivalPlanId: summary?.festivalPlanId ?? null,
      festivalName: summary?.festivalName ?? null,
      analysisStatus: summary?.analysisStatus ?? null,
      createdAt: summary?.createdAt ?? null,
      items: {
        TARGET_VISITOR: targetSummary ? { summary: targetSummary, detail: targetDetail } : null,
        TREND_FIT: trendSummary ? { summary: trendSummary, detail: trendDetail } : null,
      DEMAND_FIT: demandSummary ? { summary: demandSummary, detail: demandDetail } : null,
        CONFLICT_RISK: conflictSummary || hasConflictDetail ? { summary: conflictSummary, detail: conflictDetail } : null,
      },
    },
    v: {
      ...baseAnalysis.v,
      sims: records,
      median,
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
      tCagr: trendRateValue,
      s2: trendScore === null ? '-' : trendScore,
      v2: trendStatus,
      ...demand.v,
      ...(conflict || {}),
    },
  }
}

export const toNumber = asNumber
