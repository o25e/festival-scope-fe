import Badge from '../common/Badge'
import { analysisCards, riskClasses } from '../../data/analysis'

export default function AnalysisCardGrid({ onDetail }) {
  return <div className="agrid">{analysisCards.map((card) => <button className="acard" key={card.id} onClick={() => onDetail(card.id)}><div className="at"><h4>{card.title}</h4><Badge risk={card.risk} /></div><div className="m">{card.metric}</div><div className="d">{card.description}</div><div className="ibar"><i className={riskClasses[card.risk][1]} style={{ width: `${card.width}%` }} /></div></button>)}</div>
}
