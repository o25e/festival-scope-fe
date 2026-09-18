import { Fragment } from 'react'
import { FLOW } from '../data/prototype'

export function Header({
  stage,
  onHome,
  isAuthenticated,
  isPending,
  onLogin,
  onSample,
  onLogout,
  onDocuments,
  onNew,
}) {
  if (!isAuthenticated) {
    return (
      <header className="landing-nav">
        <div className="landing-wrap landing-nav-inner">
          <button className="landing-logo" type="button" onClick={onHome}>
            <span className="landing-logo-dot" aria-hidden="true" />
            FestivalScope
            <span className="landing-nav-sub">B2G 축제 기획안 사전 검증</span>
          </button>
          <div className="landing-nav-actions">
            <button className="landing-btn landing-btn-onnavy landing-btn-sm" type="button" onClick={onSample}>
              리포트 예시
            </button>
            <button className="landing-btn landing-btn-onnavy landing-btn-sm" type="button" onClick={onLogin}>
              로그인
            </button>
          </div>
        </div>
      </header>
    )
  }

  if (stage === 'documents') {
    return (
      <header className="topbar documents-topbar">
        <div
          className="brand"
          onClick={onDocuments}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDocuments()}
          role="button"
          tabIndex="0"
          aria-label="FestivalScope 처음으로"
        >
          Festival<span>Scope</span>
          <em>축제 흥행 사전 검증</em>
        </div>
        <div className="topbar-right documents-topbar-actions">
          <button className="btn btn-sm" type="button" onClick={onDocuments}>분석 문서 목록</button>
          <button className="btn btn-sm" type="button" onClick={onLogout} disabled={isPending}>로그아웃</button>
        </div>
      </header>
    )
  }

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
        <button className="btn btn-sm" type="button" onClick={onDocuments}>
          분석 문서 목록
        </button>
        <button className="btn btn-sm" type="button" onClick={onLogout} disabled={isPending}>
          로그아웃
        </button>
        <span className="mockbadge">예시 데이터로 동작하는 프로토타입</span>
      </div>
    </header>
  )
}
