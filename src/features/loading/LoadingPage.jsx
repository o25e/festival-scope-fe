import { useEffect, useRef, useState } from 'react'
import { ANALYSIS_STEPS } from '../../data/prototype'

export function LoadingScreen({ plan, onDone, isComplete = false }) {
  const [active, setActive] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (isComplete) return undefined

    const t = setInterval(
      () =>
        setActive((v) =>
          Math.min(v + 1, Math.max(0, ANALYSIS_STEPS.length - 1)),
        ),
      450,
    )
    return () => clearInterval(t)
  }, [isComplete])

  useEffect(() => {
    if (isComplete) setActive(ANALYSIS_STEPS.length + 1)
  }, [isComplete])

  useEffect(() => {
    if (isComplete && active > ANALYSIS_STEPS.length) {
      const t = setTimeout(() => onDoneRef.current(), 380)
      return () => clearTimeout(t)
    }
    return undefined
  }, [active, isComplete])
  return (
    <main className="screen active">
      <div className="analysing">
        <h2 className="an-h">{plan.name} 분석 중</h2>
        <p className="an-sub">
          유사 축제·관심도·관광수요·행사 이력·기상 통계·주변 POI를 순서대로
          조회합니다.
        </p>
        <div className="an-list">
          {ANALYSIS_STEPS.map((x, i) => (
            <div
              className={`an-item ${i < active ? 'fin' : i === active ? 'run' : ''}`}
              key={x}
            >
              <span className="dot" />
              {x}
            </div>
          ))}
        </div>
        <div className="progbar">
          <i
            style={{
              width: `${Math.min(100, (active / ANALYSIS_STEPS.length) * 100)}%`,
            }}
          />
        </div>
      </div>
    </main>
  )
}
