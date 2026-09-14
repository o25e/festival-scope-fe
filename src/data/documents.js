export const documents = [
  { name: '제5회 청호수 벚꽃축제', file: '춘천_청호수벚꽃축제_기본계획(안).hwp', region: '강원 춘천시', date: '2026.04.03–04.05', half: '2026-上', score: 84 },
  { name: '별빛강변 뮤직페스티벌', file: '별빛강변_뮤직페스티벌_기본계획(안).hwp', region: '경기 가평군', date: '2026.10.09–10.11', half: '2026-下', score: 72 },
  { name: '김천 김밥축제', file: '김천_김밥축제_운영계획.pdf', region: '경북 김천시', date: '2026.10.23–10.25', half: '2026-下', score: 78 },
]

export const documentRegions = [...new Set(documents.map((document) => document.region))]
