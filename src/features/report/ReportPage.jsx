import { useMemo } from 'react'
import { Button } from '../../components/ui'
import { fmt, levelClass } from '../../utils/formatters'
import { ITEMS, cardData } from '../analysis/analysisData'
import { getDetailHtml } from '../analysis/DetailPanel'

export function ReportScreen({ A, onBack, onPrint, backLabel = '결과로 돌아가기' }) {
  const cards = ITEMS.map((item) => ({ item, data: cardData(item, A) }))
  const recommendations = useMemo(() => {
    const doc = new DOMParser().parseFromString(
      ITEMS.map((item) => getDetailHtml(item, A)).join(''),
      'text/html',
    )
    return [...doc.querySelectorAll('.rec')]
      .map((el, i) => ({
        source:
          ITEMS.find((item) =>
            getDetailHtml(item, A).includes(
              el.querySelector('b')?.textContent || '',
            ),
          )?.name || '평가 항목',
        title: el.querySelector('b')?.textContent || '',
        text: el.querySelector('p')?.textContent || '',
        priority:
          el.querySelector('.pri')?.className.match(/p([123])/)?.[1] * 1 || 3,
        i,
      }))
      .sort((a, b) => a.priority - b.priority || a.i - b.i)
  }, [A])
  return (
    <main className="screen active">
      <div className="wrap">
        <div className="plan-bar noprint">
          <div>
            <div className="plan-title">최종 리포트</div>
            <div className="plan-meta">
              6개 평가 항목의 판단과 권장 수정사항을 한 장으로 정리했습니다.
            </div>
          </div>
          <span className="spacer" />
          <Button small onClick={onBack}>
            {backLabel}
          </Button>
          <Button small primary onClick={onPrint}>
            인쇄 / PDF 저장
          </Button>
        </div>
        <div className="rpt">
          <div className="rpt-head">
            <div>
              <div className="lbl">축제 흥행 사전 검증 리포트</div>
              <h2 className="report-title">{A.p.name}</h2>
              <div className="plan-meta">
                {A.p.org || A.R.name}
                <i>|</i>
                {A.p.venue}
                <i>|</i>
                {A.p.start} ~ {A.p.end} ({A.days}일)<i>|</i>목표{' '}
                {fmt(A.p.target)}명
              </div>
            </div>
            <div className="report-score">
              <div className="lbl">종합 흥행 스코어</div>
              <b>{A.composite}</b>
              <div className="lbl">
                등급 {A.grade} · {A.gradeNote}
              </div>
            </div>
          </div>
          <ReportGroup
            title="흥행 스코어 반영 항목"
            tag="3개 항목 동일 가중"
            cards={cards.filter((x) => x.item.scored)}
          />
          <ReportGroup
            title="별도 진단"
            tag="스코어 미반영"
            cards={cards.filter((x) => !x.item.scored)}
          />
          <section className="rpt-sec">
            <h3>권장 수정사항 {recommendations.length}건</h3>
            <div className="rpt-list">
              {recommendations.map((r) => (
                <div className="rpt-row" key={`${r.source}-${r.title}-${r.i}`}>
                  <div>
                    <span className={`pri p${r.priority}`}>
                      {r.priority === 1
                        ? '즉시'
                        : r.priority === 2
                          ? '검토'
                          : '선택'}
                    </span>
                  </div>
                  <div>
                    <b>{r.title}</b>
                    <p>{r.text}</p>
                    <div className="src">{r.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rpt-sec">
            <p className="note report-note">
              이 리포트는 유사 축제·검색 관심도·지역 관광수요·행사 이력·기상
              통계·주변 POI의 과거 데이터를 근거로 한 타당성 및 리스크
              진단입니다. 미래 흥행을 보장하지 않으며, 입력 정보가 변경되면
              결과도 달라집니다. 본 화면은 예시 데이터로 동작하는
              프로토타입입니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
function ReportGroup({ title, tag, cards }) {
  return (
    <section className="rpt-sec">
      <h3>
        {title}{' '}
        <span
          className="tag"
          style={{ fontWeight: 400, fontSize: '11.5px', color: 'var(--muted)' }}
        >
          {tag}
        </span>
      </h3>
      <div className="rpt-grid">
        {cards.map(({ item, data }) => (
          <div className="rpt-item" key={item.key}>
            <div className="t">
              <b>{item.name}</b>
              <span className={levelClass(data.tone)}>{data.pill}</span>
            </div>
            <div className="report-metric">
              {data.metric} <span>{data.unit}</span>
            </div>
            <p>{data.read}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
