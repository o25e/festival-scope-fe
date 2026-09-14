import { useMemo, useState } from 'react'
import Button from '../components/common/Button'
import { documents, documentRegions } from '../data/documents'
import { filterAndSortDocuments, scoreClass } from '../utils/documents'

export default function DashboardPage({ onNavigate, onReport }) {
  const [filters, setFilters] = useState({ query: '', region: '', date: '', score: '' })
  const [sort, setSort] = useState({ key: 'score', direction: -1 })
  const rows = useMemo(() => filterAndSortDocuments(documents, filters, sort.key, sort.direction), [filters, sort])
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const sortBy = (key) => setSort((current) => current.key === key ? { key, direction: current.direction * -1 } : { key, direction: 1 })
  const marker = (key) => sort.key === key ? (sort.direction > 0 ? '↑' : '↓') : '⇅'
  return <main className="wrap page"><div className="phead"><div><h1>분석 문서 목록</h1><p>업로드한 축제 기획안의 검증 결과를 확인하세요.</p></div><Button onClick={() => onNavigate('upload')}>+ 새 기획안 업로드</Button></div><div className="minibar"><div>총 분석 문서<b>3</b></div><div>분석 완료<b>3</b></div><div>분석 중<b>0</b></div><div>평균 Score<b>78.0</b></div></div><div className="toolbar"><div className="srch"><input value={filters.query} onChange={(event) => update('query', event.target.value)} placeholder="축제명 검색" /></div><select value={filters.region} onChange={(event) => update('region', event.target.value)}><option value="">지역 ▾ 전체</option>{documentRegions.map((region) => <option key={region}>{region}</option>)}</select><select value={filters.date} onChange={(event) => update('date', event.target.value)}><option value="">개최 날짜 ▾ 전체</option><option value="2026-上">2026 상반기</option><option value="2026-下">2026 하반기</option></select><select value={filters.score} onChange={(event) => update('score', event.target.value)}><option value="">흥행 Score ▾ 전체</option><option value="80">80점 이상</option><option value="70">70점 이상</option></select></div><div className="table-wrap"><table><thead><tr>{[['name', '축제명'], ['region', '지역'], ['date', '개최 날짜'], ['score', '흥행 Score']].map(([key, label]) => <th key={key} onClick={() => sortBy(key)} className={key === 'score' ? 'right' : ''}>{label}<span className="sc">{marker(key)}</span></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.name} onClick={onReport}><td className="doc">{row.name}<small>{row.file}</small></td><td>{row.region}</td><td>{row.date}</td><td className={`score ${scoreClass(row.score)} right`}>{row.score}</td></tr>)}</tbody></table></div>{rows.length === 0 && <p className="empty">조건에 맞는 기획안이 없습니다.</p>}</main>
}
