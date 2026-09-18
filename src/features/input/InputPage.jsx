import { useState } from 'react'
import {
  FESTIVAL_TYPES,
  getFestivalTopics,
  PROGRAMS,
  REGIONS,
  SAMPLE,
} from '../../data/prototype'
import { Button, Input, WarningNotice } from '../../components/ui'
import {
  VenueLocationCard,
  useVenueLocationSearch,
} from '../venue/VenueLocationSearch'

export function FormScreen({ plan, setPlan, step, setStep, onReview }) {
  const [errors, setErrors] = useState([])
  const venueLocationStatus = useVenueLocationSearch({ plan, setPlan })
  const update = (k, v) => setPlan((p) => ({ ...p, [k]: v }))
  const showVenueCapacityWarning = !String(plan.venueCapacity ?? '').trim()
  const pairs = plan.festivalThemes?.length
    ? plan.festivalThemes
    : [{ type: '', topic: '' }]
  const updateEventType = (eventType) =>
    setPlan((p) => ({
      ...p,
      eventType,
      firstHeldYear: eventType === 'new' ? null : p.firstHeldYear,
    }))
  const updatePair = (index, key, value) =>
    setPlan((p) => ({
      ...p,
      festivalThemes: (p.festivalThemes?.length
        ? p.festivalThemes
        : [{ type: '', topic: '' }]
      ).map((pair, i) => {
        if (i !== index) return pair
        if (key !== 'type') return { ...pair, [key]: value }

        const topicIsValid = getFestivalTopics(value).some(
          (topic) => topic.code === pair.topic,
        )
        return {
          ...pair,
          type: value,
          topic: topicIsValid ? pair.topic : '',
        }
      }),
    }))
  const addPair = () =>
    setPlan((p) =>
      p.festivalThemes.length < 2
        ? {
            ...p,
            festivalThemes: [...p.festivalThemes, { type: '', topic: '' }],
          }
        : p,
    )
  const removePair = (index) =>
    setPlan((p) =>
      p.festivalThemes.length > 1
        ? {
            ...p,
            festivalThemes: p.festivalThemes.filter((_, i) => i !== index),
          }
        : p,
    )

  const fillSample = () =>
    setPlan({
      ...SAMPLE,
      target: Number(SAMPLE.target),
      festivalThemes: SAMPLE.festivalThemes.map((pair) => ({ ...pair })),
    })
  const validate = () => {
    const e = []
    if (step >= 1 && !String(plan.planName ?? '').trim()) e.push('기획안명')
    if (step >= 1 && !plan.name.trim()) e.push('축제명')
    if (step >= 1 && !plan.target) e.push('목표 방문객')
    if (step >= 1 && pairs.some((pair) => !pair.type || !pair.topic.trim()))
      e.push('축제 유형 및 주제')
    if (
      step >= 1 &&
      plan.eventType === 'existing' &&
      (!Number.isInteger(Number(plan.firstHeldYear)) ||
        Number(plan.firstHeldYear) < 1000 ||
        Number(plan.firstHeldYear) > new Date().getFullYear())
    )
      e.push('최초 개최 이력(4자리 연도)')
    if (step >= 2 && !plan.venue.trim()) e.push('행사장명')
    if (step >= 2 && !plan.start) e.push('개최 시작일')
    if (step >= 2 && !plan.end) e.push('개최 종료일')
    if (step >= 2 && plan.start && plan.end && plan.end < plan.start)
      e.push('개최 종료일(시작일보다 빠름)')
    if (step >= 3 && !plan.programs.length) e.push('프로그램 구성')
    setErrors(e)
    return !e.length
  }
  const next = () => {
    if (!validate()) return
    step < 3 ? setStep(step + 1) : onReview({ ...plan })
  }
  const toggle = (id) => {
    const programs = plan.programs.includes(id)
      ? plan.programs.filter((x) => x !== id)
      : [...plan.programs, id]
    update('programs', programs)
  }
  const names = ['축제 기본 정보', '개최 일정 · 장소', '프로그램 · 운영']
  return (
    <main className="screen active">
      <div className="wrap">
        <h1 className="page-h">축제 기획안 입력</h1>
        <p className="page-sub page-lead">
          분석에 쓰이는 값만 받습니다. 목표 방문객·개최
          일정·지역·행사장·주제·프로그램 구성이 비면 분석을 실행할 수 없습니다.
        </p>
        <div className="formcard">
          <div className="formhead">
            <div className="steps">
              {names.map((n, i) => (
                <span
                  className={`stepchip ${step === i + 1 ? 'on' : ''} ${step > i + 1 ? 'ok' : ''}`}
                  key={n}
                >
                  <b>{step > i + 1 ? '✓' : i + 1}</b>
                  {n}
                </span>
              ))}
            </div>
            <span className="lbl">{step} / 3 단계</span>
          </div>
          {errors.length > 0 && (
            <div className="alert show">
              <b>분석에 필요한 정보가 비어 있습니다</b>
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {step === 1 && (
            <div className="fieldgrid">
              <Input
                full
                label="기획안명"
                required
                error={errors.includes('기획안명')}
              >
                <input
                  type="text"
                  value={plan.planName}
                  onChange={(e) => update('planName', e.target.value)}
                  placeholder="예: 2026 서울 가을 문화축제 기획안"
                />
              </Input>
              <Input
                full
                label="축제명"
                required
                error={errors.includes('축제명')}
              >
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="예: 영월 가을별빛 야행축제"
                />
              </Input>
              <Input label="주최 기관">
                <input
                  type="text"
                  value={plan.org}
                  onChange={(e) => update('org', e.target.value)}
                  placeholder="예: 강원특별자치도 영월군"
                />
              </Input>
              <Input
                label="개최 형태"
                required
                error={errors.includes('최초 개최 이력(4자리 연도)')}
              >
                <div className="event-type-and-history">
                  <div className="event-type-options">
                    <label
                      className={`event-type-option ${plan.eventType === 'existing' ? 'on' : ''}`}
                    >
                      <input
                        type="radio"
                        name="eventType"
                        value="existing"
                        checked={plan.eventType === 'existing'}
                        onChange={(e) => updateEventType(e.target.value)}
                      />
                      기존 개최
                    </label>
                    <label
                      className={`event-type-option ${plan.eventType === 'new' ? 'on' : ''}`}
                    >
                      <input
                        type="radio"
                        name="eventType"
                        value="new"
                        checked={plan.eventType === 'new'}
                        onChange={(e) => updateEventType(e.target.value)}
                      />
                      신규 개최
                    </label>
                  </div>
                  {plan.eventType === 'existing' && (
                    <div className="event-history-inline">
                      <label htmlFor="firstHeldYear">최초 개최 이력</label>
                      <input
                        id="firstHeldYear"
                        type="number"
                        min="1000"
                        max={new Date().getFullYear()}
                        inputMode="numeric"
                        value={plan.firstHeldYear || ''}
                        onChange={(e) =>
                          update(
                            'firstHeldYear',
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        placeholder="예: 2018"
                      />
                    </div>
                  )}
                </div>
              </Input>
              <Input
                full
                label="축제 유형 및 주제"
                required
                hint="트렌드 핏 분석 기준"
              >
                <div className="theme-pairs">
                  {pairs.map((pair, index) => (
                    <div className="theme-pair" key={`theme-${index}`}>
                      <div className="theme-pair-fields">
                        <select
                          aria-label={`축제 유형 ${index + 1}`}
                          value={pair.type}
                          onChange={(e) =>
                            updatePair(index, 'type', e.target.value)
                          }
                        >
                          <option value="">축제 유형 선택</option>
                          {Object.entries(FESTIVAL_TYPES).map(
                            ([key, { label }]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                        <select
                          aria-label={`축제 주제 ${index + 1}`}
                          value={pair.topic}
                          disabled={!pair.type}
                          onChange={(e) =>
                            updatePair(index, 'topic', e.target.value)
                          }
                        >
                          <option value="">
                            {pair.type
                              ? '축제 주제 선택'
                              : '먼저 축제 유형을 선택하세요'}
                          </option>
                          {getFestivalTopics(pair.type).map(
                            ({ code, label }) => (
                              <option key={code} value={code}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      {index === 0 && (
                        <Button
                          type="button"
                          small
                          onClick={addPair}
                          disabled={pairs.length >= 2}
                          aria-label="축제 유형 및 주제 추가"
                        >
                          +
                        </Button>
                      )}
                      {index > 0 && (
                        <Button
                          type="button"
                          small
                          onClick={() => removePair(index)}
                          aria-label={`축제 유형 및 주제 ${index + 1} 삭제`}
                        >
                          −
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Input>
              <Input
                label="목표 방문객"
                required
                hint="전체 기간 누적"
                error={errors.includes('목표 방문객')}
              >
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={plan.target || ''}
                  onChange={(e) => update('target', Number(e.target.value))}
                  placeholder="120000"
                />
              </Input>
            </div>
          )}
          {step === 2 && (
            <div className="fieldgrid event-place-grid">
              <Input label="개최 지역" required>
                <select
                  value={plan.region}
                  onChange={(e) => update('region', e.target.value)}
                >
                  {Object.entries(REGIONS).map(([k, r]) => (
                    <option key={k} value={k}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Input>
              <Input label="행사장 유형">
                <select
                  value={plan.venueType}
                  onChange={(e) => update('venueType', e.target.value)}
                >
                  <option value="outdoor">야외 (하천변·광장·공원)</option>
                  <option value="mixed">혼합 (야외 + 실내 시설)</option>
                  <option value="indoor">실내 중심</option>
                </select>
              </Input>
              <Input
                full
                label="행사장명"
                required
                error={errors.includes('행사장명')}
              >
                <input
                  type="text"
                  value={plan.venue}
                  onChange={(e) => update('venue', e.target.value)}
                  placeholder="예: 동강둔치공원"
                />
              </Input>
              <Input full label="행사장 수용 규모" hint="최대 수용 인원 기준">
                <input
                  type="text"
                  value={plan.venueCapacity || ''}
                  onChange={(e) => update('venueCapacity', e.target.value)}
                  placeholder="예: 500명, 500~1,000명, 미정"
                />
                {showVenueCapacityWarning && (
                  <div className="capacity-warnings">
                    <WarningNotice>
                      기획안에서 수용 규모가 확인되지 않았습니다.
                      <br />
                      예상 수용 규모를 직접 입력해주세요.
                    </WarningNotice>
                    <WarningNotice>
                      <strong>입력이 어려운 경우</strong>
                      <br />
                      정확한 수치를 모르는 경우, 예상 범위를 입력하거나 '미정'으로
                      표시해도 분석이 가능합니다.
                      <br />
                      (단, 수용 규모가 없을 경우 일부 분석의 정확도가 낮아질 수
                      있습니다.)
                    </WarningNotice>
                  </div>
                )}
              </Input>
              <VenueLocationCard
                location={plan.venueLocation}
                status={venueLocationStatus}
              />
              <Input
                label="개최 시작일"
                required
                error={errors.includes('개최 시작일')}
              >
                <input
                  type="date"
                  value={plan.start}
                  onChange={(e) => update('start', e.target.value)}
                />
              </Input>
              <Input
                label="개최 종료일"
                required
                error={errors.includes('개최 종료일')}
              >
                <input
                  type="date"
                  value={plan.end}
                  onChange={(e) => update('end', e.target.value)}
                />
              </Input>
            </div>
          )}
          {step === 3 && (
            <div className="fieldgrid">
              <Input
                full
                label="프로그램 구성"
                required
                hint="하나 이상 선택"
                error={errors.includes('프로그램 구성')}
              >
                <div className="chips">
                  {PROGRAMS.map((p) => (
                    <label
                      className={`chk ${plan.programs.includes(p.id) ? 'on' : ''}`}
                      key={p.id}
                    >
                      <input
                        type="checkbox"
                        checked={plan.programs.includes(p.id)}
                        onChange={() => toggle(p.id)}
                      />
                      {p.n}
                    </label>
                  ))}
                </div>
              </Input>
            </div>
          )}
          <div className="formfoot">
            <Button
              onClick={() => setStep(Math.max(1, step - 1))}
              style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            >
              이전
            </Button>
            <span className="spacer" />
            <Button
              ghost
              small
              onClick={() => {
                fillSample()
                setErrors([])
              }}
            >
              예시 기획안 채우기
            </Button>
            <Button primary onClick={next}>
              {step === 3 ? '입력 확인' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
