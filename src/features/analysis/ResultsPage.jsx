import { Button } from '../../components/ui'
import { getLevel } from '../../data/prototype'
import { fmt, levelClass } from '../../utils/formatters'
import { ITEMS, cardData } from './analysisData'

function MiniBars({ values = [], highlight = null }) {
  const max = Math.max(...values, 1)
  return (
    <div className="minibars" aria-hidden="true">
      {values.map((v, i) => (
        <i
          key={`${v}-${i}`}
          className={
            highlight === null
              ? i === values.length - 1
                ? 'hi'
                : ''
              : i === highlight
                ? 'hi'
                : ''
          }
          style={{ height: `${Math.max(8, (v / max) * 30)}px` }}
        />
      ))}
    </div>
  )
}
function VisitorBars({ values, maxValue }) {
  const safeValues = values.map((value) => (Number.isFinite(Number(value)) ? Number(value) : null))
  const max = Number.isFinite(Number(maxValue)) && Number(maxValue) > 0
    ? Number(maxValue)
    : Math.max(...safeValues.filter((value) => value !== null), 1)
  return (
    <svg
      className="spark"
      viewBox="0 0 200 30"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x="0"
        y="3"
        width={safeValues[0] === null ? 0 : (safeValues[0] / max) * 200}
        height="9"
        rx="1"
        fill="#CBDCE8"
      />
      <rect
        x="0"
        y="17"
        width={safeValues[1] === null ? 0 : (safeValues[1] / max) * 200}
        height="9"
        rx="1"
        fill="#12557E"
      />
    </svg>
  )
}
function Sparkline({ values, color = '#12557E' }) {
  const max = Math.max(...values),
    min = Math.min(...values) * 0.92,
    pts = values
      .map(
        (v, i) =>
          `${i * (120 / (values.length - 1))},${30 - 2 - ((v - min) / (max - min || 1)) * 24}`,
      )
      .join(' ')
  return (
    <svg
      className="spark"
      viewBox="0 0 120 30"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,30 ${pts} 120,30`} fill={color} opacity=".10" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" />
      <circle
        cx="120"
        cy={
          30 - 2 - ((values[values.length - 1] - min) / (max - min || 1)) * 24
        }
        r="2.6"
        fill={color}
      />
    </svg>
  )
}
function ResultCard({ item, A, onOpen, selected }) {
  const d = cardData(item, A)
  return (
    <button
      className={`card ${selected ? 'sel' : ''}`}
      onClick={() => onOpen(item.key)}
    >
      <div className="card-top">
        <span className="card-name">
          {item.no}. {item.name}
        </span>
        <span className={levelClass(d.tone)}>{d.pill}</span>
      </div>
      <div className="card-metric">
        <b>{d.metric}</b>
        <span>{d.unit}</span>
      </div>
      <div className="card-sub">
        {d.sub.map(([l, v]) => (
          <span key={l}>
            <em>{l}</em> {v}
          </span>
        ))}
      </div>
      {item.key === 'visitor' && (
        <VisitorBars
          values={d.bars}
          maxValue={
            Math.max(
              ...[A.v.median, A.v.targetVisitorCount, A.v.top]
                .filter((value) => Number.isFinite(Number(value)))
                .map(Number),
              1,
            ) * 1.06
          }
        />
      )}
      {item.key === 'trend' && (
        <Sparkline
          values={d.bars}
          color={d.tone === 'r' ? '#C2634C' : '#12557E'}
        />
      )}
      {item.key === 'demand' && (
        <MiniBars values={d.bars} highlight={d.highlight} />
      )}
      {item.key === 'weather' && (
        <MiniBars values={d.bars} highlight={d.highlight} />
      )}
      <div className="card-read">{d.read}</div>
      <div className="card-open">상세 근거 보기</div>
    </button>
  )
}

export function ResultScreen({ A, onEdit, onReport, onOpen, openKey }) {
  const rows = [
    ['목표 방문객 타당성', A.v.s1],
    ['트렌드 핏', A.v.s2],
    ['지역·시기 관광수요', A.v.s3],
  ]
  return (
    <main className="screen active">
      <div className="wrap-wide">
        <div className="plan-bar">
          <div>
            <div className="plan-title">{A.p.name}</div>
            <div className="plan-meta">
              {A.R.name} · {A.p.venue}
              <i>|</i>
              {A.p.start} ~ {A.p.end} ({A.days}일)<i>|</i>목표 {fmt(A.p.target)}
              명<i>|</i>
              {A.T.name}
            </div>
          </div>
          <span className="spacer" />
          <Button small onClick={onEdit}>
            기획안 보완하기
          </Button>
          <Button small primary onClick={onReport}>
            최종 리포트
          </Button>
        </div>
        <div className="scorehead">
          <div className="score-left">
            <span className="lbl">종합 흥행 스코어</span>
            <div className="score-val">
              <b>{A.composite}</b>
              <span>/ 100</span>
            </div>
            <span
              className={`grade pill ${A.composite >= 75 ? 'g' : A.composite >= 62 ? 'w' : 'r'}`}
            >
              등급 {A.grade} · {A.gradeNote}
            </span>
          </div>
          <div className="score-right">
            <div className="rail">
              {rows.map(([l, v]) => (
                <div className="railrow" key={l}>
                  <span className="rn">{l}</span>
                  <span className={`track ${getLevel(v)}`}>
                    <i style={{ width: `${v}%` }} />
                  </span>
                  <span className="rv2">{v}</span>
                </div>
              ))}
            </div>
            <p className="score-note">
              3개 항목의 동일 가중 평균입니다. 별도 진단 3건(일정 중복 {A.v.v4}{' '}
              · 날씨 취약도 {A.v.v5} · 관광 연계 {A.v.v6})은 스코어에 반영되지
              않습니다.
            </p>
          </div>
        </div>
        <Group
          title="흥행 스코어 반영 항목"
          tag="3개 항목 동일 가중"
          items={ITEMS.filter((x) => x.scored)}
          A={A}
          onOpen={onOpen}
          openKey={openKey}
        />
        <Group
          title="별도 진단 및 피드백"
          tag="스코어 미반영 · 운영 판단용"
          items={ITEMS.filter((x) => !x.scored)}
          A={A}
          onOpen={onOpen}
          openKey={openKey}
        />
        <p className="note" style={{ maxWidth: 'none' }}>
          분석 결과는 과거 데이터 기반의 타당성·리스크 진단입니다. 미래 방문객
          수나 흥행 결과를 보장하지 않으며, 행사장 위치·일정·프로그램
          입력이 불완전하면 일부 항목의 정확도가 떨어집니다.
        </p>
      </div>
    </main>
  )
}
function Group({ title, tag, items, A, onOpen, openKey }) {
  return (
    <section className="group">
      <div className="grouphead">
        <h3>{title}</h3>
        <span className="tag">{tag}</span>
        <span className="line" />
      </div>
      <div className="cards">
        {items.map((item) => (
          <ResultCard
            key={item.key}
            item={item}
            A={A}
            onOpen={onOpen}
            selected={openKey === item.key}
          />
        ))}
      </div>
    </section>
  )
}
