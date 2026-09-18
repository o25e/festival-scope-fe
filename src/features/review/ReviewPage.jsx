import { Button } from '../../components/ui'
import {
  getFestivalTopicLabel,
  getFestivalTypeLabel,
  PROGRAMS,
} from '../../data/prototype'
import { fmt } from '../../utils/formatters'

const themeLabel = (pair) =>
  `${getFestivalTypeLabel(pair.type)} · ${getFestivalTopicLabel(pair.type, pair.topic)}`
const eventTypeLabel = (eventType) =>
  eventType === 'new' ? '신규 개최' : '기존 개최'

export function ReviewScreen({
  plan,
  onEdit,
  onAnalyze,
  isSubmitting = false,
  error = '',
}) {
  const regionName = [plan.sido, plan.sigungu].filter(Boolean).join(' ') || '미입력',
    days = Math.max(
      1,
      Math.round((new Date(plan.end) - new Date(plan.start)) / 86400000) + 1,
    )
  const rows = [
    ['기획안명', plan.planName],
    ['축제명', plan.name],
    ['주최 기관', plan.org ? plan.org : <small>미입력</small>],
    [
      '축제 유형 및 주제',
      <div className="review-themes">
        {plan.festivalThemes.map((pair, index) => (
          <div key={`review-theme-${index}`}>
            {index + 1}. {themeLabel(pair)}
          </div>
        ))}
      </div>,
    ],
    [
      '개최 형태',
      <>
        {eventTypeLabel(plan.eventType)}
        {plan.eventType === 'existing' && plan.firstHeldYear ? (
          <small> · 최초 개최 {plan.firstHeldYear}년</small>
        ) : null}
      </>,
    ],
    [
      '목표 방문객',
      <>
        {fmt(plan.target)}명 <small>· 일평균 {fmt(plan.target / days)}명</small>
      </>,
    ],
    [
      '개최 일정',
      <>
        {plan.start} ~ {plan.end} <small>· {days}일</small>
      </>,
    ],
    ['개최 지역', regionName],
    [
      '행사장',
      <>
        {plan.venue}{' '}
        <small>
          ·{' '}
          {plan.venueType === 'outdoor'
            ? '야외'
            : plan.venueType === 'mixed'
              ? '혼합'
              : '실내 중심'}
        </small>
      </>,
    ],
    [
      '행사장 수용 규모',
      plan.maxCapacity === null || plan.maxCapacity === '' || plan.maxCapacity === undefined
        ? '미정'
        : `${fmt(plan.maxCapacity)}명`,
    ],
    [
      '핵심 프로그램',
      (Array.isArray(plan.programNames) ? plan.programNames : PROGRAMS.filter((p) => plan.programs.includes(p.id)).map((p) => p.n))
        .filter((programName) => String(programName).trim())
        .join(', ') || '선택 없음',
    ],
  ]
  return (
    <main className="screen active">
      <div className="wrap">
        <h1 className="page-h">입력 정보 확인</h1>
        <p className="page-sub page-lead">
          이 값으로 6개 항목을 분석합니다. 값이 바뀌면 결과도 바뀝니다.
        </p>
        <div className="formcard">
          <div className="formhead">
            <h3 className="sec-h">{plan.planName}</h3>
            <Button small onClick={onEdit}>
              기획안 수정
            </Button>
          </div>
          <div className="reviewgrid">
            {rows.map(([l, v]) => (
              <div className="rv" key={l}>
                <div className="lbl">{l}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
          {error && (
            <div className="alert show" role="alert">
              {error}
            </div>
          )}
          <div className="formfoot">
            <span className="lbl">
              분석은 과거 데이터 기반의 타당성·리스크 진단이며 미래 흥행을
              보장하지 않습니다.
            </span>
            <span className="spacer" />
            <Button
              primary
              onClick={onAnalyze}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              분석 실행
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
