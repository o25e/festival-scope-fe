import { Fragment } from 'react'
import { FLOW } from '../data/prototype'

export function Header({ stage, onHome }) {
  const active = FLOW.findIndex(([key]) => key === stage)
  return (
    <header className="topbar">
      <div
        className="brand"
        onClick={onHome}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onHome()}
        role="button"
        tabIndex="0"
        aria-label="FestivalScope 처음으로"
      >
        Festival<span>Scope</span>
        <em>축제 흥행 사전 검증</em>
      </div>
      <nav className="flow" aria-label="분석 진행 단계">
        {FLOW.map(([key, label], i) => (
          <Fragment key={key}>
            {i > 0 && <i className="flow-sep" />}
            <span
              className={`flow-step ${i === active ? 'on' : i < active ? 'done' : ''}`}
            >
              <b>{i < active ? '✓' : i + 1}</b>
              {label}
            </span>
          </Fragment>
        ))}
      </nav>
      <div className="topbar-right">
        <span className="mockbadge">예시 데이터로 동작하는 프로토타입</span>
      </div>
    </header>
  )
}
