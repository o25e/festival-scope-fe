import { PROGRAMS, REGIONS } from '../../data/prototype'

const FESTIVAL_STATUS_BY_EVENT_TYPE = {
  existing: 'EXISTING',
  new: 'NEW',
}

const VENUE_TYPE_BY_UI_VALUE = {
  indoor: 'INDOOR',
  outdoor: 'OUTDOOR',
  mixed: 'MIXED',
}

const parseInteger = (value, fieldLabel, { optional = false } = {}) => {
  const text = String(value ?? '').trim().replaceAll(',', '')
  if (!text || text === '미정') {
    if (optional) return null
    throw new Error(`${fieldLabel}을(를) 입력해주세요.`)
  }

  if (!/^-?\d+$/.test(text)) {
    throw new Error(`${fieldLabel}은(는) 숫자로 입력해주세요.`)
  }

  const number = Number(text)
  if (!Number.isSafeInteger(number)) {
    throw new Error(`${fieldLabel}의 값이 너무 큽니다.`)
  }
  return number
}

const parseCoordinate = (value, fieldLabel) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    throw new Error(`${fieldLabel}를 확인해주세요.`)
  }
  return number
}

const getRegionParts = (regionKey) => {
  const regionName = String(REGIONS[regionKey]?.name || '').trim()
  const [sido, ...sigunguParts] = regionName.split(/\s+/)
  const sigungu = sigunguParts.join(' ')

  if (!sido || !sigungu) {
    throw new Error('개최 지역을 확인해주세요.')
  }
  return { sido, sigungu }
}

export function buildFestivalPlanPayload(plan) {
  const venueLocation = plan.venueLocation
  if (!venueLocation?.address) {
    throw new Error('행사장 검색 결과의 실제 주소를 확인한 뒤 등록해주세요.')
  }

  const festivalStatus = FESTIVAL_STATUS_BY_EVENT_TYPE[plan.eventType]
  const venueType = VENUE_TYPE_BY_UI_VALUE[plan.venueType]
  if (!festivalStatus || !venueType) {
    throw new Error('축제 개최 형태 또는 행사장 유형을 확인해주세요.')
  }

  const { sido, sigungu } = getRegionParts(plan.region)
  const themeCodes = (plan.festivalThemes || [])
    .map((pair) => String(pair.topic || '').trim())
    .filter(Boolean)
  const programNames = PROGRAMS.filter((program) =>
    (plan.programs || []).includes(program.id),
  ).map((program) => program.n)
  const firstHeldYear =
    plan.eventType === 'new'
      ? null
      : parseInteger(plan.firstHeldYear, '최초 개최 연도', { optional: true })
  const capacity = parseInteger(plan.venueCapacity, '행사장 수용 규모', {
    optional: true,
  })

  return {
    planName: plan.planName.trim(),
    festivalName: plan.name.trim(),
    festivalStatus,
    sido,
    sigungu,
    venueName: plan.venue.trim(),
    venueAddress: venueLocation.address,
    latitude: parseCoordinate(venueLocation.latitude, '위도'),
    longitude: parseCoordinate(venueLocation.longitude, '경도'),
    startDate: plan.start,
    endDate: plan.end,
    targetVisitorCount: parseInteger(plan.target, '목표 방문객 수'),
    venueType,
    themeCodes,
    programNames,
    ...(firstHeldYear === null ? {} : { firstHeldYear }),
    ...(capacity === null ? {} : { capacity }),
  }
}
