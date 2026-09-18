import { useEffect, useMemo, useState } from 'react'
import { getAnalysisDocuments } from '../../api/analyses'
import { DOCUMENT_STATUS, mapAnalysisDocument } from './documentsData'

const PAGE_SIZE = 10

const isAbortError = (error) =>
  error?.name === 'AbortError' || error?.cause?.name === 'AbortError'

export function DocumentsPage({ onNew, onOpenReport, onDocumentsLoaded }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [retryToken, setRetryToken] = useState(0)
  const [state, setState] = useState({
    status: 'loading',
    documents: [],
    totalElements: 0,
    totalPages: 0,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setState((current) => ({ ...current, status: 'loading', error: null }))

    getAnalysisDocuments({ page, size: PAGE_SIZE, signal: controller.signal })
      .then((response) => {
        if (!active) return
        const content = Array.isArray(response?.content) ? response.content : []
        const documents = content.map(mapAnalysisDocument)
        const totalElements = Number(response?.totalElements ?? documents.length)
        const totalPages = Number(
          response?.totalPages ?? Math.ceil(totalElements / PAGE_SIZE),
        )

        setState({
          status: 'success',
          documents,
          totalElements,
          totalPages,
          error: null,
        })
        onDocumentsLoaded?.(documents)
      })
      .catch((error) => {
        if (!active || isAbortError(error)) return
        setState((current) => ({
          ...current,
          status: 'error',
          error: error?.message || '분석 문서 목록을 불러오지 못했습니다.',
        }))
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [onDocumentsLoaded, page, retryToken])

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return state.documents

    return state.documents.filter((document) =>
      [document.title, document.region]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    )
  }, [query, state.documents])

  const hasPreviousPage = page > 0
  const hasNextPage = page + 1 < state.totalPages

  const renderBody = () => {
    if (state.status === 'loading') {
      return (
        <div className="documents-empty documents-loading" role="status" aria-live="polite">
          <strong>분석 문서를 불러오는 중입니다.</strong>
        </div>
      )
    }

    if (state.status === 'error') {
      return (
        <div className="documents-empty documents-error" role="alert">
          <strong>분석 문서 목록을 불러오지 못했습니다.</strong>
          <span>{state.error}</span>
          <button className="btn btn-sm" type="button" onClick={() => setRetryToken((value) => value + 1)}>
            다시 시도
          </button>
        </div>
      )
    }

    if (!filteredDocuments.length) {
      return (
        <div className="documents-empty">
          <strong>{query ? '조건에 맞는 분석 문서가 없습니다.' : '분석 문서가 없습니다.'}</strong>
          <span>{query ? '검색어를 바꿔 다시 확인해 보세요.' : '새 축제 기획안을 등록해 분석을 시작해 보세요.'}</span>
        </div>
      )
    }

    return filteredDocuments.map((document) => (
      <div className="documents-row" role="row" key={document.id}>
        <div className="document-title-cell" role="cell">
          <button
            type="button"
            disabled={document.status !== DOCUMENT_STATUS.COMPLETED}
            onClick={() => onOpenReport(document)}
          >
            {document.title}
          </button>
          <small>{document.fileName}</small>
        </div>
        <div role="cell">{document.region}</div>
        <div role="cell">{document.startDate}</div>
        <div role="cell">
          <strong className={`document-score score-${document.score == null ? 'none' : document.score >= 75 ? 'high' : document.score >= 60 ? 'mid' : 'low'}`}>
            {document.score == null ? '-' : document.score}
          </strong>
        </div>
        <div role="cell">{document.recommendations == null ? '-' : `${document.recommendations}건`}</div>
        <div role="cell">{document.uploadedAt}</div>
      </div>
    ))
  }

  return (
    <main className="documents-page">
      <div className="documents-wrap">
        <div className="documents-heading">
          <div>
            <h1>분석 문서 목록</h1>
            <p>업로드한 축제 기획안의 검증 결과를 확인하세요.</p>
          </div>
          <button className="btn btn-primary documents-primary" type="button" onClick={onNew}>
            <span aria-hidden="true">+</span> 새 기획안 업로드
          </button>
        </div>

        <section className="formcard documents-summary" aria-label="분석 문서 요약">
          <div><span>총 분석 문서</span> <strong>{state.totalElements}</strong></div>
        </section>

        <div className="documents-controls">
          <label className="documents-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="기획안명 · 지자체 검색"
              aria-label="기획안명 또는 지자체 검색"
            />
          </label>
        </div>

        <section className="formcard documents-table-card" aria-live="polite">
          <div className="documents-table" role="table" aria-label="분석 문서 목록">
            <div className="documents-row documents-row-head" role="row">
              <div role="columnheader">기획안</div>
              <div role="columnheader">지자체</div>
              <div role="columnheader">개최 예정</div>
              <div role="columnheader">흥행 가능성</div>
              <div role="columnheader">수정 권고</div>
              <div role="columnheader">업로드</div>
            </div>
            {renderBody()}
          </div>
          {state.status === 'success' && state.totalPages > 1 && (
            <div className="documents-pagination" aria-label="분석 문서 페이지 이동">
              <button className="btn btn-sm" type="button" disabled={!hasPreviousPage} onClick={() => setPage((value) => value - 1)}>
                이전
              </button>
              <span>{page + 1} / {state.totalPages}</span>
              <button className="btn btn-sm" type="button" disabled={!hasNextPage} onClick={() => setPage((value) => value + 1)}>
                다음
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
