export function LandingPage({ onStart, onSample }) {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-wrap">
          <div className="landing-eyebrow">데이터 기반 사전 타당성 검증</div>
          <h1>
            축제를 만들기 전에,
            <br />
            데이터로 먼저 검증하세요.
          </h1>
          <p className="landing-sub">
            작성한 축제 기획안을 업로드하면
            <br />
            과거 축제 성과 · 지역 관광수요 · 기상 · 트렌드를 분석하여
            <br />
            흥행 가능성과 수정이 필요한 지점을 알려드립니다.
          </p>
          <div className="landing-cta">
            <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={onStart}>
              무료로 시작하기 <span aria-hidden="true">→</span>
            </button>
            <button className="landing-btn landing-btn-ghost landing-btn-lg" onClick={onSample}>
              리포트 예시 보기
            </button>
          </div>
          <div className="landing-chips" aria-label="분석 항목">
            {['과거·유사축제 성과', '지역 관광수요', '혼잡·쏠림 Risk', '기상 Risk', '최근 검색 트렌드'].map(
              (chip) => (
                <span className="landing-chip" key={chip}>
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="landing-how">
        <div className="landing-wrap">
          <h2>기획안 하나면, 개최 전에 답이 나옵니다</h2>
          <div className="landing-steps">
            <LandingStep number="1" title="기획안 업로드" description="이미 작성한 축제 기획안(PDF·HWP·DOCX)을 그대로 올립니다. 새로 기획할 필요가 없습니다." />
            <LandingStep number="2" title="AI Feature 추출 · 검증" description="문서에서 분석에 필요한 항목을 추출하고, 6개 축으로 타당성을 교차 검증합니다." />
            <LandingStep number="3" title="수정 지점 리포트" description="FestivalScope Score와 함께 무엇을 어떻게 보완해야 하는지 근거와 함께 제시합니다." />
          </div>
        </div>
      </section>
      <footer className="landing-footer">© 2026 FestivalScope</footer>
    </main>
  )
}

function LandingStep({ number, title, description }) {
  return (
    <article className="landing-step">
      <div className="landing-step-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
