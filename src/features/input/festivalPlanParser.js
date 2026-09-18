import {
  FESTIVAL_TYPES,
  getFestivalTopics,
  PROGRAMS,
  REGIONS,
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
  강원도: '강원',
  강원특별자치도: '강원',
  전라남도: '전남',
  경상북도: '경북',
  충청남도: '충남',
}

const normalizeRegionName = (value) => {
  const [sido, ...sigunguParts] = normalize(value).split(' ')
  return [REGION_SIDO_ALIASES[sido] || sido, ...sigunguParts]
    .filter(Boolean)
    .join(' ')
}

const finiteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const getRegionKey = (sido, sigungu) => {
  const parsedRegion = normalize(
    sigungu === undefined ? sido : [sido, sigungu].filter(Boolean).join(' '),
  )
  if (!parsedRegion) return null

  if (Object.prototype.hasOwnProperty.call(REGIONS, parsedRegion)) {
    return parsedRegion
  }

  return (
    Object.entries(REGIONS).find(
      ([, region]) => normalizeRegionName(region.name) === normalizeRegionName(parsedRegion),
    )?.[0] || null
  )
}

const getParsedRegionName = (parsed) => {
  const regionValue =
    parsed.region && typeof parsed.region === 'object' ? parsed.region : {}
  const sido = parsed.sido ?? parsed.province ?? regionValue.sido
  const sigungu =
    parsed.sigungu ?? parsed.cityCounty ?? parsed.county ?? regionValue.sigungu
  const sidoAndSigungu = [sido, sigungu].map(normalize).filter(Boolean).join(' ')
  if (sidoAndSigungu) return sidoAndSigungu

  return nonEmptyText(parsed.regionName) || nonEmptyText(parsed.region)
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
    regionKey: patch.region || plan.region,
  }

  if (location.name && location.address) {
    location.mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
      `${location.name} ${location.address}`,
    )}`
  }

  return location
}

export function mergeParsedFestivalPlan(plan, response) {
  const parsed = response?.data && typeof response.data === 'object'
    ? response.data
    : response
  if (!parsed || typeof parsed !== 'object') return { plan, hasValues: false }

  const patch = {}
  const planName = nonEmptyText(parsed.planName)
  const festivalName = nonEmptyText(parsed.festivalName)
  const startDate = nonEmptyText(parsed.startDate)
  const endDate = nonEmptyText(parsed.endDate)
  const venueName = nonEmptyText(parsed.venueName)
  const targetVisitorCount = finiteNumber(parsed.targetVisitorCount)
  const capacity = finiteNumber(parsed.capacity)
  const firstHeldYear = finiteNumber(parsed.firstHeldYear)

  if (planName) patch.planName = planName
  if (festivalName) patch.name = festivalName
  if (startDate) patch.start = startDate
  if (endDate) patch.end = endDate
  if (venueName) patch.venue = venueName
  if (targetVisitorCount !== null && targetVisitorCount >= 0)
    patch.target = targetVisitorCount
  if (capacity !== null && capacity >= 0)
    patch.venueCapacity = String(capacity)

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

  const parsedRegionName = getParsedRegionName(parsed)
  const region = getRegionKey(parsedRegionName)
  if (region) patch.region = region
  if (parsedRegionName) {
    patch.org =
      parsedRegionName && !Object.prototype.hasOwnProperty.call(REGIONS, parsedRegionName)
        ? parsedRegionName
        : region
          ? REGIONS[region].name
          : parsedRegionName
  }

  const themePairs = Array.isArray(parsed.themes)
    ? parsed.themes.map((theme) => getThemePair(theme?.code)).filter(Boolean)
    : []
  if (themePairs.length) patch.festivalThemes = themePairs.slice(0, 2)

  const programIds = getProgramIds(parsed.programNames)
  if (programIds.length) patch.programs = programIds

  const venueLocation = buildVenueLocation(plan, parsed, patch)
  if (venueLocation) patch.venueLocation = venueLocation

  return {
    plan: { ...plan, ...patch },
    hasValues: Object.keys(patch).length > 0,
    appliedFields: Object.keys(patch),
    autoFilledFields: Object.fromEntries(
      Object.keys(patch).map((field) => [field, true]),
    ),
  }
}

export const isResolvedVenueLocation = (location, venue, regionKey) =>
  normalize(location?.name) === normalize(venue) &&
  normalize(location?.regionKey) === normalize(regionKey) &&
  Boolean(nonEmptyText(location?.address)) &&
  hasResolvedCoordinates(location)
