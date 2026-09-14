import Badge from '../common/Badge'
import { detailData, similarFestivals } from '../../data/analysis'

export default function AnalysisDetailDrawer({ detailId, onClose }) {
  if (!detailId) return null
  const detail = detailData[detailId]
  return <><div className="dmask open" onClick={onClose} /><aside className="drawer open"><div className="dhead"><div className="dt"><div><h2>{detail.title}</h2><p>{detail.description}</p><div className="drawer-badge"><Badge risk={detail.risk} /></div></div><button className="dclose" onClick={onClose} aria-label="상세 분석 닫기">×</button></div></div><div className="dbody">
    <section className="dsec"><h3>핵심 METRIC</h3><div className="metricbox"><div className="mv">{detail.metric[0]}</div><div className="ml">{detail.metric[1]}<br />{detail.metric[2]}</div></div></section>
    {detailId === 'similar' && <section className="dsec"><h3>유사축제 TOP5</h3><div className="vizbox table-scroll"><table className="dtable"><thead><tr><th>축제명</th><th>지역</th><th>월</th><th>대표 방문객</th></tr></thead><tbody>{similarFestivals.map((festival) => <tr key={festival[0]}><td>{festival[0]}</td><td>{festival[1]}</td><td>{festival[2]}</td><td>{festival[5].toLocaleString()}명</td></tr>)}</tbody></table></div></section>}
    <section className="dsec"><h3>판단 근거</h3><ul className="ul">{detail.basis.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="dsec"><h3>권장 수정사항</h3><div className="reco">{detail.recommendation}</div></section>
  </div></aside></>
}
