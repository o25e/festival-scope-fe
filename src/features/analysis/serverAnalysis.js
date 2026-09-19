import { YEARS } from '../../data/prototype'

const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
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

export const mergeServerAnalysis = (baseAnalysis, summary, details = {}) => {
  const targetSummary = getItem(summary, 'TARGET_VISITOR')
  const trendSummary = getItem(summary, 'TREND_FIT')
  const targetDetail = details.TARGET_VISITOR || {}
  const trendDetail = details.TREND_FIT || {}
  const totalScore = Object.prototype.hasOwnProperty.call(summary || {}, 'totalScore')
    ? asNumber(summary.totalScore)
    : baseAnalysis.composite
  const targetScore = targetSummary ? getScore(targetDetail) ?? getScore(targetSummary) : null
  const trendScore = trendSummary ? getScore(trendDetail) ?? getScore(trendSummary) : null

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

  return {
    ...baseAnalysis,
    T: trendModel,
    composite: totalScore,
    grade: getGrade(totalScore) || baseAnalysis.grade,
    server: {
      analysisId: summary?.analysisId ?? null,
      festivalPlanId: summary?.festivalPlanId ?? null,
      festivalName: summary?.festivalName ?? null,
      analysisStatus: summary?.analysisStatus ?? null,
      createdAt: summary?.createdAt ?? null,
      items: {
        TARGET_VISITOR: targetSummary ? { summary: targetSummary, detail: targetDetail } : null,
        TREND_FIT: trendSummary ? { summary: trendSummary, detail: trendDetail } : null,
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
    },
  }
}

export const toNumber = asNumber
