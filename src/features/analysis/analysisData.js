import { fmt, round1 } from '../../utils/formatters'

export const ITEMS = [
  {
    key: 'visitor',
    no: 1,
    scored: true,
    name: '목표 방문객 타당성',
    scope: '유사 축제의 실제 방문객 규모와 연도별 추이 비교',
  },
  {
    key: 'trend',
    no: 2,
    scored: true,
    name: '트렌드 핏',
    scope: '축제 주제·프로그램 관련 검색 관심도의 최근 5년 추이',
  },
  {
    key: 'demand',
    no: 3,
    scored: true,
    name: '지역·시기 관광수요 적합성',
    scope: '평상시 지역 관광수요 · 최근 5년 월별 관광수요 · 행사장 접근성',
  },
  {
    key: 'overlap',
    no: 4,
    scored: false,
    name: '일정 중복·혼잡 리스크',
    scope: '최근 5년 동일 시기 · 인접 권역(반경 80km) 행사 이력',
  },
  {
    key: 'weather',
    no: 5,
    scored: false,
    name: '날씨 리스크',
    scope: '과거 동일 시기 기상 통계 × 선택 핵심 프로그램',
  },
  {
    key: 'link',
    no: 6,
    scored: false,
    name: '관광 연계 잠재력',
    scope: '행사장 반경 5km · 15km 관광지 · 음식점 상권 · 숙박 POI',
  },
]
export function cardData(item, A) {
  const v = A.v
  const content = A.analysisContent?.[item.key] || {}
  const hasServerDemand = Boolean(A.server?.items?.DEMAND_FIT)
  const hasServerConflict = Boolean(A.server?.items?.CONFLICT_RISK?.detail)
  if (item.key === 'visitor')
    return {
      pill: v.v1,
      tone:
        v.v1 === '적정 범위' ? 'g' : v.ratio > 1.6 || v.ratio < 0.5 ? 'r' : 'w',
      metric: `${round1(v.ratio)}배`,
      unit: '유사 축제 중위값 대비',
      sub: [
        ['목표', `${fmt(A.p.target)}명`],
        ['중위값', `${fmt(v.median)}명`],
        ['점수', v.s1],
      ],
      read:
        content.summary ||
        (v.ratio > 1.3
          ? `유사 축제 중위값 ${fmt(v.median)}명을 ${round1(v.ratio)}배 웃도는 목표입니다. 예산·인력 산정 근거가 약해질 수 있습니다.`
          : v.ratio < 0.8
            ? '유사 축제 대비 보수적인 목표입니다. 운영 준비 여력은 있으나 사업 규모 설득에 불리할 수 있습니다.'
            : '유사 축제의 실제 규모 범위 안에 있는 목표입니다.'),
      bars: [v.median, A.p.target],
    }
  if (item.key === 'trend')
    return {
      pill: v.v2,
      tone: v.v2 === '상승' ? 'g' : v.v2 === '유지' ? 'w' : 'r',
      metric: A.T.series[4],
      unit: '관심도 지수 (2026)',
      sub: [
        [
          '5년 추이',
          `${v.tCagr > 0 ? '+' : ''}${(v.tCagr * 100).toFixed(1)}%/년`,
        ],
        ['점수', v.s2],
      ],
      read:
        content.summary ||
        (v.v2 === '상승'
          ? `${A.T.name} 주제의 검색 관심도가 5년 연속 올라 관심 흐름과 방향이 맞습니다.`
          : v.v2 === '유지'
            ? '관심도가 뚜렷한 방향 없이 유지되고 있습니다. 주제만으로는 신규 방문 동인이 약합니다.'
            : '관심도가 지속 하락 중입니다. 주제 구성을 그대로 두면 신규 유입이 어려울 수 있습니다.'),
      bars: A.T.series,
    }
  if (item.key === 'demand')
    {
      const eventMonth = hasServerDemand ? A.R.eventMonth : A.R.eventMonth ?? A.m + 1
      return {
      pill: v.v3,
      tone: v.v3 === '적합' ? 'g' : v.v3 === '조건부 적합' ? 'w' : 'r',
      metric: v.s3,
      unit: '적합성 점수 / 100',
      sub: [
        [`${eventMonth ?? '-'}월 수요`, `지수 ${v.mIdx ?? '-'} (연중 ${v.mRank ?? '-'}위)`],
        ['접근성', v.accScore],
      ],
      read:
        hasServerDemand
          ? content.summary ?? '-'
          : content.summary ||
            `개최 월 수요는 연중 ${v.mRank}위로 ${v.mIdx >= 110 ? '유리' : '평이'}하지만, ${v.accScore < 60 ? `행사장 접근성(${v.accScore}점)이 전체 점수를 끌어내립니다.` : '접근성도 무리 없는 수준입니다.'}`,
      bars: A.R.monthly,
      highlight: eventMonth === null || eventMonth === undefined ? -1 : eventMonth - 1,
      }
    }
  if (item.key === 'overlap' && hasServerConflict)
    return {
      pill: `위험 ${v.v4 ?? '-'}`,
      tone:
        v.v4 === '높음'
          ? 'r'
          : v.v4 === '보통'
            ? 'w'
            : v.v4 === '낮음' || v.v4 === '없음'
              ? 'g'
              : 'w',
      metric: v.nDirect === null || v.nNear === null ? '-' : v.nDirect + v.nNear,
      unit: '중복 가능 행사',
      sub: [
        ['기간 직접 중복', `${v.nDirect ?? '-'}건`],
        ['인접 시기 행사', `${v.nNear ?? '-'}건`],
      ],
      read: content.summary || '-',
      bars: [],
    }
  if (item.key === 'overlap')
    return {
      pill: `위험 ${v.v4}`,
      tone: v.v4 === '높음' ? 'r' : v.v4 === '보통' ? 'w' : 'g',
      metric: v.nDirect + v.nNear,
      unit: '중복 가능 행사',
      sub: [
        ['기간 직접 중복', `${v.nDirect}건`],
        ['±3일 인접', `${v.nNear}건`],
      ],
      read:
        content.summary ||
        (v.nDirect
          ? `개최 기간에 반경 60km 내 행사 ${v.nDirect}건이 겹칩니다. 관람객 분산과 숙박 경합이 예상됩니다.`
          : v.nNear
            ? `직접 겹치는 행사는 없으나 전후 3일 내 인접 권역 행사가 ${v.nNear}건 있습니다.`
            : '반경 80km 내에서 같은 시기에 반복 개최되는 행사가 확인되지 않았습니다.'),
      bars: [],
    }
  if (item.key === 'weather')
    return {
      pill: `취약도 ${v.v5}`,
      tone: v.v5 === '높음' ? 'r' : v.v5 === '보통' ? 'w' : 'g',
      metric: `${v.rainP}%`,
      unit: `${A.m + 1}월 동일 시기 강수 발생률`,
      sub: [['기상 취약 프로그램', `${A.progs.filter((x) => x.out || x.wind || x.fog).length}개`]],
      read:
        content.summary ||
        `동일 시기 강수 발생률은 ${v.rainP}%이며, 현재 선택한 핵심 프로그램의 기상 취약도는 ${v.wRisk}점(${v.v5})입니다.`,
      bars: A.R.weather.rainYears,
      highlight: A.m,
    }
  const P = A.R.poi
  return {
    pill: `잠재력 ${v.v6}`,
    tone: v.v6 === '높음' ? 'g' : v.v6 === '보통' ? 'w' : 'r',
    metric: P.r15.tour + P.r15.stay,
    unit: '반경 15km 연계 가능 자원',
    sub: [
      ['관광지', `${P.r15.tour}곳`],
      ['숙박', `${P.r15.stay}곳`],
      ['체류 수용률', `${Math.round(v.stayCov)}%`],
    ],
    read:
      content.summary ||
      `관광지 밀도는 ${v.tourS >= 70 ? '충분' : '보통'}하지만 숙박 수용은 일평균 방문객의 ${Math.round(v.stayCov)}% 수준입니다.`,
    bars: [],
  }
}
