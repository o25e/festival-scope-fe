export const YEARS = [2022, 2023, 2024, 2025, 2026]
export const MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
]

export const THEMES = {
  starlight: {
    name: '야간경관 · 별빛 · 천문',
    kw: '야간관광, 별빛, 천문 관측',
    series: [41, 55, 68, 79, 88],
    detail: [
      { k: '야간 관광', v: [38, 52, 70, 85, 96], d: '상승' },
      { k: '천문 · 별 관측 체험', v: [45, 54, 63, 72, 81], d: '상승' },
      {
        k: '드론 라이트쇼',
        v: [22, 41, 68, 88, 97],
        d: '급상승 · 전국 도입 확산',
      },
      { k: '로컬푸드 야시장', v: [66, 69, 68, 71, 72], d: '유지' },
    ],
    sims: [
      {
        n: '정선 별빛산책축제',
        reg: '강원 정선',
        days: 3,
        series: [38000, 44000, 52000, 61000, 68000],
      },
      {
        n: '단양 밤하늘 페스타',
        reg: '충북 단양',
        days: 4,
        series: [51000, 58000, 70000, 83000, 92000],
      },
      {
        n: '청송 은하수 페스타',
        reg: '경북 청송',
        days: 3,
        series: [31000, 36000, 42000, 49000, 55000],
      },
      {
        n: '제천 달빛야행',
        reg: '충북 제천',
        days: 4,
        series: [49000, 56000, 66000, 74000, 81000],
      },
    ],
  },
  localfood: {
    name: '로컬푸드 · 미식',
    kw: '지역 특산물, 야시장, 미식 투어',
    series: [72, 74, 71, 76, 78],
    detail: [
      { k: '로컬푸드 야시장', v: [66, 69, 68, 71, 72], d: '유지' },
      { k: '지역 특산물 축제', v: [78, 77, 72, 74, 75], d: '유지' },
      { k: '미식 투어', v: [58, 64, 68, 77, 86], d: '상승' },
      { k: '푸드트럭', v: [88, 82, 71, 66, 61], d: '하락' },
    ],
    sims: [
      {
        n: '횡성 한우 미식주간',
        reg: '강원 횡성',
        days: 4,
        series: [62000, 66000, 64000, 69000, 72000],
      },
      {
        n: '남해 멸치 미식축제',
        reg: '경남 남해',
        days: 3,
        series: [41000, 44000, 43000, 46000, 48000],
      },
      {
        n: '금산 인삼 푸드페어',
        reg: '충남 금산',
        days: 5,
        series: [88000, 92000, 86000, 91000, 95000],
      },
      {
        n: '고창 수산 미식장터',
        reg: '전북 고창',
        days: 3,
        series: [34000, 37000, 36000, 38000, 40000],
      },
    ],
  },
  character: {
    name: '캐릭터 · 애니메이션 IP',
    kw: '캐릭터 IP, 팝업, 굿즈',
    series: [35, 48, 66, 85, 97],
    detail: [
      { k: '캐릭터 팝업', v: [28, 45, 68, 89, 99], d: '급상승' },
      { k: '굿즈 · 한정판', v: [40, 52, 70, 86, 95], d: '상승' },
      { k: '포토존 · 인증샷', v: [55, 66, 75, 84, 90], d: '상승' },
      { k: '코스프레 행사', v: [62, 64, 66, 68, 70], d: '유지' },
    ],
    sims: [
      {
        n: '부천 캐릭터 페스타',
        reg: '경기 부천',
        days: 4,
        series: [52000, 71000, 96000, 128000, 151000],
      },
      {
        n: '춘천 애니타운 페스티벌',
        reg: '강원 춘천',
        days: 3,
        series: [38000, 49000, 66000, 84000, 97000],
      },
      {
        n: '대전 IP 콘텐츠 마켓',
        reg: '대전 유성',
        days: 4,
        series: [44000, 58000, 73000, 92000, 108000],
      },
      {
        n: '전주 굿즈 페어',
        reg: '전북 전주',
        days: 3,
        series: [26000, 35000, 47000, 60000, 71000],
      },
    ],
  },
  tradition: {
    name: '전통문화 · 민속',
    kw: '민속놀이, 전통공연, 고유 의례',
    series: [88, 80, 72, 63, 54],
    detail: [
      { k: '전통 공연', v: [84, 78, 71, 64, 58], d: '하락' },
      { k: '민속놀이 체험', v: [92, 82, 70, 60, 50], d: '하락' },
      { k: '한복 체험', v: [70, 72, 74, 73, 75], d: '유지' },
      { k: '전통주 · 다도', v: [46, 52, 59, 66, 74], d: '상승' },
    ],
    sims: [
      {
        n: '예천 민속문화제',
        reg: '경북 예천',
        days: 4,
        series: [72000, 66000, 58000, 52000, 46000],
      },
      {
        n: '나주 목사고을 문화제',
        reg: '전남 나주',
        days: 3,
        series: [58000, 54000, 49000, 44000, 40000],
      },
      {
        n: '강릉 전통연희 한마당',
        reg: '강원 강릉',
        days: 4,
        series: [95000, 88000, 79000, 72000, 66000],
      },
      {
        n: '성주 참외골 민속제',
        reg: '경북 성주',
        days: 3,
        series: [33000, 30000, 28000, 25000, 23000],
      },
    ],
  },
  music: {
    name: '음악 · 공연 페스티벌',
    kw: '라이브 공연, 버스킹, 야외 무대',
    series: [76, 82, 74, 79, 81],
    detail: [
      { k: '야외 음악 페스티벌', v: [72, 84, 74, 80, 83], d: '유지' },
      { k: '버스킹', v: [80, 78, 72, 74, 76], d: '유지' },
      { k: '캠핑형 공연', v: [48, 58, 66, 75, 84], d: '상승' },
      { k: '트로트 공연', v: [96, 88, 74, 64, 55], d: '하락' },
    ],
    sims: [
      {
        n: '가평 리버사이드 뮤직',
        reg: '경기 가평',
        days: 3,
        series: [62000, 71000, 64000, 69000, 72000],
      },
      {
        n: '통영 바다무대 페스타',
        reg: '경남 통영',
        days: 4,
        series: [81000, 88000, 80000, 85000, 89000],
      },
      {
        n: '담양 대숲 어쿠스틱',
        reg: '전남 담양',
        days: 3,
        series: [35000, 41000, 38000, 42000, 45000],
      },
      {
        n: '울산 강변 라이브위크',
        reg: '울산 중구',
        days: 4,
        series: [104000, 112000, 101000, 108000, 113000],
      },
    ],
  },
  flower: {
    name: '꽃 · 계절경관',
    kw: '꽃길, 단풍, 계절 경관 산책',
    series: [92, 86, 79, 71, 66],
    detail: [
      { k: '꽃축제', v: [95, 88, 80, 71, 64], d: '하락' },
      { k: '단풍 명소', v: [88, 84, 80, 76, 73], d: '하락' },
      { k: '야간 조명 정원', v: [52, 60, 68, 77, 86], d: '상승' },
      { k: '가든 · 수목원', v: [66, 67, 65, 68, 69], d: '유지' },
    ],
    sims: [
      {
        n: '구례 산수유 꽃길축제',
        reg: '전남 구례',
        days: 4,
        series: [112000, 104000, 95000, 86000, 80000],
      },
      {
        n: '태안 가을정원 페스타',
        reg: '충남 태안',
        days: 5,
        series: [78000, 72000, 67000, 61000, 57000],
      },
      {
        n: '옥천 향수호수 단풍제',
        reg: '충북 옥천',
        days: 3,
        series: [44000, 41000, 38000, 34000, 32000],
      },
      {
        n: '거창 고원 꽃길주간',
        reg: '경남 거창',
        days: 4,
        series: [36000, 34000, 31000, 28000, 26000],
      },
    ],
  },
  marine: {
    name: '해양 · 워터 액티비티',
    kw: '해변, 수상 레저, 해양 체험',
    series: [58, 64, 72, 77, 83],
    detail: [
      { k: '수상 레저 체험', v: [52, 61, 72, 80, 88], d: '상승' },
      { k: '해변 야간 프로그램', v: [44, 53, 64, 74, 85], d: '상승' },
      { k: '서핑', v: [68, 72, 76, 78, 81], d: '상승' },
      { k: '갯벌 체험', v: [74, 72, 70, 69, 68], d: '유지' },
    ],
    sims: [
      {
        n: '고성 서핑비치 페스타',
        reg: '강원 고성',
        days: 4,
        series: [46000, 55000, 66000, 74000, 83000],
      },
      {
        n: '태안 바다레저위크',
        reg: '충남 태안',
        days: 5,
        series: [72000, 81000, 92000, 101000, 110000],
      },
      {
        n: '거제 씨사이드 페스타',
        reg: '경남 거제',
        days: 3,
        series: [38000, 44000, 52000, 58000, 64000],
      },
      {
        n: '옹진 섬바다 축제',
        reg: '인천 옹진',
        days: 4,
        series: [29000, 34000, 40000, 45000, 50000],
      },
    ],
  },
}

export const FESTIVAL_TYPES = {
  culture: '문화·예술',
  food: '음식·미식',
  nature: '자연·생태',
  history: '역사·전통',
  music: '음악·공연',
  family: '가족·체험',
}

export function getThemeForTopic(topic) {
  const value = String(topic || '')
    .trim()
    .toLowerCase()
  const match = Object.entries(THEMES).find(
    ([key, theme]) =>
      value === key ||
      value === theme.name.toLowerCase() ||
      value.includes(key) ||
      theme.name.toLowerCase().includes(value),
  )
  if (match) return match[1]
  if (value.includes('별빛') || value.includes('천문')) return THEMES.starlight
  if (
    value.includes('미식') ||
    value.includes('음식') ||
    value.includes('푸드')
  )
    return THEMES.localfood
  if (value.includes('캐릭터') || value.includes('애니'))
    return THEMES.character
  if (value.includes('전통') || value.includes('민속')) return THEMES.tradition
  if (value.includes('음악') || value.includes('공연')) return THEMES.music
  if (value.includes('꽃') || value.includes('계절')) return THEMES.flower
  if (value.includes('바다') || value.includes('해양')) return THEMES.marine
  return THEMES.starlight
}

export const PROGRAMS = [
  { id: 'media', n: '야간 미디어아트 산책로', out: true, night: true },
  { id: 'astro', n: '천문 관측 체험', out: true, night: true, fog: true },
  { id: 'drone', n: '드론 라이트쇼', out: true, night: true, wind: true },
  { id: 'market', n: '로컬푸드 야시장', out: true, night: true },
  { id: 'stage', n: '버스킹 · 야외 공연', out: true, wind: true },
  { id: 'expo', n: '실내 전시 · 체험관', out: false },
  { id: 'parade', n: '거리 퍼레이드', out: true },
  { id: 'kids', n: '가족 · 어린이 체험존', out: true },
  { id: 'water', n: '수상 · 물놀이 체험', out: true },
  { id: 'craft', n: '공예 · 만들기 워크숍', out: false },
]

const region = (data) => data
export const REGIONS = {
  yeongwol: region({
    name: '강원 영월군',
    annual: '연 310만 명',
    baseDemand: 58,
    baseNote: '전국 기초지자체 하위 40% 구간',
    outRatio: 62,
    stayRatio: 21,
    monthly: [72, 70, 82, 96, 118, 101, 124, 138, 105, 131, 88, 75],
    access: {
      car: '서울 도심 기준 2시간 40분',
      km: 190,
      station: '영월역 · 행사장까지 차량 8분',
      train: '청량리–영월 무궁화호 1일 6회',
      bus: '동서울–영월 시외버스 1일 11회',
      transitScore: 46,
      transitNote: '역·터미널에서 행사장까지 정기 대중교통 노선 없음',
    },
    poi: {
      r5: { tour: 14, food: 186, stay: 47, rooms: 1180 },
      r15: { tour: 31, food: 402, stay: 96, rooms: 2310 },
    },
    poiList: [
      {
        n: '별마로천문대',
        t: '관광지',
        km: 11,
        note: '주제 정합성 높음 · 야간 운영',
      },
      {
        n: '청령포',
        t: '관광지',
        km: 6.2,
        note: '유네스코 연계 해설 프로그램 운영',
      },
      { n: '장릉', t: '관광지', km: 4.1, note: '도보권 · 주차 200면' },
      { n: '한반도지형 전망대', t: '관광지', km: 22.4, note: '셔틀 필요' },
      {
        n: '영월읍 중앙시장',
        t: '상권',
        km: 2.1,
        note: '점포 168개 · 야간 영업 12%',
      },
      { n: '덕포 먹거리골목', t: '상권', km: 3.4, note: '식당 54개' },
      {
        n: '동강 캠핑존',
        t: '숙박',
        km: 1.8,
        note: '96면 · 성수기 예약률 높음',
      },
    ],
    weather: {
      rainYears: [2, 3, 4, 5, 6, 8, 9, 8, 5, 4, 3, 2],
      heavyYears: [0, 1, 1, 2, 3, 5, 7, 6, 3, 2, 1, 0],
      windYears: [5, 5, 6, 5, 3, 2, 3, 4, 3, 3, 4, 5],
      fogYears: [4, 4, 4, 3, 4, 5, 4, 4, 6, 5, 4, 4],
      nightLow: [
        -8.9, -6.2, -1, 4.2, 9.8, 15.1, 19.8, 19.9, 14.2, 6.2, -0.4, -6.5,
      ],
      diurnal: [
        11.9, 12.8, 13.5, 14.2, 13.9, 11.8, 9.2, 9.8, 12.4, 13.8, 12.6, 11.5,
      ],
      note: '동강 하천변 관측지점 기준 · 최근 10년',
    },
    localSim: {
      n: '영월 동강 물길축제',
      reg: '강원 영월 (동일 지역)',
      days: 4,
      series: [52000, 58000, 64000, 70000, 74000],
    },
    events: [
      {
        n: '제천 달빛야행',
        reg: '충북 제천',
        km: 42,
        s: '10-16',
        e: '10-18',
        held: 5,
        scale: 80000,
      },
      {
        n: '단양 소백산 억새축제',
        reg: '충북 단양',
        km: 58,
        s: '10-17',
        e: '10-19',
        held: 3,
        scale: 55000,
      },
      {
        n: '원주 문화의거리 페스타',
        reg: '강원 원주',
        km: 63,
        s: '10-14',
        e: '10-16',
        held: 5,
        scale: 40000,
      },
      {
        n: '정선 가을레포츠 페스타',
        reg: '강원 정선',
        km: 37,
        s: '10-10',
        e: '10-12',
        held: 4,
        scale: 30000,
      },
      {
        n: '단양 온달문화축제',
        reg: '충북 단양',
        km: 61,
        s: '10-03',
        e: '10-05',
        held: 5,
        scale: 35000,
      },
      {
        n: '평창 고원음악제',
        reg: '강원 평창',
        km: 55,
        s: '10-24',
        e: '10-26',
        held: 4,
        scale: 25000,
      },
      {
        n: '충주 사과축제',
        reg: '충북 충주',
        km: 71,
        s: '10-30',
        e: '11-02',
        held: 5,
        scale: 60000,
      },
      {
        n: '영월 동강 물길축제',
        reg: '강원 영월',
        km: 3,
        s: '08-01',
        e: '08-04',
        held: 5,
        scale: 74000,
      },
      {
        n: '정선 아리랑 장터한마당',
        reg: '강원 정선',
        km: 40,
        s: '05-02',
        e: '05-05',
        held: 5,
        scale: 45000,
      },
      {
        n: '제천 봄꽃 문화제',
        reg: '충북 제천',
        km: 44,
        s: '04-11',
        e: '04-13',
        held: 4,
        scale: 28000,
      },
    ],
  }),
  gangneung: region({
    name: '강원 강릉시',
    annual: '연 2,150만 명',
    baseDemand: 88,
    baseNote: '전국 기초지자체 상위 5% 구간',
    outRatio: 79,
    stayRatio: 44,
    monthly: [78, 80, 95, 110, 125, 118, 168, 195, 120, 102, 85, 80],
    access: {
      car: '서울 도심 기준 2시간 20분',
      km: 172,
      station: '강릉역 · 행사장까지 차량 12분',
      train: '서울–강릉 KTX 1일 26회',
      bus: '동서울–강릉 시외버스 1일 34회',
      transitScore: 81,
      transitNote: 'KTX·시내버스 연계 양호, 성수기 도심 정체 구간 있음',
    },
    poi: {
      r5: { tour: 26, food: 642, stay: 214, rooms: 6800 },
      r15: { tour: 48, food: 1180, stay: 392, rooms: 11400 },
    },
    poiList: [
      { n: '경포호 · 경포대', t: '관광지', km: 2.6, note: '야간 산책로 조성' },
      {
        n: '안목 커피거리',
        t: '상권',
        km: 5.1,
        note: '카페 82개 · 야간 영업 68%',
      },
      { n: '오죽헌', t: '관광지', km: 4.8, note: '해설 프로그램 상시' },
      { n: '중앙 · 성남시장', t: '상권', km: 6, note: '점포 340개' },
      { n: '경포 리조트 단지', t: '숙박', km: 1.4, note: '객실 2,100실' },
    ],
    weather: {
      rainYears: [3, 3, 4, 4, 5, 7, 8, 8, 6, 4, 4, 3],
      heavyYears: [1, 1, 1, 2, 2, 4, 6, 6, 4, 2, 1, 1],
      windYears: [7, 7, 7, 6, 4, 3, 3, 4, 4, 5, 6, 7],
      fogYears: [2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 2],
      nightLow: [-3.2, -1.8, 2.1, 7, 12, 16.8, 21.4, 22.1, 17.6, 11, 4.6, -1.4],
      diurnal: [9.8, 10.4, 11.2, 12, 11.4, 9.2, 7.4, 7.8, 9.6, 10.8, 10.2, 9.6],
      note: '강릉 해안 관측지점 기준 · 최근 10년',
    },
    localSim: {
      n: '강릉 바다향 미식주간',
      reg: '강원 강릉 (동일 지역)',
      days: 4,
      series: [88000, 96000, 104000, 112000, 119000],
    },
    events: [
      {
        n: '강릉 커피축제',
        reg: '강원 강릉',
        km: 5,
        s: '10-09',
        e: '10-12',
        held: 5,
        scale: 210000,
      },
      {
        n: '속초 가을 해맞이 페스타',
        reg: '강원 속초',
        km: 48,
        s: '10-16',
        e: '10-18',
        held: 4,
        scale: 62000,
      },
      {
        n: '양양 서핑 클로징위크',
        reg: '강원 양양',
        km: 39,
        s: '09-26',
        e: '09-28',
        held: 4,
        scale: 34000,
      },
      {
        n: '평창 고원음악제',
        reg: '강원 평창',
        km: 56,
        s: '10-24',
        e: '10-26',
        held: 4,
        scale: 25000,
      },
      {
        n: '동해 묵호항 수산축제',
        reg: '강원 동해',
        km: 31,
        s: '11-06',
        e: '11-08',
        held: 5,
        scale: 48000,
      },
      {
        n: '강릉 단오제',
        reg: '강원 강릉',
        km: 3,
        s: '06-05',
        e: '06-11',
        held: 5,
        scale: 980000,
      },
    ],
  }),
  yeosu: region({
    name: '전남 여수시',
    annual: '연 1,340만 명',
    baseDemand: 84,
    baseNote: '전국 기초지자체 상위 10% 구간',
    outRatio: 81,
    stayRatio: 51,
    monthly: [70, 74, 92, 120, 135, 112, 158, 176, 118, 105, 84, 72],
    access: {
      car: '서울 도심 기준 4시간 10분',
      km: 372,
      station: '여수엑스포역 · 행사장까지 차량 6분',
      train: '용산–여수EXPO KTX 1일 12회',
      bus: '센트럴시티–여수 고속버스 1일 15회',
      transitScore: 72,
      transitNote: '역세권 근접, 주말 해안도로 정체 상습 구간',
    },
    poi: {
      r5: { tour: 22, food: 498, stay: 168, rooms: 5200 },
      r15: { tour: 40, food: 860, stay: 260, rooms: 7900 },
    },
    poiList: [
      {
        n: '돌산공원 · 케이블카',
        t: '관광지',
        km: 3.2,
        note: '야간 운영 · 연계 최적',
      },
      { n: '낭만포차거리', t: '상권', km: 1.6, note: '포차 46개 · 심야 운영' },
      { n: '오동도', t: '관광지', km: 2.4, note: '도보 접근 가능' },
      { n: '교동시장', t: '상권', km: 2, note: '점포 210개' },
      { n: '엑스포 숙박단지', t: '숙박', km: 1.1, note: '객실 1,600실' },
    ],
    weather: {
      rainYears: [3, 4, 5, 6, 6, 9, 9, 8, 6, 4, 4, 3],
      heavyYears: [1, 1, 2, 3, 3, 7, 8, 7, 5, 2, 1, 1],
      windYears: [6, 6, 6, 5, 4, 4, 5, 6, 5, 4, 5, 6],
      fogYears: [3, 4, 6, 7, 8, 9, 8, 6, 4, 3, 3, 3],
      nightLow: [-0.4, 1, 4.8, 9.6, 14.2, 18.4, 22.6, 23.2, 19, 13.2, 7, 1.8],
      diurnal: [8.6, 9.2, 9.8, 10.2, 9.6, 7.8, 6.4, 6.8, 8.4, 9.4, 9, 8.6],
      note: '여수 해안 관측지점 기준 · 최근 10년',
    },
    localSim: {
      n: '여수 밤바다 페스타',
      reg: '전남 여수 (동일 지역)',
      days: 4,
      series: [96000, 108000, 118000, 128000, 137000],
    },
    events: [
      {
        n: '순천만 갈대축제',
        reg: '전남 순천',
        km: 28,
        s: '10-16',
        e: '10-20',
        held: 5,
        scale: 185000,
      },
      {
        n: '광양 전어축제',
        reg: '전남 광양',
        km: 34,
        s: '09-05',
        e: '09-07',
        held: 5,
        scale: 42000,
      },
      {
        n: '남해 보물섬 미식주간',
        reg: '경남 남해',
        km: 52,
        s: '10-10',
        e: '10-12',
        held: 3,
        scale: 36000,
      },
      {
        n: '고흥 우주항공축제',
        reg: '전남 고흥',
        km: 47,
        s: '10-23',
        e: '10-25',
        held: 4,
        scale: 58000,
      },
      {
        n: '여수 거북선축제',
        reg: '전남 여수',
        km: 2,
        s: '05-02',
        e: '05-05',
        held: 5,
        scale: 230000,
      },
    ],
  }),
  andong: region({
    name: '경북 안동시',
    annual: '연 780만 명',
    baseDemand: 71,
    baseNote: '전국 기초지자체 상위 25% 구간',
    outRatio: 68,
    stayRatio: 33,
    monthly: [68, 70, 88, 102, 112, 98, 118, 126, 118, 140, 92, 70],
    access: {
      car: '서울 도심 기준 3시간 05분',
      km: 243,
      station: '안동역 · 행사장까지 차량 10분',
      train: '청량리–안동 KTX-이음 1일 8회',
      bus: '동서울–안동 고속버스 1일 18회',
      transitScore: 63,
      transitNote: 'KTX-이음 개통 후 접근성 개선, 시내 순환버스 배차 간격 김',
    },
    poi: {
      r5: { tour: 18, food: 312, stay: 86, rooms: 2400 },
      r15: { tour: 34, food: 520, stay: 132, rooms: 3450 },
    },
    poiList: [
      { n: '월영교', t: '관광지', km: 1.9, note: '야간 조명 운영 · 연계 최적' },
      { n: '하회마을', t: '관광지', km: 19.6, note: '유네스코 · 셔틀 필요' },
      { n: '안동구시장 찜닭골목', t: '상권', km: 2.8, note: '점포 96개' },
      { n: '도산서원', t: '관광지', km: 24, note: '차량 이동 30분' },
      { n: '안동 문화관광단지', t: '숙박', km: 3.6, note: '객실 980실' },
    ],
    weather: {
      rainYears: [2, 3, 4, 5, 6, 8, 9, 8, 5, 3, 3, 2],
      heavyYears: [0, 1, 1, 2, 3, 6, 7, 6, 3, 1, 1, 0],
      windYears: [4, 5, 5, 4, 3, 2, 3, 3, 3, 3, 4, 4],
      fogYears: [6, 6, 5, 4, 4, 5, 5, 5, 7, 7, 6, 6],
      nightLow: [-6.4, -4, 0.8, 6, 11.4, 16.6, 21, 21.2, 15.8, 8, 1.4, -4.2],
      diurnal: [12.4, 13, 13.8, 14.4, 13.8, 11.4, 9, 9.4, 12, 13.4, 12.8, 12.2],
      note: '안동 내륙 관측지점 기준 · 최근 10년',
    },
    localSim: {
      n: '안동 하회 전통주간',
      reg: '경북 안동 (동일 지역)',
      days: 5,
      series: [102000, 96000, 90000, 86000, 82000],
    },
    events: [
      {
        n: '안동 국제탈춤페스티벌',
        reg: '경북 안동',
        km: 2,
        s: '09-25',
        e: '10-04',
        held: 5,
        scale: 1200000,
      },
      {
        n: '영주 선비문화축제',
        reg: '경북 영주',
        km: 41,
        s: '10-16',
        e: '10-18',
        held: 5,
        scale: 52000,
      },
      {
        n: '문경 사과축제',
        reg: '경북 문경',
        km: 57,
        s: '10-23',
        e: '10-25',
        held: 5,
        scale: 46000,
      },
      {
        n: '예천 민속문화제',
        reg: '경북 예천',
        km: 29,
        s: '10-10',
        e: '10-12',
        held: 4,
        scale: 38000,
      },
      {
        n: '청송 사과축제',
        reg: '경북 청송',
        km: 44,
        s: '11-06',
        e: '11-09',
        held: 5,
        scale: 54000,
      },
    ],
  }),
  boryeong: region({
    name: '충남 보령시',
    annual: '연 1,020만 명',
    baseDemand: 74,
    baseNote: '전국 기초지자체 상위 20% 구간',
    outRatio: 85,
    stayRatio: 38,
    monthly: [55, 58, 72, 88, 110, 120, 196, 210, 96, 78, 62, 55],
    access: {
      car: '서울 도심 기준 2시간 15분',
      km: 168,
      station: '대천역 · 행사장까지 차량 9분',
      train: '용산–대천 무궁화호 1일 14회',
      bus: '센트럴시티–보령 고속버스 1일 21회',
      transitScore: 69,
      transitNote: '서해선 개통으로 개선, 해수욕장 구간 성수기 정체',
    },
    poi: {
      r5: { tour: 16, food: 404, stay: 238, rooms: 6100 },
      r15: { tour: 28, food: 596, stay: 312, rooms: 7800 },
    },
    poiList: [
      { n: '대천해수욕장', t: '관광지', km: 0.5, note: '행사장 인접' },
      { n: '머드광장 상가', t: '상권', km: 0.8, note: '점포 142개' },
      {
        n: '무창포 신비의바닷길',
        t: '관광지',
        km: 14.2,
        note: '물때 연계 프로그램 가능',
      },
      { n: '대천항 수산시장', t: '상권', km: 5.4, note: '점포 88개' },
      { n: '대천 리조트 지구', t: '숙박', km: 1, note: '객실 3,200실' },
    ],
    weather: {
      rainYears: [2, 3, 4, 5, 6, 8, 9, 8, 5, 4, 4, 3],
      heavyYears: [0, 1, 1, 2, 3, 6, 8, 7, 4, 2, 1, 1],
      windYears: [8, 8, 8, 7, 5, 4, 5, 6, 6, 6, 7, 8],
      fogYears: [3, 4, 6, 7, 8, 8, 7, 5, 4, 3, 3, 3],
      nightLow: [-4.6, -2.4, 2, 7.4, 12.6, 17.4, 22, 22.6, 17.8, 11, 4.4, -2],
      diurnal: [9.4, 10, 10.8, 11.4, 10.8, 8.8, 7, 7.4, 9.2, 10.2, 9.8, 9.2],
      note: '보령 해안 관측지점 기준 · 최근 10년',
    },
    localSim: {
      n: '보령 서해바다 페스타',
      reg: '충남 보령 (동일 지역)',
      days: 4,
      series: [68000, 74000, 80000, 85000, 90000],
    },
    events: [
      {
        n: '보령 머드축제',
        reg: '충남 보령',
        km: 1,
        s: '07-17',
        e: '07-26',
        held: 5,
        scale: 2100000,
      },
      {
        n: '서천 홍원항 수산축제',
        reg: '충남 서천',
        km: 33,
        s: '10-16',
        e: '10-18',
        held: 5,
        scale: 44000,
      },
      {
        n: '태안 가을정원 페스타',
        reg: '충남 태안',
        km: 46,
        s: '10-09',
        e: '10-13',
        held: 4,
        scale: 57000,
      },
      {
        n: '홍성 내포문화축제',
        reg: '충남 홍성',
        km: 38,
        s: '10-23',
        e: '10-25',
        held: 4,
        scale: 36000,
      },
      {
        n: '부여 서동연꽃축제',
        reg: '충남 부여',
        km: 42,
        s: '07-10',
        e: '07-13',
        held: 5,
        scale: 62000,
      },
    ],
  }),
}

export const SAMPLE = {
  name: '영월 가을별빛 야행축제',
  org: '강원특별자치도 영월군',
  festivalThemes: [
    { type: 'nature', topic: '별빛·천문' },
    { type: 'culture', topic: '야간 문화 체험' },
  ],
  eventType: 'existing',
  firstHeldYear: 2018,
  target: 120000,
  region: 'yeongwol',
  venuetype: 'outdoor',
  venueType: 'outdoor',
  venue: '동강둔치공원',
  venueLocation: null,
  venueCapacity: '미정',
  start: '2027-10-15',
  end: '2027-10-18',
  parking: 1150,
  programs: ['media', 'astro', 'drone', 'market', 'stage'],
  outdoor: 85,
  rainplan: 'partial',
  shelter: 300,
}
export const FLOW = [
  ['input', '기획안 입력'],
  ['review', '입력 확인'],
  ['loading', '분석'],
  ['result', '분석 결과'],
  ['report', '최종 리포트'],
]
export const ANALYSIS_STEPS = [
  '유사 축제 실적 조회',
  '주제 키워드 관심도 추이 분석',
  '지역 월별 관광수요·접근성 집계',
  '인접 권역 행사 이력 대조',
  '과거 동일 시기 기상 통계 집계',
  '행사장 주변 POI 분석',
]

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const roundTo = (v, u) => Math.round(v / u) * u
const dparse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const ddiff = (a, b) => Math.round((b - a) / 864e5)
const dadd = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export function analyze(p) {
  const R = REGIONS[p.region] || REGIONS.yeongwol,
    topicPairs = p.festivalThemes?.length
      ? p.festivalThemes
      : [{ type: '', topic: '' }],
    baseTheme = getThemeForTopic(topicPairs[0].topic),
    eventTypeLabel = p.eventType === 'new' ? '신규 개최' : '기존 개최',
    firstHeldYear = p.eventType === 'existing' ? p.firstHeldYear : null,
    historyLabel = firstHeldYear ? ` · 최초 개최 ${firstHeldYear}년` : '',
    T = {
      ...baseTheme,
      name: `${topicPairs.map((pair) => `${FESTIVAL_TYPES[pair.type] || pair.type || '미분류'} · ${pair.topic || '미입력'}`).join(' / ') || baseTheme.name} · ${eventTypeLabel}${historyLabel}`,
    },
    sd = dparse(p.start),
    ed = dparse(p.end),
    days = Math.max(1, ddiff(sd, ed) + 1),
    daily = p.target / days,
    m = sd.getMonth(),
    progs = PROGRAMS.filter((x) => p.programs.includes(x.id))
  const sims = [...T.sims, R.localSim],
    last = sims.map((s) => s.series[4]).sort((a, b) => a - b),
    median = last[Math.floor(last.length / 2)],
    avg = last.reduce((a, b) => a + b, 0) / last.length,
    top = last[last.length - 1],
    ratio = p.target / median,
    yearAvg = YEARS.map(
      (_, i) => sims.reduce((a, s) => a + s.series[i], 0) / sims.length,
    ),
    simCagr = Math.pow(yearAvg[4] / yearAvg[0], 1 / 4) - 1
  let s1, v1
  if (ratio > 1.3) {
    s1 = clamp(100 - 120 * (ratio - 1.3), 25, 88)
    v1 = '과다 설정'
  } else if (ratio >= 0.8) {
    s1 = clamp(92 - 14 * Math.abs(ratio - 1), 80, 92)
    v1 = '적정 범위'
  } else if (ratio >= 0.5) {
    s1 = clamp(72 + 30 * (ratio - 0.5), 72, 80)
    v1 = '보수적 설정'
  } else {
    s1 = 68
    v1 = '과소 설정'
  }
  if (p.eventType === 'new' && ratio > 1.1) s1 = clamp(s1 - 6, 20, 92)
  s1 = Math.round(s1)
  const rec1 = {
      first: roundTo(median * 1.1, 5000),
      stretch: roundTo(top * 1.15, 5000),
    },
    tCagr = Math.pow(T.series[4] / T.series[0], 1 / 4) - 1,
    s2 = Math.round(clamp(62 + 120 * tCagr, 28, 95)),
    v2 = tCagr > 0.06 ? '상승' : tCagr > -0.03 ? '유지' : '하락'
  const mIdx = R.monthly[m],
    mScore = clamp(((mIdx - 60) / 90) * 100, 0, 100),
    mRank = [...R.monthly].sort((a, b) => b - a).indexOf(mIdx) + 1,
    parkNeed = Math.ceil((daily * 0.6) / 2.8 / 3.5),
    parkRatio = p.parking / parkNeed,
    accScore = Math.round(
      R.access.transitScore * 0.5 + clamp(parkRatio, 0, 1) * 100 * 0.5,
    ),
    s3 = Math.round(0.25 * R.baseDemand + 0.5 * mScore + 0.25 * accScore),
    v3 = s3 >= 78 ? '적합' : s3 >= 62 ? '조건부 적합' : '보완 필요'
  const yr = sd.getFullYear(),
    evRange = (e, off = 0) => {
      const [sm, sday] = e.s.split('-').map(Number),
        [em, eday] = e.e.split('-').map(Number)
      let a = new Date(yr, sm - 1, sday),
        b = new Date(yr, em - 1, eday)
      if (b < a) b = new Date(yr + 1, em - 1, eday)
      return [dadd(a, off), dadd(b, off)]
    },
    gapOf = (a1, a2, b1, b2) =>
      a1 <= b2 && b1 <= a2 ? 0 : b1 > a2 ? ddiff(a2, b1) : ddiff(b2, a1)
  const conflicts = (s, e) =>
    R.events
      .filter((x) => x.held >= 3)
      .map((ev) => {
        const [b1, b2] = evRange(ev),
          gap = gapOf(s, e, b1, b2),
          lv =
            ev.km <= 60 && gap === 0
              ? 'direct'
              : (ev.km <= 60 && gap <= 3) || (ev.km <= 80 && gap === 0)
                ? 'near'
                : ev.km <= 80 && gap <= 7
                  ? 'watch'
                  : null
        return lv ? { ...ev, gap, lv, b1, b2 } : null
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          ({ direct: 0, near: 1, watch: 2 })[a.lv] -
            { direct: 0, near: 1, watch: 2 }[b.lv] || a.km - b.km,
      )
  const cf = conflicts(sd, ed),
    nDirect = cf.filter((c) => c.lv === 'direct').length,
    nNear = cf.filter((c) => c.lv === 'near').length,
    weight = nDirect * 3 + nNear,
    v4 =
      weight >= 6 ? '높음' : weight >= 3 ? '보통' : weight > 0 ? '낮음' : '없음'
  let best = null
  for (let off = -14; off <= 14; off++) {
    if (Math.abs(off) < 3) continue
    const c = conflicts(dadd(sd, off), dadd(ed, off)),
      ww =
        c.filter((x) => x.lv === 'direct').length * 3 +
        c.filter((x) => x.lv === 'near').length
    if (
      !best ||
      ww < best.w ||
      (ww === best.w && Math.abs(off) < Math.abs(best.off))
    )
      best = { off, w: ww, c }
  }
  const stayRooms = R.poi.r15.rooms,
    rivalScale = cf
      .filter((c) => c.lv === 'direct')
      .reduce((a, c) => a + c.scale, 0),
    rivalStayDemand = Math.round(rivalScale * 0.06),
    stayPressure = Math.round((rivalStayDemand / (stayRooms * 2.2)) * 100),
    W = R.weather,
    rainP = W.rainYears[m] * 10,
    heavy = W.heavyYears[m],
    wind = W.windYears[m],
    fog = W.fogYears[m],
    concurrent = daily * 0.35,
    shelterCov = clamp((p.shelter / concurrent) * 100, 0, 100),
    mult = p.rainplan === 'none' ? 1.15 : p.rainplan === 'partial' ? 1 : 0.85,
    wRisk = Math.round(
      clamp(
        (0.4 * rainP + 0.35 * p.outdoor + 0.25 * (100 - shelterCov)) * mult,
        0,
        100,
      ),
    ),
    v5 = wRisk >= 65 ? '높음' : wRisk >= 45 ? '보통' : '낮음'
  const wFlags = []
  if (progs.some((x) => x.wind))
    wFlags.push({
      t: '강풍',
      d: `${MONTHS[m]} 순간풍속 8m/s 이상 발생 ${wind}/10년`,
      p: progs
        .filter((x) => x.wind)
        .map((x) => x.n)
        .join(', '),
      risk: wind >= 4,
    })
  if (progs.some((x) => x.fog))
    wFlags.push({
      t: '안개 · 시정',
      d: `${MONTHS[m]} 안개 발생 ${fog}/10년`,
      p: progs
        .filter((x) => x.fog)
        .map((x) => x.n)
        .join(', '),
      risk: fog >= 5,
    })
  if (progs.some((x) => x.night))
    wFlags.push({
      t: '야간 저온',
      d: `${MONTHS[m]} 야간 최저 평균 ${W.nightLow[m]}℃ · 일교차 ${W.diurnal[m]}℃`,
      p: progs
        .filter((x) => x.night)
        .map((x) => x.n)
        .join(', '),
      risk: W.nightLow[m] < 8,
    })
  wFlags.push({
    t: '강수',
    d: `${MONTHS[m]} 동일 시기 강수 ${rainP}% (10년 중 ${W.rainYears[m]}년) · 일 10mm 이상 ${heavy}년`,
    p: `야외 프로그램 비중 ${p.outdoor}%`,
    risk: rainP >= 40 && p.outdoor >= 60,
  })
  const P = R.poi,
    tourS = clamp((P.r15.tour / 40) * 100, 0, 100),
    foodS = clamp((P.r15.food / 700) * 100, 0, 100),
    stayCap = P.r15.rooms * 2.2,
    stayCov = (stayCap / daily) * 100,
    stayS = clamp((stayCov / 60) * 100, 0, 100),
    s6 = Math.round(0.4 * tourS + 0.25 * foodS + 0.35 * stayS),
    v6 = s6 >= 70 ? '높음' : s6 >= 48 ? '보통' : '낮음',
    composite = Math.round((s1 + s2 + s3) / 3),
    grade =
      composite >= 85
        ? 'A'
        : composite >= 75
          ? 'B+'
          : composite >= 65
            ? 'B'
            : composite >= 55
              ? 'C'
              : 'D',
    gradeNote = {
      A: '현 기획안 유지 가능',
      'B+': '일부 항목 보완 권장',
      B: '주요 항목 보완 필요',
      C: '핵심 항목 재설계 필요',
      D: '기획 방향 재검토 필요',
    }[grade]
  return {
    p,
    R,
    T,
    days,
    daily,
    m,
    progs,
    composite,
    grade,
    gradeNote,
    v: {
      sims,
      last,
      median,
      avg,
      top,
      ratio,
      yearAvg,
      simCagr,
      s1,
      v1,
      rec1,
      tCagr,
      s2,
      v2,
      mIdx,
      mScore,
      mRank,
      parkNeed,
      parkRatio,
      accScore,
      s3,
      v3,
      cf,
      nDirect,
      nNear,
      v4,
      best,
      stayPressure,
      stayRooms,
      rivalStayDemand,
      rainP,
      heavy,
      wind,
      fog,
      shelterCov,
      concurrent,
      wRisk,
      v5,
      wFlags,
      tourS,
      foodS,
      stayCap,
      stayCov,
      stayS,
      s6,
      v6,
    },
  }
}
export const getLevel = (value) => (value >= 78 ? 'g' : value >= 62 ? 'w' : 'r')
