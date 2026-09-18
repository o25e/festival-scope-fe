import { useState } from 'react'
import {
  FESTIVAL_TYPES,
  getFestivalTopics,
  PROGRAMS,
  REGION_OPTIONS,
} from '../../data/prototype'
import { Button, Input, WarningNotice } from '../../components/ui'
import {
  VenueLocationCard,
  useVenueLocationSearch,
} from '../venue/VenueLocationSearch'

const MAX_PROGRAM_NAMES = 5

const normalizeProgramName = (value) =>
  String(value ?? '').trim().replace(/\s+/g, ' ')

const getProgramNamesForPlan = (plan) => {
  if (Array.isArray(plan.programNames)) return plan.programNames
  return PROGRAMS.filter((program) => (plan.programs || []).includes(program.id)).map(
    (program) => program.n,
  ).slice(0, MAX_PROGRAM_NAMES)
}

const getProgramCandidatesForPlan = (plan) =>
  Array.isArray(plan.programCandidates)
    ? plan.programCandidates
    : getProgramNamesForPlan(plan)

const getCustomProgramNamesForPlan = (plan) =>
  Array.isArray(plan.customProgramNames) ? plan.customProgramNames : []

const getKnownProgramIds = (programNames) => {
  const normalizedNames = new Set(programNames.map(normalizeProgramName).filter(Boolean))
  return PROGRAMS.filter((program) =>
    normalizedNames.has(normalizeProgramName(program.n)),
  ).map((program) => program.id)
}

export function FormScreen({
  plan,
  setPlan,
  step,
  setStep,
  onReview,
  autoFilledFields = {},
  setAutoFilledFields,
}) {
  const [errors, setErrors] = useState([])
  const [isAddingProgram, setIsAddingProgram] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')
  const venueLocationStatus = useVenueLocationSearch({ plan, setPlan })
  const update = (k, v) => setPlan((p) => ({ ...p, [k]: v }))
  const sidoOptions = [
    ...new Set([...REGION_OPTIONS.map((option) => option.sido), plan.sido].filter(Boolean)),
  ]
  const sigunguOptions = REGION_OPTIONS.filter(
    (option) => option.sido === plan.sido,
  )
  const showCapacityWarning = plan.maxCapacity === null || plan.maxCapacity === ''
  const pairs = plan.festivalThemes?.length
    ? plan.festivalThemes
    : [{ type: '', topic: '' }]
  const programNames = getProgramNamesForPlan(plan)
  const programCandidates = getProgramCandidatesForPlan(plan)
  const customProgramNames = getCustomProgramNamesForPlan(plan)
  const updateEventType = (eventType) => {
    setPlan((p) => ({
      ...p,
      eventType,
      firstHeldYear: eventType === 'new' ? null : p.firstHeldYear,
    }))
    if (eventType === 'new') setAutoFilledFields?.((current) => {
      if (!current.firstHeldYear) return current
      const next = { ...current }
      delete next.firstHeldYear
      return next
    })
  }
  const updatePair = (index, key, value) => {
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
  }
  const updateSido = (sido) => {
    setPlan((p) => ({
      ...p,
      sido,
      sigungu: REGION_OPTIONS.some(
        (option) => option.sido === sido && option.sigungu === p.sigungu,
      )
        ? p.sigungu
        : '',
    }))
  }
  const updateCapacity = (value) => {
    if (value === '') {
      update('maxCapacity', '')
      return
    }
    const number = Number(value)
    if (Number.isInteger(number) && number >= 0) update('maxCapacity', number)
  }
  const addPair = () => {
    setPlan((p) =>
      p.festivalThemes.length < 2
        ? {
            ...p,
            festivalThemes: [...p.festivalThemes, { type: '', topic: '' }],
          }
        : p,
    )
  }
  const removePair = (index) => {
    setPlan((p) =>
      p.festivalThemes.length > 1
        ? {
            ...p,
            festivalThemes: p.festivalThemes.filter((_, i) => i !== index),
          }
        : p,
    )
  }

  const validate = () => {
    const e = []
    if (step >= 1 && !String(plan.planName ?? '').trim()) e.push('기획안명')
    if (step >= 1 && !String(plan.name ?? '').trim()) e.push('축제명')
    if (step >= 1 && !String(plan.org ?? '').trim()) e.push('주최 기관')
    if (step >= 1 && !plan.target) e.push('목표 방문객')
    if (
      step >= 1 &&
      pairs.some((pair) => !pair.type || !String(pair.topic ?? '').trim())
    )
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
    if (step >= 2 && !String(plan.sido ?? '').trim()) e.push('시도')
    if (step >= 2 && !String(plan.sigungu ?? '').trim()) e.push('시군구')
    if (
      step >= 2 &&
      plan.maxCapacity !== null &&
      plan.maxCapacity !== '' &&
      (!Number.isInteger(Number(plan.maxCapacity)) || Number(plan.maxCapacity) < 0)
    )
      e.push('최대 수용 인원')
    if (step >= 2 && !plan.start) e.push('개최 시작일')
    if (step >= 2 && !plan.end) e.push('개최 종료일')
    if (step >= 2 && plan.start && plan.end && plan.end < plan.start)
      e.push('개최 종료일(시작일보다 빠름)')
    setErrors(e)
    return !e.length
  }
  const next = () => {
    if (!validate()) return
    step < 3 ? setStep(step + 1) : onReview({ ...plan })
  }
  const updateSelectedProgramNames = (nextProgramNames) => {
    const names = nextProgramNames
      .map(normalizeProgramName)
      .filter(Boolean)
      .slice(0, MAX_PROGRAM_NAMES)
    const programs = getKnownProgramIds(names)

    setPlan((current) => ({
      ...current,
      programNames: names,
      programs,
    }))
  }
  const toggleProgram = (programName) => {
    if (programNames.includes(programName)) {
      updateSelectedProgramNames(programNames.filter((name) => name !== programName))
      return
    }
    if (programNames.length >= MAX_PROGRAM_NAMES) return
    updateSelectedProgramNames([...programNames, programName])
  }
  const addProgramCandidate = () => {
    const normalizedName = normalizeProgramName(newProgramName)
    if (!normalizedName) return

    setPlan((current) => {
      const candidates = getProgramCandidatesForPlan(current)
      if (candidates.some((candidate) => normalizeProgramName(candidate) === normalizedName)) {
        return current
      }
      return {
        ...current,
        programCandidates: [...candidates, normalizedName],
        customProgramNames: [
          ...getCustomProgramNamesForPlan(current),
          normalizedName,
        ],
      }
    })
    setNewProgramName('')
    setIsAddingProgram(false)
  }
  const removeProgramCandidate = (programName) => {
    const normalizedName = normalizeProgramName(programName)
    setPlan((current) => {
      const candidates = getProgramCandidatesForPlan(current).filter(
        (candidate) => normalizeProgramName(candidate) !== normalizedName,
      )
      const customNames = getCustomProgramNamesForPlan(current).filter(
        (candidate) => normalizeProgramName(candidate) !== normalizedName,
      )
      const selectedNames = getProgramNamesForPlan(current).filter(
        (candidate) => normalizeProgramName(candidate) !== normalizedName,
      )

      return {
        ...current,
        programCandidates: candidates,
        customProgramNames: customNames,
        programNames: selectedNames,
        programs: getKnownProgramIds(selectedNames),
      }
    })
  }
  const names = ['축제 기본 정보', '개최 일정 · 장소', '프로그램 · 운영']
  return (
    <main className="screen active">
      <div className="wrap">
        <h1 className="page-h">축제 기획안 입력</h1>
        <p className="page-sub page-lead">
          분석에 쓰이는 값만 받습니다. 목표 방문객·개최
          일정·지역·행사장·주제가 비면 분석을 실행할 수 없습니다.
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
                auto={autoFilledFields.planName}
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
                auto={autoFilledFields.name}
                error={errors.includes('축제명')}
              >
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="예: 영월 가을별빛 야행축제"
                />
              </Input>
              <Input
                label="주최 기관"
                auto={autoFilledFields.org}
                error={errors.includes('주최 기관')}
              >
                <input
                  type="text"
                  value={plan.org}
                  onChange={(e) => update('org', e.target.value)}
                  placeholder="예: 강원특별자치도 영월군"
                />
              </Input>
              <Input
                label="개최 형태"
                auto={autoFilledFields.eventType}
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
                      <label htmlFor="firstHeldYear">
                        최초 개최 이력{' '}
                        {autoFilledFields.firstHeldYear && (
                          <span className="auto">AUTO</span>
                        )}
                      </label>
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
                auto={autoFilledFields.festivalThemes}
                hint="트렌드 핏 분석 기준"
                error={errors.includes('축제 유형 및 주제')}
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
                auto={autoFilledFields.target}
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
              <Input
                label="시도"
                auto={autoFilledFields.sido}
                error={errors.includes('시도')}
              >
                <select
                  value={plan.sido || ''}
                  onChange={(e) => updateSido(e.target.value)}
                >
                  <option value="">시도를 선택하세요</option>
                  {sidoOptions.map((sido) => (
                    <option key={sido} value={sido}>
                      {sido}
                    </option>
                  ))}
                </select>
              </Input>
              <Input
                label="시군구"
                auto={autoFilledFields.sigungu}
                error={errors.includes('시군구')}
              >
                <select
                  value={plan.sigungu || ''}
                  onChange={(e) => update('sigungu', e.target.value)}
                  disabled={!plan.sido}
                >
                  <option value="">
                    {plan.sido ? '시군구를 선택하세요' : '시도를 먼저 선택하세요'}
                  </option>
                  {sigunguOptions.map((option) => (
                    <option key={`${option.sido}-${option.sigungu}`} value={option.sigungu}>
                      {option.sigungu}
                    </option>
                  ))}
                  {plan.sigungu &&
                    !sigunguOptions.some((option) => option.sigungu === plan.sigungu) && (
                      <option value={plan.sigungu}>{plan.sigungu}</option>
                    )}
                </select>
              </Input>
              <Input label="행사장 유형" auto={autoFilledFields.venueType}>
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
                auto={autoFilledFields.venue}
                error={errors.includes('행사장명')}
              >
                <input
                  type="text"
                  value={plan.venue}
                  onChange={(e) => update('venue', e.target.value)}
                  placeholder="예: 동강둔치공원"
                />
              </Input>
              <Input
                full
                label="행사장 수용 규모"
                auto={autoFilledFields.maxCapacity}
                hint="최대 수용 인원 기준"
                error={errors.includes('최대 수용 인원')}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={plan.maxCapacity ?? ''}
                  onChange={(e) => updateCapacity(e.target.value)}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
                  }}
                  placeholder="예: 500"
                />
                {showCapacityWarning && (
                  <div className="capacity-warnings">
                    <WarningNotice>
                      기획안에서 행사장 수용 규모가 확인되지 않았습니다.
                      <br />
                      예상 최대 인원을 숫자로 입력해주세요. 모르면 비워둘 수 있습니다.
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
                auto={autoFilledFields.start}
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
                auto={autoFilledFields.end}
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
                label="핵심 프로그램"
                auto={autoFilledFields.programCandidates}
                hint="후보 중 최대 5개 선택"
              >
                <div className="program-candidate-list">
                  <div className="chips">
                    {programCandidates.map((programName) => {
                      const selected = programNames.includes(programName)
                      const disabled = !selected && programNames.length >= MAX_PROGRAM_NAMES
                      const isCustom = customProgramNames.some(
                        (candidate) => normalizeProgramName(candidate) === normalizeProgramName(programName),
                      )
                      return (
                        <div
                          className={`program-candidate-item ${isCustom ? 'custom' : ''} ${selected ? 'on' : ''}`}
                          key={programName}
                        >
                          <label
                            className={`chk ${selected ? 'on' : ''} ${disabled ? 'disabled' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={disabled}
                              onChange={() => toggleProgram(programName)}
                            />
                            {programName}
                          </label>
                          {isCustom && (
                            <button
                              type="button"
                              className="program-remove-button"
                              onClick={() => removeProgramCandidate(programName)}
                              aria-label={`${programName} 후보 삭제`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {!isAddingProgram ? (
                    <Button
                      type="button"
                      small
                      className="program-add-button"
                      onClick={() => setIsAddingProgram(true)}
                      aria-label="핵심 프로그램 후보 추가"
                    >
                      +
                    </Button>
                  ) : (
                    <div className="program-add-row">
                      <input
                        type="text"
                        value={newProgramName}
                        onChange={(event) => setNewProgramName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') addProgramCandidate()
                          if (event.key === 'Escape') {
                            setNewProgramName('')
                            setIsAddingProgram(false)
                          }
                        }}
                        placeholder="예: 버스킹 공연"
                        aria-label="추가할 핵심 프로그램 후보"
                        autoFocus
                      />
                      <Button type="button" small onClick={addProgramCandidate}>
                        추가
                      </Button>
                      <Button
                        type="button"
                        small
                        onClick={() => {
                          setNewProgramName('')
                          setIsAddingProgram(false)
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  )}
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
            <Button primary onClick={next}>
              {step === 3 ? '입력 확인' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
