import {
  FESTIVAL_TYPES,
  getFestivalTopics,
  getRegionOption,
  getRegionParts,
  PROGRAMS,
} from '../../data/prototype'

const EVENT_TYPE_BY_STATUS = {
  EXISTING: 'existing',
  NEW: 'new',
}

const VENUE_TYPE_BY_API_VALUE = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  MIXED: 'mixed',
}

const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

const nonEmptyText = (value) => {
  const text = normalize(value)
  return text || null
}

const REGION_SIDO_ALIASES = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원도: '강원',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전라북도: '전북',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
}

const finiteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const normalizedValue = typeof value === 'string'
    ? value.trim().replaceAll(',', '').replace(/명$/, '')
    : value
  const number = Number(normalizedValue)
  return Number.isFinite(number) ? number : null
}

const getParsedRegionParts = (parsed) => {
  const regionValue =
    parsed.region && typeof parsed.region === 'object' ? parsed.region : {}
  let sido = parsed.sido ?? parsed.province ?? regionValue.sido
  let sigungu =
    parsed.sigungu ?? parsed.cityCounty ?? parsed.county ?? regionValue.sigungu
  const fallback = nonEmptyText(parsed.regionName) ||
    (typeof parsed.region === 'string' ? nonEmptyText(parsed.region) : null)
  if ((!sido || !sigungu) && fallback) {
    const [fallbackSido, ...fallbackSigunguParts] = fallback.split(' ')
    sido = sido || fallbackSido
    sigungu = sigungu || fallbackSigunguParts.join(' ')
  }
  sido = normalize(sido)
  sigungu = normalize(sigungu)
  const canonicalSido = REGION_SIDO_ALIASES[sido] || sido

  const knownRegion = getRegionOption(canonicalSido, sigungu)
  return knownRegion
    ? { sido: knownRegion.sido, sigungu: knownRegion.sigungu }
    : { sido: sido || null, sigungu: sigungu || null }
}

const getThemePair = (code) => {
  const topicCode = normalize(code)
  if (!topicCode) return null

  const typeEntry = Object.entries(FESTIVAL_TYPES).find(([, type]) =>
    type.topics.some((topic) => topic.code === topicCode),
  )
  if (!typeEntry || !getFestivalTopics(typeEntry[0]).some((topic) => topic.code === topicCode)) {
    return null
  }

  return { type: typeEntry[0], topic: topicCode }
}

const getProgramIds = (programNames) => {
  if (!Array.isArray(programNames)) return []
  const parsedNames = new Set(
    programNames.map(normalize).filter(Boolean),
  )
  return PROGRAMS.filter((program) => parsedNames.has(normalize(program.n))).map(
    (program) => program.id,
  )
}

const hasResolvedCoordinates = (location) =>
  location &&
  Number.isFinite(Number(location.latitude)) &&
  Number.isFinite(Number(location.longitude))

const buildVenueLocation = (plan, parsed, patch) => {
  const address = nonEmptyText(parsed.venueAddress)
  const latitude = finiteNumber(parsed.latitude)
  const longitude = finiteNumber(parsed.longitude)
  const hasLocationValue = address || latitude !== null || longitude !== null
  if (!hasLocationValue) return null

  const parsedVenueName = nonEmptyText(parsed.venueName)
  const previous = plan.venueLocation || {}
  const name = parsedVenueName || previous.name || plan.venue
  const location = {
    ...previous,
    ...(name ? { name } : {}),
    ...(address ? { address } : {}),
    ...(latitude !== null
      ? { latitude, lat: latitude }
      : {}),
    ...(longitude !== null
      ? { longitude, lon: longitude }
      : {}),
    sido: patch.sido || plan.sido,
    sigungu: patch.sigungu || plan.sigungu,
  }
  delete location.regionKey

  if (location.name && location.address) {
    location.mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
      `${location.name} ${location.address}`,
    )}`
  }

  return location
}

export function normalizeFestivalPlan(plan = {}) {
  const legacyRegionParts = getRegionParts(plan.region)
  const parsedRegionParts = getParsedRegionParts({ region: plan.region })
  const maxCapacity =
    plan.maxCapacity ?? finiteNumber(plan.venueCapacity) ?? null
  const next = {
    ...plan,
    sido: plan.sido || legacyRegionParts?.sido || parsedRegionParts.sido || '',
    sigungu:
      plan.sigungu || legacyRegionParts?.sigungu || parsedRegionParts.sigungu || '',
    maxCapacity,
  }

  if (next.venueLocation) {
    next.venueLocation = {
      ...next.venueLocation,
      sido: next.venueLocation.sido || next.sido,
      sigungu: next.venueLocation.sigungu || next.sigungu,
    }
    delete next.venueLocation.regionKey
  }

  delete next.region
  delete next.venueCapacity
  return next
}

export function mergeParsedFestivalPlan(plan, response) {
  const parsed = response?.data && typeof response.data === 'object'
    ? response.data
    : response
  if (!parsed || typeof parsed !== 'object') return { plan, hasValues: false }

  const basePlan = normalizeFestivalPlan(plan)
  const patch = {}
  const planName = nonEmptyText(parsed.planName)
  const festivalName = nonEmptyText(parsed.festivalName)
  const startDate = nonEmptyText(parsed.startDate)
  const endDate = nonEmptyText(parsed.endDate)
  const venueName = nonEmptyText(parsed.venueName)
  const targetVisitorCount = finiteNumber(parsed.targetVisitorCount)
  const capacity = finiteNumber(
    parsed.capacity ?? parsed.maxCapacity ?? parsed.maximumCapacity ?? parsed.venueCapacity,
  )
  const firstHeldYear = finiteNumber(parsed.firstHeldYear)

  if (planName) patch.planName = planName
  if (festivalName) patch.name = festivalName
  if (startDate) patch.start = startDate
  if (endDate) patch.end = endDate
  if (venueName) patch.venue = venueName
  if (targetVisitorCount !== null && targetVisitorCount >= 0)
    patch.target = targetVisitorCount
  if (capacity !== null && capacity >= 0) patch.maxCapacity = capacity

  const eventType = EVENT_TYPE_BY_STATUS[normalize(parsed.festivalStatus)]
  if (eventType) patch.eventType = eventType
  if (
    eventType === 'existing' &&
    firstHeldYear !== null &&
    Number.isInteger(firstHeldYear) &&
    firstHeldYear > 0
  ) {
    patch.firstHeldYear = firstHeldYear
  }

  const venueType = VENUE_TYPE_BY_API_VALUE[normalize(parsed.venueType)]
  if (venueType) patch.venueType = venueType

  const { sido, sigungu } = getParsedRegionParts(parsed)
  if (sido) patch.sido = sido
  if (sigungu) patch.sigungu = sigungu
  if (sido && sigungu) patch.org = `${sido} ${sigungu}`
  else if (sido && basePlan.sido !== sido) patch.sigungu = ''

  const themePairs = Array.isArray(parsed.themes)
    ? parsed.themes.map((theme) => getThemePair(theme?.code)).filter(Boolean)
    : []
  if (themePairs.length) patch.festivalThemes = themePairs.slice(0, 2)

  const programIds = getProgramIds(parsed.programNames)
  if (programIds.length) patch.programs = programIds

  const venueLocation = buildVenueLocation(basePlan, parsed, patch)
  if (venueLocation) patch.venueLocation = venueLocation

  return {
    plan: { ...basePlan, ...patch },
    hasValues: Object.keys(patch).length > 0,
    appliedFields: Object.keys(patch),
    autoFilledFields: Object.fromEntries(
      Object.keys(patch).map((field) => [field, true]),
    ),
  }
}

export const isResolvedVenueLocation = (location, venue, region) =>
  normalize(location?.name) === normalize(venue) &&
  normalize(location?.sido) === normalize(region?.sido) &&
  normalize(location?.sigungu) === normalize(region?.sigungu) &&
  Boolean(nonEmptyText(location?.address)) &&
  hasResolvedCoordinates(location)
