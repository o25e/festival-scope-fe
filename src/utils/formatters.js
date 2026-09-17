export const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('ko-KR')
export const round1 = (n) => Math.round(n * 10) / 10
export const dfmt = (d) => `${d.getMonth() + 1}월 ${d.getDate()}일`
export const dadd = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const dparse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const levelClass = (level) => `pill ${level}`
