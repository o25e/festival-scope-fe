import { Button } from '../../components/ui'
import { MONTHS, YEARS } from '../../data/prototype'
import { dadd, dparse, dfmt, fmt, levelClass, round1 } from '../../utils/formatters'
import { ITEMS, cardData } from './analysisData'

const mt = (label, value, detail, highlight = false) =>
  `<div class="metric ${highlight ? 'hl' : ''}"><div class="lbl">${label}</div><div class="mv">${value}</div>${detail ? `<div class="md">${detail}</div>` : ''}</div>`
const sec = (n, title, html) =>
  `<div class="sect"><div class="sect-h"><b>${n}</b><h4>${title}</h4><span class="line"></span></div>${html}</div>`
const recs = (list) =>
  `<div class="recs">${list.map((r) => `<div class="rec"><span class="pri p${r.p}">${r.p === 1 ? '즉시' : r.p === 2 ? '검토' : '선택'}</span><div class="rc"><b>${r.t}</b><p>${r.d}</p>${r.e ? `<em>${r.e}</em>` : ''}</div></div>`).join('')}</div>`
const displayDemandValue = (value) =>
  value === null || value === undefined || !Number.isFinite(Number(value))
    ? '-'
    : Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })
const displayConflictValue = (value, suffix = '') =>
  value === null || value === undefined ? '-' : `${value}${suffix}`
const displayConflictNumber = (value, suffix = '') =>
  value === null || value === undefined ? '-' : `${fmt(value)}${suffix}`
const displayWeatherValue = (value, suffix = '') =>
  value === null || value === undefined || value === '' ? '-' : `${value}${suffix}`
const weeklyVisitorData = [
  { label: '10월 1주', range: '10.01 - 10.07', value: 7.8 },
  { label: '10월 2주', range: '10.08 - 10.14', value: 9.2 },
  { label: '10월 3주', range: '10.15 - 10.21', value: 12.6, highlight: true },
  { label: '10월 4주', range: '10.22 - 10.31', value: 10.4 },
]
const weeklyVisitorPeak = weeklyVisitorData.reduce((peak, row) =>
  row.value > peak.value ? row : peak,
)

function weeklyBars(rows, unit = '만 명') {
  const W = 520,
    H = 205,
    padL = 35,
    padR = 8,
    padT = 27,
    padB = 40,
    dataMax = Math.max(0, ...rows.map((row) => row.value || 0)),
    tickStep = dataMax > 15 ? Math.max(1, Math.ceil(dataMax / 4 / 10) * 10) : 5,
    maxV = dataMax > 15 ? tickStep * 4 : 15,
    ticks =
      dataMax > 15
        ? Array.from({ length: 5 }, (_, index) => index * tickStep)
        : [0, 5, 10, 15],
    plotH = H - padT - padB,
    plotW = W - padL - padR,
    groupW = plotW / rows.length
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="직전년도 개최월 주차별 방문객 수 막대그래프">`
  ticks.forEach((tick) => {
    const y = H - padB - (tick / maxV) * plotH
    s += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#EAF0F4"/><text x="${padL - 7}" y="${y + 3.5}" text-anchor="end" font-size="10" fill="#93A2AF">${tick}</text>`
  })
  rows.forEach((row, i) => {
    const barW = groupW * 0.56,
      x = padL + i * groupW + (groupW - barW) / 2,
      barH = (row.value / maxV) * plotH,
      y = H - padB - barH,
      fill = row.highlight ? '#5577B5' : '#91B4E1'
    s += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${fill}"/><text x="${x + barW / 2}" y="${y - 8}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#132434">${row.value}${unit}</text><text x="${x + barW / 2}" y="${H - padB + 18}" text-anchor="middle" font-size="10.5" fill="#3C4E5F" font-weight="600">${row.label}</text><text x="${x + barW / 2}" y="${H - padB + 34}" text-anchor="middle" font-size="9.5" fill="#6C7D8C">(${row.range})</text>`
  })
  return `${s}</svg>`
}

const accessIcon = (type) =>
  type === 'transit'
    ? `<span class="access-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 16.5V6.8C6 5.25 7.25 4 8.8 4h6.4C16.75 4 18 5.25 18 6.8v9.7M6 11h12M8.5 16.5v2M15.5 16.5v2M8 19h8M8.4 7h.1M15.5 7h.1"/></svg></span>`
    : `<span class="access-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 17V7h4.3a3 3 0 0 1 0 6H9M9 10h4"/></svg></span>`
function hBars(rows, unit = '명') {
  const W = 470,
    rowH = 30,
    padL = 118,
    padR = 58,
    maxV = Math.max(...rows.map((r) => r.v)) * 1.06,
    H = rows.length * rowH + 6
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" role="img">`
  rows.forEach((r, i) => {
    const y = i * rowH + 6,
      bw = (r.v / maxV) * (W - padL - padR)
    s += `<text x="${padL - 9}" y="${y + 11}" text-anchor="end" font-size="11" fill="${r.hl ? '#132434' : '#6C7D8C'}" font-weight="${r.hl ? 600 : 400}">${r.n}</text><rect x="${padL}" y="${y + 1}" width="${Math.max(bw, 2)}" height="14" rx="2" fill="${r.hl ? '#12557E' : r.c || '#B9D0E0'}"/><text x="${padL + bw + 7}" y="${y + 12}" font-size="11" fill="${r.hl ? '#12557E' : '#3C4E5F'}" font-weight="${r.hl ? 700 : 500}">${fmt(r.v)}${unit}</text>${r.sub ? `<text x="${padL - 9}" y="${y + 22}" text-anchor="end" font-size="9.5" fill="#93A2AF">${r.sub}</text>` : ''}`
  })
  return `${s}</svg>`
}
function lineChart(labels, series, opt = {}) {
  const W = 470,
    H = opt.h || 150,
    padL = 34,
    padR = 12,
    padT = 12,
    padB = 24,
    isValue = (value) =>
      opt.preserveNulls
        ? value !== null && value !== undefined && Number.isFinite(Number(value))
        : Number.isFinite(Number(value)),
    all = series.flatMap((s) => s.v).filter(isValue),
    mx = opt.max ?? (all.length ? Math.max(...all) * 1.1 : 1),
    mn = opt.min ?? 0,
    x = (i) => padL + (i * (W - padL - padR)) / Math.max(labels.length - 1, 1),
    y = (v) => padT + (1 - (v - mn) / (mx - mn)) * (H - padT - padB)
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" role="img">`
  ;[0, 0.5, 1].forEach((f) => {
    const yy = padT + f * (H - padT - padB)
    s += `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="#EAF0F4"/><text x="${padL - 6}" y="${yy + 3.5}" text-anchor="end" font-size="9.5" fill="#93A2AF">${fmt(mn + (1 - f) * (mx - mn))}</text>`
  })
  series.forEach((se) => {
    const valid = se.v
      .map((value, index) => ({ value: Number(value), index }))
      .filter((point, index) => isValue(se.v[index]))
    const segments = []
    let segment = []
    se.v.forEach((value, index) => {
      if (isValue(value)) segment.push(`${x(index)},${y(Number(value))}`)
      else if (segment.length) {
        segments.push(segment)
        segment = []
      }
    })
    if (segment.length) segments.push(segment)
    if (se.area && valid.length === se.v.length) {
      const pts = valid.map((point) => `${x(point.index)},${y(point.value)}`).join(' ')
      s += `<polygon points="${padL},${y(mn)} ${pts} ${W - padR},${y(mn)}" fill="${se.c}" opacity=".08"/>`
    }
    segments.forEach((points) => {
      if (points.length > 1)
        s += `<polyline points="${points.join(' ')}" fill="none" stroke="${se.c}" stroke-width="${se.w || 2}" stroke-dasharray="${se.dash || ''}" stroke-linejoin="round"/>`
    })
    valid.forEach((point) => {
      s += `<circle cx="${x(point.index)}" cy="${y(point.value)}" r="${se.dash ? 0 : 3}" fill="#fff" stroke="${se.c}" stroke-width="1.6"/>`
    })
    const last = valid[valid.length - 1]
    if (se.last && last)
      s += `<text x="${x(last.index)}" y="${y(last.value) - 9}" text-anchor="end" font-size="10.5" font-weight="700" fill="${se.c}">${se.last}</text>`
  })
  labels.forEach((l, i) => {
    s += `<text x="${x(i)}" y="${H - 7}" text-anchor="middle" font-size="9.5" fill="#6C7D8C">${l}</text>`
  })
  return `${s}</svg>`
}
function vBars(labels, vals, hl, opt = {}) {
  const W = 470,
    H = opt.h || 132,
    padL = 8,
    padB = 22,
    padT = 16,
    mx = Math.max(...vals) * 1.12,
    bw = (W - padL * 2) / vals.length
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" role="img">`
  if (opt.ref) {
    const yy = padT + (1 - opt.ref / mx) * (H - padT - padB)
    s += `<line x1="${padL}" y1="${yy}" x2="${W - padL}" y2="${yy}" stroke="#A9BECD" stroke-dasharray="3 3"/><text x="${W - padL}" y="${yy - 4}" text-anchor="end" font-size="9.5" fill="#6C7D8C">${opt.refLabel || ''}</text>`
  }
  vals.forEach((v, i) => {
    const h = (v / mx) * (H - padT - padB),
      xx = padL + i * bw + bw * 0.16,
      ww = bw * 0.68,
      on = Array.isArray(hl) ? hl.includes(i) : i === hl
    s += `<rect x="${xx}" y="${H - padB - h}" width="${ww}" height="${h}" rx="2" fill="${on ? '#12557E' : '#CBDCE8'}"/>${on ? `<text x="${xx + ww / 2}" y="${H - padB - h - 5}" text-anchor="middle" font-size="10" font-weight="700" fill="#12557E">${v}</text>` : ''}<text x="${xx + ww / 2}" y="${H - 7}" text-anchor="middle" font-size="9.5" fill="${on ? '#132434' : '#93A2AF'}" font-weight="${on ? 600 : 400}">${labels[i]}</text>`
  })
  return `${s}</svg>`
}
function gantt(rows, ps, pe, name) {
  const W = 470,
    rowH = 26,
    H = (rows.length + 1) * rowH + 26,
    all = [ps, pe, ...rows.flatMap((r) => [r.b1, r.b2])],
    mn = dadd(new Date(Math.min(...all)), -2),
    mx = dadd(new Date(Math.max(...all)), 2),
    span = Math.max(1, Math.round((mx - mn) / 864e5)),
    X = (d) => 110 + ((d - mn) / 864e5 / span) * (W - 120)
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" role="img">`
  for (let i = 0; i <= 4; i++) {
    const d = dadd(mn, Math.round((span * i) / 4))
    s += `<line x1="${X(d)}" y1="16" x2="${X(d)}" y2="${H - 16}" stroke="#EAF0F4"/><text x="${X(d)}" y="11" text-anchor="middle" font-size="9.5" fill="#93A2AF">${dfmt(d)}</text>`
  }
  const bar = (y, a, b, fill, text, tc, bold) => {
    const x1 = X(a),
      x2 = Math.max(X(b), x1 + 4)
    return `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="13" rx="2" fill="${fill}"/><text x="105" y="${y + 10}" text-anchor="end" font-size="10" fill="${tc}" font-weight="${bold ? 650 : 400}">${text.length > 13 ? `${text.slice(0, 12)}…` : text}</text>`
  }
  s += bar(22, ps, pe, '#12557E', name, '#132434', true)
  rows.forEach((r, i) => {
    s += bar(
      22 + (i + 1) * rowH - 4,
      r.b1,
      r.b2,
      r.lv === 'direct' ? '#C2634C' : r.lv === 'near' ? '#D8A33F' : '#B9C7D2',
      r.n,
      '#3C4E5F',
      false,
    )
  })
  return `${s}</svg>`
}
function groupBars(groups, colors) {
  const W = 470,
    H = 150,
    padL = 36,
    padB = 30,
    padT = 14,
    mx = Math.max(...groups.flatMap((g) => g.v)) * 1.15,
    gw = (W - padL - 10) / groups.length
  let s = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px" role="img">`
  ;[0, 0.5, 1].forEach((f) => {
    const yy = padT + f * (H - padT - padB)
    s += `<line x1="${padL}" y1="${yy}" x2="${W - 10}" y2="${yy}" stroke="#EAF0F4"/><text x="${padL - 6}" y="${yy + 3.5}" text-anchor="end" font-size="9.5" fill="#93A2AF">${fmt((1 - f) * mx)}</text>`
  })
  groups.forEach((g, gi) => {
    const bw = (gw * 0.74) / g.v.length
    g.v.forEach((v, i) => {
      const h = (v / mx) * (H - padT - padB),
        x = padL + gi * gw + gw * 0.13 + i * bw
      s += `<rect x="${x}" y="${H - padB - h}" width="${bw * 0.82}" height="${h}" rx="2" fill="${colors[i]}"/><text x="${x + bw * 0.41}" y="${H - padB - h - 4}" text-anchor="middle" font-size="9.5" fill="#3C4E5F">${fmt(v)}</text>`
    })
    s += `<text x="${padL + gi * gw + gw * 0.5}" y="${H - 12}" text-anchor="middle" font-size="10.5" fill="#132434" font-weight="600">${g.n}</text>`
  })
  return `${s}</svg>`
}

const displayVisitorNumber = (value) =>
  value === null || value === undefined || !Number.isFinite(Number(value))
    ? '-'
    : fmt(value)

const displayVisitorDecimal = (value) =>
  value === null || value === undefined || !Number.isFinite(Number(value))
    ? '-'
    : Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })

const displayVisitorGap = (value) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '-'
  const gap = Number(value)
  if (gap === 0) return '목표 방문객은 최근 5회 중앙값과 동일'
  return `목표 방문객은 최근 5회 중앙값보다 ${(Math.abs(gap) * 100).toFixed(2)}% ${gap < 0 ? '낮음' : '높음'}`
}

const displaySimilarity = (value) =>
  value === null || value === undefined || !Number.isFinite(Number(value))
    ? '-'
    : `${Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`

export function getDetailHtml(item, A) {
  const v = A.v,
    p = A.p,
    R = A.R,
    T = A.T,
    m = A.m,
    content = A.analysisContent?.[item.key] || {}
  if (item.key === 'visitor' && v.targetSource === 'server') {
    const historyRows = Array.isArray(v.sameFestivalHistories) ? v.sameFestivalHistories : []
    const historyYears = Array.isArray(v.sameFestivalYears) ? v.sameFestivalYears : []
    const historySeries = Array.isArray(v.sameFestivalSeries) ? v.sameFestivalSeries : []
    const similarRows = Array.isArray(v.topSimilarFestivals) ? v.topSimilarFestivals : []
    const target = v.targetVisitorCount
    const dailyTarget = target === null || target === undefined || !A.days ? null : target / A.days
    const lastHistoryValue = [...historySeries].reverse().find((value) => value !== null && value !== undefined)
    const historyChart = historyYears.length
      ? `<div class="vizbox">${lineChart(
          historyYears,
          [
            {
              v: historySeries,
              c: '#12557E',
              area: true,
              last: displayVisitorNumber(lastHistoryValue),
            },
            {
              v: historyYears.map(() => target),
              c: '#C2634C',
              dash: '4 3',
              w: 1.6,
              last: `목표 ${displayVisitorNumber(target)}`,
            },
          ],
          { preserveNulls: true },
        )}<p class="vizcap">동일 축제의 연도별 방문객 이력입니다. 값이 없는 연도는 0명이 아니라 데이터 없음으로 표시합니다.</p></div>`
      : `<div class="readbox"><p>동일 축제의 과거 방문 이력이 없습니다.</p></div>`
    const historyTable = historyRows.length
      ? `<table class="dt" style="margin-top:12px"><tr><th>연도</th><th class="n">방문객 수</th><th class="n">예산</th></tr>${historyRows
          .map(
            (row) =>
              `<tr><td>${row.year ?? '-'}</td><td class="n">${displayVisitorNumber(row.visitorCount)}${row.visitorCount === null ? '' : '명'}</td><td class="n">${displayVisitorDecimal(row.budget)}</td></tr>`,
          )
          .join('')}</table>`
      : ''
    const similarTable = similarRows.length
      ? `<table class="dt" style="margin-top:12px"><tr><th>유사 축제</th><th>연도</th><th class="n">방문객 수</th><th class="n">종합 유사도</th></tr>${similarRows
          .map(
            (row) =>
              `<tr><td>${row.festivalName}</td><td>${row.year ?? '-'}</td><td class="n">${displayVisitorNumber(row.visitorCount)}${row.visitorCount === null ? '' : '명'}</td><td class="n"><b>${displaySimilarity(row.similarityScore)}</b><br><small>주제 ${displaySimilarity(row.themeSimilarity)} · 지역 ${displaySimilarity(row.regionSimilarity)} · 시기 ${displaySimilarity(row.periodSimilarity)}</small></td></tr>`,
          )
          .join('')}</table>`
      : `<div class="readbox"><p>상위 유사 축제 목록이 없습니다.</p></div>`
    return (
      sec(
        1,
        '핵심 지표',
        `<div class="metricrow c2">${mt('목표 방문객', `${displayVisitorNumber(target)}<small>명</small>`, `${A.days}일 · 일평균 ${displayVisitorNumber(dailyTarget)}명`, true)}${mt('방문객 중앙값', `${displayVisitorNumber(v.median)}<small>명</small>`, '최근 개최분 5건 기준')}${mt('중앙값 대비 배수', `${v.ratio === null ? '-' : round1(v.ratio)}<small>배</small>`, v.ratio === null ? '계산 불가' : '목표 방문객 ÷ 최근 5회 중앙값')}${mt('타당성 점수', `${v.s1 ?? '-'}<small>/100</small>`, '흥행 스코어 반영')}</div>`,
      ) +
      sec(
        2,
        '판단 근거 및 데이터',
        `<div class="visitor-meta-groups"><div class="visitor-meta-group"><b>분석 표본</b><span>유사 축제 ${v.similarFestivalCount ?? '-'}개</span><span>방문객 데이터 ${v.visitorDataCount ?? '-'}건</span><span>상세 비교 후보 ${similarRows.length}개</span></div><div class="visitor-meta-group"><b>방문객 분포</b><span>평균 ${displayVisitorDecimal(v.visitorAverage)}명</span><span>범위 ${displayVisitorNumber(v.visitorMin)}명 ~ ${displayVisitorNumber(v.visitorMax)}명</span></div><div class="visitor-meta-group"><b>비교 조건</b><span>유사도 기준 ${displaySimilarity(v.similarityThreshold)}</span><span>${displayVisitorGap(v.gapRate)}</span></div></div>${historyChart}${historyTable}<p class="vizcap" style="margin-top:16px">상위 유사 축제 후보</p>${similarTable}`,
      ) +
      sec(
        3,
        '결과 해석',
        content.detail
          ? `<div class="readbox read"><p>${content.detail}</p></div>`
          : `<div class="readbox read"><p>방문객 중앙값 ${displayVisitorNumber(v.median)}명 기준 목표는 ${v.ratio === null ? '-' : `${round1(v.ratio)}배`}입니다.</p></div>`,
      ) +
      sec(4, '권장 수정사항', recs(content.recommendations || []))
    )
  }
  if (item.key === 'visitor') {
    const rows = v.sims.map((s) => ({
      n: s.n.length > 12 ? `${s.n.slice(0, 11)}…` : s.n,
      v: s.series[4],
      sub: `${s.reg} · ${s.days}일`,
    }))
    rows.push({
      n: '이번 기획안 목표',
      v: p.target,
      hl: true,
      sub: `${R.name} · ${A.days}일`,
    })
    return (
      sec(
        1,
        '핵심 지표',
        `<div class="metricrow c2">${mt('목표 방문객', `${fmt(p.target)}<small>명</small>`, `${A.days}일 · 일평균 ${fmt(A.daily)}명`, true)}${mt('유사 축제 중위값', `${fmt(v.median)}<small>명</small>`, '최근 개최분 5건 기준')}${mt('중위값 대비 배수', `${round1(v.ratio)}<small>배</small>`, v.v1)}${mt('타당성 점수', `${v.s1}<small>/100</small>`, '흥행 스코어 반영')}</div>`,
      ) +
      sec(
        2,
        '판단 근거 및 데이터',
        `<div class="vizbox">${hBars(rows)}<p class="vizcap">유사 축제는 주제(${T.name})·개최 지역 특성·규모·개최 시기를 종합해 선정했습니다. 동일 지역 개최 이력 1건을 포함합니다.</p></div><div class="vizbox" style="margin-top:10px">${lineChart(
          YEARS,
          [
            { v: v.yearAvg, c: '#12557E', area: true, last: fmt(v.yearAvg[4]) },
            {
              v: YEARS.map(() => p.target),
              c: '#C2634C',
              dash: '4 3',
              w: 1.6,
              last: `목표 ${fmt(p.target)}`,
            },
          ],
        )}<p class="vizcap">유사 축제 5건의 연도별 평균 방문객(진한 선)과 이번 목표(점선). 최근 4년 연평균 증가율 ${(v.simCagr * 100).toFixed(1)}%.</p><div class="legend"><span><i style="background:#12557E"></i>유사 축제 평균</span><span><i style="background:#C2634C"></i>이번 기획안 목표</span></div></div><table class="dt" style="margin-top:12px"><tr><th>유사 축제</th><th>지역</th><th class="n">2026년 실적</th><th class="n">4년 증감</th></tr>${v.sims.map((s) => `<tr><td>${s.n}</td><td style="color:var(--muted)">${s.reg}</td><td class="n">${fmt(s.series[4])}</td><td class="n" style="color:${s.series[4] >= s.series[0] ? 'var(--good)' : 'var(--risk)'}">${s.series[4] >= s.series[0] ? '+' : ''}${Math.round((s.series[4] / s.series[0] - 1) * 100)}%</td></tr>`).join('')}</table>`,
      ) +
      sec(
        3,
        '결과 해석',
        content.detail
          ? `<div class="readbox read"><p>${content.detail}</p></div>`
          : `<div class="readbox read"><p>목표 ${fmt(p.target)}명은 유사 축제 중위값 ${fmt(v.median)}명의 <strong>${round1(v.ratio)}배</strong>, 최고 실적 ${fmt(v.top)}명과 비교하면 ${round1(p.target / v.top)}배입니다. ${v.ratio > 1.3 ? '같은 주제·규모대에서 실제로 관측된 적 없는 수준이므로, 이 수치를 전제로 한 예산·인력·안전 계획은 근거가 약합니다.' : v.ratio < 0.8 ? '실제 관측 범위의 하단이라 달성 가능성은 높지만, 사업 규모를 설명할 때 근거가 약해질 수 있습니다.' : '실제 관측 범위 안에 있어 예산·운영 계획의 근거로 사용할 수 있습니다.'}</p><p>유사 축제군은 최근 4년간 연평균 ${(v.simCagr * 100).toFixed(1)}% ${v.simCagr > 0 ? '성장' : '감소'}했습니다. ${p.eventType === 'new' ? '다만 이번 기획안은 신규 개최로, 기존 축제의 반복 방문 기반이 없다는 점을 감안해야 합니다.' : '기존 개최 축제는 반복 방문 기반이 형성되어 있습니다.'}</p></div>`,
      ) +
      sec(
        4,
        '권장 수정사항',
        recs(content.recommendations || [
          {
            p: v.ratio > 1.3 ? 1 : 3,
            t: `1차 목표를 ${fmt(v.rec1.first)}명 수준으로 조정`,
            d: `유사 축제 중위값 ${fmt(v.median)}명에 성장률을 반영한 값입니다. 예산·안전·인력 계획의 기준선을 이 값으로 잡으면 근거를 설명할 수 있습니다.`,
            e: `현재 목표 대비 ${fmt(p.target - v.rec1.first)}명 차이`,
          },
          {
            p: 2,
            t: `확장 목표 ${fmt(v.rec1.stretch)}명은 조건부로 분리 표기`,
            d: '셔틀 확보·숙박 연계·광역 홍보 등 선행 조건이 충족될 때만 도달 가능한 값으로 별도 관리하고, 기본 계획은 1차 목표로 수립합니다.',
          },
          {
            p: 3,
            t: '집계 기준을 기획안에 명시',
            d: '유사 축제 실적은 대부분 유동인구 추정 기반입니다. 이번 축제의 집계 방식(통신사 유동인구 / 입장 게이트 / 주차 대수 환산)을 미리 정해야 개최 후 비교가 가능합니다.',
          },
        ]),
      ) +
      `<p class="note">이 항목은 목표값의 타당성만 검토합니다. 수요 예측값을 산출하거나 예산 규모를 산정하지 않습니다.</p>`
    )
  }
  if (item.key === 'trend') {
    const hasServerTrend = Boolean(A.server?.items?.TREND_FIT)
    const trendYears = hasServerTrend
      ? Array.isArray(T.years)
        ? T.years
        : []
      : Array.isArray(T.years) && T.years.length
        ? T.years
        : YEARS
    const trendValues = Array.isArray(T.series) ? T.series : []
    const firstYear = T.firstYear ?? trendYears[0] ?? '-'
    const latestYear = T.latestYear ?? trendYears[trendValues.length - 1] ?? '-'
    const firstInterest = T.firstInterest ?? trendValues[0] ?? null
    const latestInterest =
      T.latestInterest !== undefined
        ? T.latestInterest
        : trendValues[trendValues.length - 1] ?? null
    const displayInterest = (value) =>
      value === null || value === undefined || !Number.isFinite(Number(value)) ? '-' : value
    const endpointChange =
      firstInterest === null ||
      latestInterest === null ||
      firstInterest === 0 ||
      !Number.isFinite(Number(firstInterest)) ||
      !Number.isFinite(Number(latestInterest))
        ? '-'
        : `${latestInterest >= firstInterest ? '+' : ''}${Math.round((latestInterest / firstInterest - 1) * 100)}%`
    const displayCagr =
      v.tCagr === null || v.tCagr === undefined || !Number.isFinite(Number(v.tCagr))
        ? '-'
        : `${v.tCagr > 0 ? '+' : ''}${(v.tCagr * 100).toFixed(1)}<small>%</small>`
    const displayCagrText =
      v.tCagr === null || v.tCagr === undefined || !Number.isFinite(Number(v.tCagr))
        ? '-'
        : `${v.tCagr > 0 ? '+' : ''}${(v.tCagr * 100).toFixed(1)}%`
    const interestChangePercent = (row) => {
      if (
        row.firstInterest === null ||
        row.latestInterest === null ||
        row.firstInterest === 0 ||
        !Number.isFinite(Number(row.firstInterest)) ||
        !Number.isFinite(Number(row.latestInterest))
      )
        return null
      return Math.round((row.latestInterest / row.firstInterest - 1) * 100)
    }
    const rise = T.detail.filter((d) => d.d === '상승')
    const fall = T.detail.filter((d) => d.d === '하락')
    return (
      sec(
        1,
        '핵심 지표',
        `<div class="metricrow c3">${mt(`${latestYear} 관심도 지수`, displayInterest(latestInterest), `${firstYear}년 대비 ${endpointChange}`, true)}${mt('연평균 증감률', displayCagr, `${firstYear}~${latestYear}년 CAGR`)}${mt('추이 판단', v.v2, `${v.s2}점 / 100`)}</div>`,
      ) +
      sec(
        2,
        '판단 근거 및 데이터',
        `<div class="vizbox">${lineChart(trendYears, [{ v: trendValues, c: v.v2 === '하락' ? '#C2634C' : '#12557E', area: true, last: latestInterest === null ? null : displayInterest(latestInterest) }], { max: 110, preserveNulls: true })}<p class="vizcap">주제 키워드군(${T.kw})의 통합 검색 관심도. 최댓값 100 기준 상대 지수입니다.</p></div><table class="dt" style="margin-top:12px"><tr><th>세부 키워드</th><th class="n">${firstYear}</th><th class="n">${latestYear}</th><th>추이</th></tr>${T.detail.map((d) => `<tr><td>${d.k}</td><td class="n" style="color:var(--muted)">${displayInterest(d.firstInterest)}</td><td class="n"><b>${displayInterest(d.latestInterest)}</b></td><td><span class="tagsm ${d.d === '상승' ? 'g' : d.d === '하락' ? 'r' : 'n'}">${d.d}</span></td></tr>`).join('')}</table><p class="vizcap" style="margin-top:9px">핵심 프로그램에 포함된 요소별로 관심 흐름이 다릅니다. 같은 주제 안에서도 상승 키워드와 하락 키워드를 구분해 배치 비중을 정하는 근거로 사용합니다.</p>`,
      ) +
      sec(
        3,
        '결과 해석',
        content.detail
          ? `<div class="readbox read"><p>${content.detail}</p></div>`
          : `<div class="readbox read"><p>${T.name} 주제는 최근 ${firstYear}~${latestYear}년 연평균 ${displayCagrText} ${v.tCagr === null || v.tCagr === undefined ? '증감률을 계산할 수 없어' : v.tCagr > 0 ? '상승해' : '하락해'} <strong>${v.v2}</strong> 흐름으로 판단했습니다.</p><p>${rise.length ? `세부 키워드 중 ${rise.map((d) => d.k).join(', ')}이(가) 상승 폭이 큽니다. ` : ''}${fall.length ? `반대로 ${fall.map((d) => d.k).join(', ')}은(는) 하락 구간에 들어섰습니다. ` : ''}${rise.some((d) => d.d.includes('확산')) ? '다만 급상승 키워드는 전국 도입이 빠르게 늘어 차별화 효과가 줄어드는 구간입니다.' : !rise.length && !fall.length ? '세부 키워드 간 편차는 크지 않습니다.' : ''}</p></div>`,
      ) +
      sec(
        4,
        '기획 제안',
        recs(content.recommendations || [
          ...rise.slice(0, 1).map((d) => ({
            p: 2,
            t: `${d.k}을(를) 대표 프로그램으로 전면 배치`,
            d: `${interestChangePercent(d) === null ? '관심도 변화율을 계산할 수 없는' : `${Math.abs(interestChangePercent(d))}% 상승한`} 키워드입니다. 홍보 문구와 대표 이미지의 기준을 이 요소로 맞추면 검색 유입과 기획 내용이 일치합니다.`,
          })),
          ...T.detail
            .filter((d) => d.d.includes('확산'))
            .map((d) => ({
              p: 2,
              t: `${d.k}은(는) 차별화 요소가 아닌 기본 연출로 취급`,
              d: '전국 도입이 빠르게 늘어 단독 홍보 포인트로는 변별력이 낮습니다. 예산 비중을 줄이고 대표 프로그램의 보조 연출로 배치하는 편이 효율적입니다.',
            })),
          ...fall.slice(0, 1).map((d) => ({
            p: d.latestInterest !== null && d.latestInterest < 60 ? 1 : 3,
            t: `${d.k} 비중 축소 검토`,
            d: `${interestChangePercent(d) === null ? '관심도 변화율을 계산할 수 없습니다' : `관심도가 ${Math.abs(interestChangePercent(d))}% 감소했습니다`}. 유지하려면 체험형·야간형으로 형식을 바꾸는 전제가 필요합니다.`,
          })),
          {
            p: 3,
            t: '개최 월의 계절 요인은 별도 항목에서 확인',
            d: '이 항목은 주제 관심도의 시간 흐름만 봅니다. 개최 시기가 적절한지는 지역·시기 관광수요 적합성에서 판단합니다.',
          },
        ]),
      ) +
      `<p class="note">트렌드 핏은 개최 월의 계절성 자체를 평가 기준에 포함하지 않습니다.</p>`
    )
  }
  if (item.key === 'demand') {
    const ac = R.access
    const hasServerDemand = Boolean(A.server?.items?.DEMAND_FIT)
    const eventMonth = hasServerDemand ? R.eventMonth : R.eventMonth ?? m + 1
    const eventMonthIndex = eventMonth === null || eventMonth === undefined ? -1 : eventMonth - 1
    const weeklyData = hasServerDemand
      ? Array.isArray(R.weeklyVisitorData)
        ? R.weeklyVisitorData
        : []
      : weeklyVisitorData
    const weeklyPeak = hasServerDemand ? R.weeklyVisitorPeak : weeklyVisitorPeak
    const weeklyUnit = hasServerDemand ? R.weeklyDemandUnit ?? '명' : R.weeklyDemandUnit || '만 명'
    const weeklyBasis = hasServerDemand
      ? R.weeklyDemandBasis ?? '-'
      : R.weeklyDemandBasis || R.name + ' · 2025년 10월 기준 (예시 데이터)'
    const stationName = hasServerDemand ? ac.station : ac.station ?? '경춘선 가평역'
    const stationDistance = hasServerDemand ? ac.stationDistanceM : ac.stationDistanceM ?? 3200
    const stopName = hasServerDemand ? ac.nearestStopName : ac.nearestStopName ?? '셔틀버스 운행 가능'
    const stopDistance = ac.nearestStopDistanceM
    const routeCount = ac.routeCount
    const transitSummary =
      '주변 버스정류장 ' +
      displayDemandValue(hasServerDemand ? ac.stopCount500m : ac.stopCount500m ?? 6) +
      '개 · 역 ' +
      displayDemandValue(hasServerDemand ? ac.stationsWithin1Km : ac.stationsWithin1Km ?? 1) +
      '개'
    const stopDetails = [
      stopDistance === null || stopDistance === undefined ? null : `${stopDistance}m`,
      routeCount === null || routeCount === undefined ? null : `노선 ${routeCount}개`,
    ].filter(Boolean)
    const stationSummary =
      (stationName === null || stationName === undefined
        ? '-'
        : stationName +
          (stationDistance === null || stationDistance === undefined
            ? ''
            : ' (약 ' + Math.round(stationDistance / 100) / 10 + 'km)')) +
      '<br />' +
      (stopName === null || stopName === undefined
        ? '-'
        : [stopName, stopDetails.length ? `(${stopDetails.join(' · ')})` : '']
            .filter(Boolean)
            .join(' '))
    const parkingValue = hasServerDemand ? ac.parkingCapacity : ac.parkingCapacity ?? 1150
    const parkingSummary = hasServerDemand
      ? ac.parkingSummary ?? '-'
      : ac.parkingSummary || '권장 1,837면 · 충족률 63%'
    const parkingBasis = hasServerDemand
      ? R.parkingBasis ?? '-'
      : R.parkingBasis || '※ 권장 주차면수는 일평균 30,000명 · 자가용 분담 60% · 동승 2.8명 · 회전율 3.5회를 적용한 값입니다.'
    const baseDemandDisplay =
      R.baseDemand === null || R.baseDemand === undefined
        ? '-'
        : `${displayDemandValue(R.baseDemand)}<small>${R.baseDemandUnit || '/100'}</small>`
    const parkingDisplay =
      parkingValue === null || parkingValue === undefined
        ? '-'
        : `${displayDemandValue(parkingValue)}<small>면</small>`
    const interpretationSummary = hasServerDemand
      ? content.detail ?? '-'
      : content.detail ||
        R.name +
        '의 평상시 관광수요는 ' +
        displayDemandValue(R.baseDemand) +
        '명으로 ' +
        R.baseNote +
        '입니다. 반면 개최 월인 ' +
        displayDemandValue(eventMonth) +
        '월은 지수 ' +
        displayDemandValue(v.mIdx) +
        '로 연중 ' +
        displayDemandValue(v.mRank) +
        '위여서, 시기 선택 자체는 ' +
        (v.mIdx >= 115 ? '유리' : '무난') +
        '합니다.'
    const interpretationDetail =
      hasServerDemand || content.detail
        ? null
        : (v.accScore < 60
        ? '전체 점수를 낮추는 요인은 접근성입니다. 대중교통 ' +
          ac.transitScore +
          '점으로, ' +
          ac.transitNote +
          '. 목표 방문객이 몰리는 피크 시간대에 진입 동선이 병목이 될 수 있습니다.'
        : '접근성도 ' +
          v.accScore +
          '점으로 무리가 없어, 지역·시기 조합에서 큰 제약은 확인되지 않습니다.')
    const recommendationList = hasServerDemand ? content.recommendations ?? [] : content.recommendations || null
    return (
      sec(
        1,
        '핵심 지표',
        `<div class="metricrow c2">${mt('적합성 점수', `${displayDemandValue(v.s3)}<small>/100</small>`, '평상시 25% · 월별 50% · 접근성 25%', true)}${mt(`${displayDemandValue(eventMonth)}월 관광수요 지수`, displayDemandValue(v.mIdx), `연중 ${displayDemandValue(v.mRank)}위 (연평균 100)`)}${mt('평상시 지역 관광수요', baseDemandDisplay, `${R.annual} · ${R.baseNote}`)}${mt('행사장 접근성', `${v.accScore}<small>/100</small>`, `대중교통 ${ac.transitScore} · ${ac.transitNote}`)}</div>`,
      ) +
      sec(
        2,
        '판단 근거 및 데이터',
        `<div class="vizbox">${vBars(MONTHS, R.monthly, eventMonthIndex, { ref: 100, refLabel: '연평균 100' })}<p class="vizcap">${R.name}의 최근 5년 월별 관광수요 지수(연평균 100 기준). 개최 월 ${displayDemandValue(eventMonth)}월은 ${displayDemandValue(v.mIdx)}로 연중 ${displayDemandValue(v.mRank)}위입니다.</p></div><div class="vizbox weekly-demand-card"><div class="weekly-demand-head"><h5>직전년도 개최월 주차별 방문객 수</h5><span class="weekly-demand-basis">${weeklyBasis}</span></div><div class="weekly-demand-layout"><div class="weekly-demand-chart"><span class="weekly-demand-unit">(${weeklyUnit})</span>${weeklyBars(weeklyData, weeklyUnit)}</div><div class="weekly-demand-insight"><span class="insight-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 18V11M12 18V6M18 18V9"/></svg></span><p>${weeklyPeak?.label || '-'}의 방문객이 가장 많았습니다. 축제 운영 시 해당 시기의 교통·주차 혼잡에 유의할 필요가 있습니다.</p></div></div></div><div class="access-summary-grid"><div class="access-summary-card transit-summary">${accessIcon('transit')}<div class="access-summary-copy"><div class="access-summary-label">대중교통 접근성</div><div class="access-summary-value">${transitSummary}</div><p>${stationSummary}</p></div></div><div class="access-summary-card parking-summary">${accessIcon('parking')}<div class="access-summary-copy"><div class="access-summary-label">확보 주차면수</div><div class="access-summary-value">${parkingDisplay}</div><p>${parkingSummary}</p></div></div></div><p class="parking-basis">${parkingBasis}</p>`,
      ) +
      sec(
        3,
        '결과 해석',
        `<div class="readbox read"><p>${interpretationSummary}</p>${interpretationDetail ? `<p>${interpretationDetail}</p>` : ''}</div>`,
      ) +
      sec(
        4,
        '권장 수정사항',
        recs(recommendationList || [
          ...(ac.transitScore < 65
            ? [
                {
                  p: 2,
                  t: `${ac.station.split('·')[0].trim()}·터미널 ↔ 행사장 순환 셔틀 운행`,
                  d: '정기 노선이 부족해 대중교통 이용자가 마지막 구간에서 이탈할 수 있습니다. 운행 시간은 야간 프로그램 종료 후 1시간까지 확보해야 체류 시간이 유지됩니다.',
                },
              ]
            : []),
          {
            p: 3,
            t: '수도권 왕복 교통 상품 연계',
            d: `외지인 비율이 ${R.outRatio}%로 높아, 왕복 전세버스·철도 연계 상품을 사전 판매하면 방문 확정 인원을 미리 파악할 수 있습니다.`,
          },
        ]),
      ) +
      `<p class="note">이 항목은 평상시 지역 관광수요와 월별 추이, 접근성만 평가합니다. 특정 개최일에 주변 행사가 겹치는지는 일정 중복·혼잡 리스크에서 별도로 진단합니다.</p>`
    )
  }
  if (item.key === 'overlap') {
    const hasServerConflict = Boolean(A.server?.items?.CONFLICT_RISK?.detail),
      sd = hasServerConflict ? v.targetPeriodStart : dparse(p.start),
      ed = hasServerConflict ? v.targetPeriodEnd : dparse(p.end),
      lvName = { direct: '기간 중복', near: '인접(±3일)', watch: '주의(±7일)' },
      overlapRecs = []
    if (v.best && v.best.w < v.nDirect * 3 + v.nNear)
      overlapRecs.push({
        p: v.nDirect >= 2 ? 1 : 2,
        t: `개최일 ${v.best.off > 0 ? `${v.best.off}일 순연` : `${Math.abs(v.best.off)}일 앞당김`} 검토 (${dfmt(dadd(sd, v.best.off))}~${dfmt(dadd(ed, v.best.off))})`,
        d: `이 구간에서는 기간 직접 중복이 ${v.best.c.filter((x) => x.lv === 'direct').length}건으로 줄어듭니다. 일정 확정 전이라면 가장 비용이 적게 드는 대응입니다.`,
        e: `이력 기준 비교이며, 상대 행사가 일정을 변경할 가능성은 반영되지 않았습니다.${dadd(sd, v.best.off).getMonth() !== sd.getMonth() ? ' 개최 월이 바뀌므로 관광수요·기상 항목을 다시 분석해야 합니다.' : ''}`,
      })
    if (v.nDirect)
      overlapRecs.push({
        p: 1,
        t: '중복 행사와 셔틀·숙박 공동 운영 협의',
        d: `${v.cf
          .filter((c) => c.lv === 'direct')
          .map((c) => c.n)
          .join(
            ', ',
          )}와 권역 순환 셔틀을 공동 운영하면 경합을 연계로 바꿀 수 있습니다. 숙박은 개최 4개월 전 블록 예약으로 객실을 선점해야 합니다.`,
      })
    if (v.nDirect || v.nNear)
      overlapRecs.push({
        p: 2,
        t: '요일 배치 조정으로 피크 분산',
        d: '중복 행사와 주말 피크가 겹치면 혼잡이 집중됩니다. 대표 프로그램을 금요일 야간·일요일 오전으로 분산 배치하면 동시 체류 인원을 낮출 수 있습니다.',
      })
    overlapRecs.push({
      p: 3,
      t: '차별화 지점을 홍보 문구에 명시',
      d: `인접 행사와 방문 목적이 겹치지 않도록, 이번 축제만의 프로그램(${
        A.progs
          .slice(0, 2)
          .map((x) => x.n)
          .join(', ') || '대표 프로그램'
      })을 전면에 배치합니다.`,
    })
    return (
      sec(
        1,
        '핵심 지표',
        `<div class="metricrow c3">${mt('위험 수준', v.v4, '스코어 미반영 진단', true)}${mt('기간 직접 중복', `${v.nDirect}<small>건</small>`, '반경 60km 이내')}${mt('인접 시기 행사', `${v.nNear}<small>건</small>`, '±3일 이내')}</div><div class="metricrow c2" style="margin-top:9px">${mt('숙박 경합 압력', `${v.stayPressure}<small>%</small>`, `중복 행사 숙박 수요 추정 ${fmt(v.rivalStayDemand)}명 / 권역 수용 ${fmt(v.stayRooms * 2.2)}명`)}${mt('검토 범위', `${dfmt(sd)}~${dfmt(ed)}`, '최근 5년 중 3회 이상 개최된 행사만 집계')}</div>`,
      ) +
      sec(
        2,
        '판단 근거 및 데이터',
        v.cf.length
          ? `<div class="vizbox">${gantt(v.cf, sd, ed, p.name || '이번 축제')}<p class="vizcap">진한 막대가 이번 기획안의 개최 기간입니다. 빨간색은 기간이 겹치는 행사, 주황색은 전후 3일 내 인접 행사입니다.</p><div class="legend"><span><i style="background:#12557E"></i>이번 축제</span><span><i style="background:#C2634C"></i>기간 중복</span><span><i style="background:#D8A33F"></i>인접</span><span><i style="background:#B9C7D2"></i>주의 범위</span></div></div><table class="dt" style="margin-top:12px"><tr><th>행사명</th><th>권역</th><th class="n">거리</th><th class="n">규모</th><th>구분</th></tr>${v.cf.map((c) => `<tr class="${c.lv === 'direct' ? 'hit2' : c.lv === 'near' ? 'hit' : ''}"><td><b>${c.n}</b><div style="color:var(--muted);font-size:11px">${dfmt(c.b1)}~${dfmt(c.b2)} · 최근 5년 ${displayConflictValue(c.held, '회')}</div></td><td style="color:var(--muted)">${c.reg}</td><td class="n">${displayConflictValue(c.km, 'km')}</td><td class="n">${displayConflictNumber(c.scale, '명')}</td><td><span class="tagsm ${c.lv === 'direct' ? 'r' : c.lv === 'near' ? 'w' : 'n'}">${lvName[c.lv]}</span></td></tr>`).join('')}</table>`
          : `<div class="vizbox"><p class="read" style="font-size:12.5px">반경 80km · ±7일 범위에서 최근 5년 중 3회 이상 반복 개최된 행사가 확인되지 않았습니다.</p></div>`,
      ) +
      sec(
        3,
        '결과 해석',
        content.detail
          ? `<div class="readbox read"><p>${content.detail}</p></div>`
          : `<div class="readbox read"><p>${v.nDirect ? `개최 기간에 직접 겹치는 행사가 <strong>${v.nDirect}건</strong> 있습니다. 가장 가까운 사례는 ${v.cf[0].n}(${v.cf[0].km}km, 최근 5년 ${v.cf[0].held}회 개최, 규모 ${fmt(v.cf[0].scale)}명)입니다. 같은 권역 방문객이 두 행사로 나뉘고, 숙박·주차·셔틀 인력이 동시에 경합합니다.` : v.nNear ? `기간이 직접 겹치는 행사는 없습니다. 다만 전후 3일 내 ${v.nNear}건이 있어 숙박 예약과 홍보 노출이 분산될 수 있습니다.` : '같은 시기 인접 권역의 반복 개최 행사가 확인되지 않아, 일정 측면의 경합 요인은 낮습니다.'}</p><p>${v.best && v.best.w < v.nDirect * 3 + v.nNear ? `개최일을 ${v.best.off > 0 ? '+' : ''}${v.best.off}일 이동하면 중복 가중치 ${v.nDirect * 3 + v.nNear}에서 ${v.best.w}로 낮아집니다(${dfmt(dadd(sd, v.best.off))}~${dfmt(dadd(ed, v.best.off))}).` : '검토 범위(±14일) 안에서 현재 일정보다 유리한 대체 구간은 확인되지 않았습니다.'}</p></div>`,
      ) +
      sec(4, '권장 수정사항', recs(content.recommendations || overlapRecs)) +
      `<p class="note">이 진단은 행사 이력만으로 판단하며 일반 관광객 수를 기준에 포함하지 않습니다. 흥행 스코어에는 반영되지 않습니다.</p>`
    )
  }
  if (item.key === 'weather') {
    const W = R.weather
    const chartValues =
      Array.isArray(W.weatherMonthlyRain)
        ? W.weatherMonthlyRain
        : W.weatherMonthlyRain === null
          ? []
          : W.rainYears.map((x) => x * 10)
    const occurrenceYears =
      W.occurrenceYears !== undefined ? W.occurrenceYears : W.rainYears[m]
    const actualYears = W.actualYears !== undefined ? W.actualYears : 10
    const weatherInterpretation = content.detail
      ? `<div class="readbox read"><p>${content.detail}</p></div>`
      : `<div class="readbox read"><p>${m + 1}월 동일 시기에 강수가 관측된 해는 최근 ${displayWeatherValue(actualYears, '년')} 중 ${displayWeatherValue(occurrenceYears, '년')}입니다(${displayWeatherValue(v.rainP, '%')}). 선택한 핵심 프로그램과 기상 이력을 결합한 행사 기상 취약도는 <strong>${displayWeatherValue(v.wRisk)}점(${v.v5 || '-'})</strong>입니다.</p><p>${
          v.wFlags.filter((f) => f.risk).length
            ? `특히 ${v.wFlags
                .filter((f) => f.risk)
                .map((f) => f.t)
                .join(
                  ' · ',
                )} 요소가 현재 핵심 프로그램과 직접 맞물립니다. ${v.wFlags.filter((f) => f.risk)[0].p} 계획이 기상 조건에 따라 취소 또는 축소될 수 있습니다.`
            : '현재 핵심 프로그램에서 기상 조건과 직접 충돌하는 요소는 크지 않습니다.'
        }</p></div>`
    return (
      sec(
        1,
        '핵심 지표',
        `<div class="metricrow c2">${mt('행사 기상 취약도', `${displayWeatherValue(v.wRisk)}<small>/100</small>`, '선택 프로그램과 과거 동일 시기 강수 통계 기반', true)}${mt(`${m + 1}월 강수 발생률`, `${displayWeatherValue(v.rainP)}<small>%</small>`, `최근 ${displayWeatherValue(actualYears, '년')} 중 ${displayWeatherValue(occurrenceYears, '년')}`)}</div>`,
      ) +
      sec(
        2,
        '판단 근거 및 데이터',
        `<div class="vizbox">${vBars(MONTHS, chartValues, m, { h: 130 })}<p class="vizcap">${R.name} 월별 강수 발생률(최근 10년 중 강수 관측 연수 × 10%). ${W.note}.</p></div><table class="dt weather-evidence-table" style="margin-top:10px"><tr><th>취약 요소</th><th>발생 이력</th></tr>${v.wFlags.map((f) => `<tr><td><b>${f.t}</b> <span class="tagsm ${f.status === null ? 'n' : f.risk ? 'r' : 'n'}">${f.status === null ? '-' : f.status ?? (f.risk ? '취약' : '해당 없음')}</span><div style="color:var(--muted);font-size:11px;margin-top:2px">${f.p}</div></td><td style="font-size:11.5px">${f.d}</td></tr>`).join('')}</table></div>`,
      ) +
      sec(
        3,
        '결과 해석',
        weatherInterpretation,
      ) +
      sec(
        4,
        '권장 수정사항',
        recs(content.recommendations || [
          ...v.wFlags
            .filter((f) => f.risk)
            .map((f) => ({
              p: f.t === '강수' ? 1 : 2,
              t:
                f.t === '강수'
                  ? '우천 판단 시점과 환불·연기 기준 공지'
                  : f.t === '강풍'
                    ? '풍속 기준과 대체 공연 절차를 사전 확정'
                    : f.t === '안개 · 시정'
                      ? '시정 불량 시 대체 콘텐츠 준비'
                      : '야간 방한 대응 배치',
              d:
                f.t === '강수'
                  ? '유료 프로그램이 있다면 우천 시 연기·환불 기준을 사전 공지해야 민원이 줄어듭니다. 판단 시점은 행사 시작 3시간 전으로 고정하는 방식이 흔합니다.'
                  : `${f.d}. ${f.p}에 대한 대체 운영 절차를 운영 매뉴얼에 미리 넣어 두면 현장 혼선이 줄어듭니다.`,
            })),
        ]),
      ) +
      `<p class="note">이 진단은 미래 날씨를 예측하지 않습니다. 과거 동일 시기 기상 통계와 기획안의 구조적 취약성만 봅니다. 흥행 스코어에는 반영되지 않습니다.</p>`
    )
  }
  if (item.key === 'link' && A.linkage) {
    const L = A.linkage
    const displayCount = (value) => value === null || value === undefined ? '-' : fmt(value)
    const displayPoiDistance = (poi) => {
      if (poi.distanceMeter !== null && poi.distanceMeter !== undefined) {
        return poi.distanceMeter < 1000
          ? `${Math.round(poi.distanceMeter)}m`
          : `${(poi.distanceMeter / 1000).toFixed(1)}km`
      }
      return poi.distanceRange || (poi.distanceKm === null || poi.distanceKm === undefined ? '-' : `${poi.distanceKm}km`)
    }
    const poiTypeLabel = (value) =>
      ({
        TOURIST_ATTRACTION: '관광·문화',
        RESTAURANT: '음식점',
        SHOPPING: '쇼핑',
        ACCOMMODATION: '숙박',
      }[value] || value || '-')
    const categoryRows = [
      ['관광·문화', 'tourismCultureCount'],
      ['음식·쇼핑', 'foodShoppingCount'],
      ['숙박', 'accommodationCount'],
      ['전체', 'totalCount'],
    ].map(([label, key]) => `<tr><td><b>${label}</b></td><td class="n">${displayCount(L.poiSummary.within3km[key])}</td><td class="n">${displayCount(L.poiSummary.between3And5km[key])}</td><td class="n">${displayCount(L.poiSummary.within5km[key])}</td></tr>`).join('')
    const regionalIndicatorCards = [
      [L.regionalIndicators.resourceDemand, L.tourismLinkageSummary],
      [L.regionalIndicators.consumptionIntensity, L.consumptionLinkageSummary],
      [L.regionalIndicators.stayIntensity, L.stayLinkageSummary],
    ].map(([indicator, description]) => mt(
      indicator.name || '-',
      indicator.value === null || indicator.value === undefined ? '-' : indicator.value,
      description || '서버 지역 지표',
    )).join('')
    const poiRows = L.pois.length
      ? L.pois.map((poi) => `<tr><td><b>${poi.name || '-'}</b>${poi.address ? `<div style="color:var(--muted);font-size:11px">${poi.address}</div>` : ''}</td><td><span class="tagsm n">${poiTypeLabel(poi.poiType || poi.category)}</span></td><td class="n">${displayPoiDistance(poi)}</td></tr>`).join('')
      : '<tr><td colspan="3" style="color:var(--muted)">상세 POI 목록이 제공되지 않았습니다.</td></tr>'
    return (
      sec(1, '핵심 지표', `<div class="metricrow c3">${mt('관광 연계 잠재력', `${L.score === null ? '-' : L.score}<small>/100</small>`, '서버 분석 점수', true)}${mt('전체 후보 POI', `${displayCount(L.totalCandidatePoiCount)}<small>곳</small>`, '서버 응답 기준')}${mt('관광·문화 / 음식·쇼핑 / 숙박', `${displayCount(L.tourismCultureCount)} / ${displayCount(L.foodShoppingCount)} / ${displayCount(L.accommodationCount)}<small>곳</small>`, '후보 POI 분류별')}`) +
      sec(2, '판단 근거 및 데이터', `<div class="vizbox"><table class="dt"><tr><th>구분</th><th class="n">3km 이내</th><th class="n">3~5km</th><th class="n">5km 이내</th></tr>${categoryRows}</table></div><table class="dt" style="margin-top:12px"><tr><th>주요 연계 자원</th><th>구분</th><th class="n">거리</th></tr>${poiRows}</table><div class="metricrow c3" style="margin-top:12px">${regionalIndicatorCards}</div>`) +
      sec(3, '결과 해석', `<div class="readbox read"><p>${content.detail || '-'}</p></div>`) +
      sec(4, '권장 수정사항', recs(content.recommendations || [])) +
      '<p class="note">서버가 제공한 거리 구간 집계와 POI 데이터를 표시합니다. 누락된 값은 추정하지 않고 -로 표시합니다.</p>'
    )
  }
  const P = R.poi,
    byType = (t) => R.poiList.filter((x) => x.t === t)
  return (
    sec(
      1,
      '핵심 지표',
      `<div class="metricrow c3">${mt('연계 잠재력', `${v.s6}<small>/100</small>`, v.v6, true)}${mt('반경 15km 관광지', `${P.r15.tour}<small>곳</small>`, `반경 5km ${P.r5.tour}곳`)}${mt('체류 수용률', `${Math.round(v.stayCov)}<small>%</small>`, `객실 ${fmt(P.r15.rooms)}실 기준`)}</div>`,
    ) +
    sec(
      2,
      '판단 근거 및 데이터',
      `<div class="vizbox">${groupBars(
        [
          { n: '관광지', v: [P.r5.tour, P.r15.tour] },
          { n: '음식점 · 상권', v: [P.r5.food, P.r15.food] },
          { n: '숙박', v: [P.r5.stay, P.r15.stay] },
        ],
        ['#12557E', '#A9C9DD'],
      )}<div class="legend"><span><i style="background:#12557E"></i>반경 5km</span><span><i style="background:#A9C9DD"></i>반경 15km</span></div><p class="vizcap">행사장(${p.venue || '미입력'}) 기준 POI 집계입니다.</p></div><table class="dt" style="margin-top:12px"><tr><th>주요 연계 자원</th><th>구분</th><th class="n">거리</th></tr>${R.poiList.map((x) => `<tr><td><b>${x.n}</b><div style="color:var(--muted);font-size:11px">${x.note}</div></td><td><span class="tagsm n">${x.t}</span></td><td class="n">${x.km}km</td></tr>`).join('')}</table><div class="metricrow c3" style="margin-top:11px">${mt('숙박 수용 인원', `${fmt(v.stayCap)}<small>명</small>`, '객실당 2.2명 적용')}${mt('일평균 방문객', `${fmt(A.daily)}<small>명</small>`, `${A.days}일 기준`)}${mt('상권 규모', `${fmt(P.r15.food)}<small>개</small>`, '음식점 · 판매 시설')}</div>`,
    ) +
    sec(
      3,
      '결과 해석',
      content.detail
        ? `<div class="readbox read"><p>${content.detail}</p></div>`
        : `<div class="readbox read"><p>반경 15km 안에 관광지 ${P.r15.tour}곳, 음식점·상권 ${fmt(P.r15.food)}개, 숙박 ${P.r15.stay}곳(객실 ${fmt(P.r15.rooms)}실)이 있습니다. ${byType('관광지')[0] ? `특히 ${byType('관광지')[0].n}(${byType('관광지')[0].km}km)은 ${byType('관광지')[0].note}으로, 축제 주제와 직접 연결할 수 있는 자원입니다.` : ''}</p><p>반면 숙박 수용 인원 ${fmt(v.stayCap)}명은 일평균 방문객 ${fmt(A.daily)}명의 <strong>${Math.round(v.stayCov)}%</strong> 수준입니다. ${v.stayCov < 40 ? '체류형 방문을 늘리려면 객실 외 숙박 자원을 추가로 확보해야 합니다. 현재 구조에서는 당일 방문 중심으로 운영될 가능성이 큽니다.' : '체류형 방문을 흡수할 여력이 있는 편입니다.'}</p></div>`,
    ) +
    sec(
      4,
      '기획 제안',
      recs(content.recommendations || [
        {
          p: 2,
          t: `관광 확장 — ${byType('관광지')[0]?.n || '인근 관광지'} 연계 통합권`,
          d: `축제 입장 또는 프로그램 예약자에게 ${byType('관광지')
            .slice(0, 2)
            .map((x) => x.n)
            .join(
              ' · ',
            )} 할인 통합권을 제공합니다. 방문 동선이 행사장 밖으로 확장되면서 지역 체류 시간이 늘어납니다.`,
          e: `대상 자원: 반경 15km 관광지 ${P.r15.tour}곳`,
        },
        {
          p: 2,
          t: `상권 연계 — ${byType('상권')[0]?.n || '인근 상권'} 야간 영업 연장`,
          d: `행사 기간 중 ${byType('상권')[0]?.n || '인근 상권'} 점포의 영업 시간을 프로그램 종료 시각에 맞춰 연장하고, 축제 팔찌 제시 시 할인·환급을 적용합니다. 소비가 행사장 부스가 아닌 기존 상권으로 흐르게 하는 방식입니다.`,
          e: `대상 규모: 음식점 · 판매 시설 ${fmt(P.r15.food)}개`,
        },
        {
          p: v.stayCov < 40 ? 1 : 3,
          t: '체류 연장 — 1박 2일 코스 상품과 임시 숙박 자원 확보',
          d: `현재 객실 수용률이 ${Math.round(v.stayCov)}%이므로, 정규 숙박만으로는 체류형 수요를 받기 어렵습니다. 캠핑·농가민박·유휴 시설을 한시 등록해 보완하고, 야간 프로그램 + 다음 날 오전 관광지를 묶은 1박 2일 코스를 사전 판매합니다.`,
          e: `부족 추정: 약 ${fmt(Math.max(0, Math.round((A.daily * 0.4 - v.stayCap) / 2.2)))}실`,
        },
      ]),
    ) +
    `<p class="note">관광 연계 잠재력은 흥행 스코어에 반영되지 않는 별도 진단입니다. POI 수와 분포를 근거로 관광 확장 · 상권 연계 · 체류 연장의 세 관점에서 제안합니다.</p>`
  )
}

export function Panel({ item, A, onClose, onEdit, onMove }) {
  if (!item) return null
  const d = cardData(item, A)
  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <aside
        className="panel on"
        aria-hidden="false"
        aria-label={`${item.no}. ${item.name} 상세 분석`}
      >
        <div className="p-head">
          <div className="p-nav">
            <button
              className="iconbtn"
              onClick={() => onMove(-1)}
              disabled={item.index === 0}
              title="이전 항목"
            >
              ‹
            </button>
            <button
              className="iconbtn"
              onClick={() => onMove(1)}
              disabled={item.index === ITEMS.length - 1}
              title="다음 항목"
            >
              ›
            </button>
            <span className="idx">
              {item.index + 1} / {ITEMS.length} 항목
            </span>
            <div className="spacer" />
            <button className="iconbtn" onClick={onClose} title="닫기 (Esc)">
              ×
            </button>
          </div>
          <div className="p-title">
            <div>
              <h2>
                {item.no}. {item.name}
              </h2>
              <p className="p-scope">
                {item.scored ? '흥행 스코어 반영' : '별도 진단'} · {item.scope}
              </p>
            </div>
            <span className={levelClass(d.tone)}>{d.pill}</span>
          </div>
        </div>
        <div
          className="p-body"
          dangerouslySetInnerHTML={{ __html: getDetailHtml(item, A) }}
        />
        <div className="p-foot">
          <Button small primary onClick={onEdit}>
            이 항목 보완하러 가기
          </Button>
          <span className="spacer" />
          <Button small onClick={onClose}>
            닫기
          </Button>
        </div>
      </aside>
    </>
  )
}
