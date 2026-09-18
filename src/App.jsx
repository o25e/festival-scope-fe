import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { analyze, SAMPLE } from './data/prototype'
import { createFestivalPlan } from './api/festivalPlans'
import { Header } from './components/AppHeader'
import { useAuth } from './auth/AuthProvider'
import { LoginModal } from './features/auth/LoginModal'
import { LandingPage } from './features/landing/LandingPage'
import { FormScreen } from './features/input/InputPage'
import { ReviewScreen } from './features/review/ReviewPage'
import { LoadingScreen } from './features/loading/LoadingPage'
import { ITEMS } from './features/analysis/analysisData'
import { ResultScreen } from './features/analysis/ResultsPage'
import { Panel } from './features/analysis/DetailPanel'
import { ReportScreen } from './features/report/ReportPage'
import { DocumentsPage } from './features/documents/DocumentsPage'
import { buildFestivalPlanPayload } from './features/input/festivalPlanPayload'
import {
  mergeParsedFestivalPlan,
  normalizeFestivalPlan,
} from './features/input/festivalPlanParser'
import { navigate, useRoute } from './routing'

const EMPTY_PLAN = {
  planName: '',
  name: '',
  org: '',
  festivalThemes: [{ type: '', topic: '' }],
  target: 0,
  eventType: 'new',
  firstHeldYear: null,
  sido: '강원',
  sigungu: '영월군',
  venueType: 'outdoor',
  venue: '',
  venueLocation: null,
  maxCapacity: null,
  start: '',
  end: '',
  programs: [],
}

const getResponseId = (value) => {
  if (!value || typeof value !== 'object') return null
  for (const key of ['planId', 'festivalPlanId', 'id']) {
    if (typeof value[key] === 'string' || typeof value[key] === 'number') return String(value[key])
  }
  for (const child of Object.values(value)) {
    const found = getResponseId(child)
    if (found) return found
  }
  return null
}

export default function App() {
  const { isAuthenticated, isPending, login, signup, logout } = useAuth()
  const route = useRoute()
  const initialStage = route.name === 'documents' ? 'documents' : route.name === 'input' ? 'input' : route.name === 'report' ? 'report' : isAuthenticated ? 'documents' : 'landing'
  const [stage, setStage] = useState(initialStage),
    [loginOpen, setLoginOpen] = useState(false),
    [loginError, setLoginError] = useState(''),
    [isSample, setIsSample] = useState(false),
    [step, setStep] = useState(1),
    [plan, setPlan] = useState(EMPTY_PLAN),
    [documents, setDocuments] = useState([]),
    [activeDocument, setActiveDocument] = useState(null),
    [analysis, setAnalysis] = useState(null),
    [openKey, setOpenKey] = useState(null),
    [isRegisteringPlan, setIsRegisteringPlan] = useState(false),
    [registrationError, setRegistrationError] = useState(''),
    [festivalPlanResponse, setFestivalPlanResponse] = useState(null),
    [autoFilledFields, setAutoFilledFields] = useState({})
  const registrationInFlightRef = useRef(false)
  const A = useMemo(
      () => analysis || (stage === 'input' || stage === 'documents' ? null : analyze(plan)),
      [analysis, plan, stage],
    ),
    index = ITEMS.findIndex((x) => x.key === openKey),
    openItem = index >= 0 ? { ...ITEMS[index], index } : null

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [stage, step])

  const handleDocumentsLoaded = useCallback((nextDocuments) => {
    setDocuments(nextDocuments)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      if (isSample) return
      if (route.name === 'documents') {
        if (stage !== 'documents') setStage('documents')
        return
      }
      if (route.name === 'input') {
        if (stage === 'landing' || stage === 'documents') setStage('input')
        return
      }
      if (route.name === 'report') {
        const document =
          activeDocument?.analysisId === route.analysisId
            ? activeDocument
            : documents.find((item) => String(item.analysisId) === route.analysisId)
        if (!document) {
          navigate('/documents', { replace: true })
          return
        }
        if (stage !== 'report') {
          const reportPlan = normalizeFestivalPlan(
            document.plan || {
              ...EMPTY_PLAN,
              planName: document.festivalName,
              name: document.festivalName,
              org: document.hostRegion,
            },
          )
          setPlan(reportPlan)
          setAutoFilledFields({})
          setAnalysis(document.plan ? analyze(reportPlan) : null)
          setStage('report')
        }
        return
      }
      navigate('/documents', { replace: true })
      return
    }
    if (!isSample) {
      if (route.name !== 'landing') navigate('/', { replace: true })
      if (stage !== 'landing') setStage('landing')
    }
  }, [activeDocument, documents, isAuthenticated, isSample, route.analysisId, route.name, stage])

  useEffect(() => {
    const f = (e) => {
      if (e.key === 'Escape') setOpenKey(null)
      if (index >= 0 && e.key === 'ArrowLeft' && index > 0)
        setOpenKey(ITEMS[index - 1].key)
      if (index >= 0 && e.key === 'ArrowRight' && index < ITEMS.length - 1)
        setOpenKey(ITEMS[index + 1].key)
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [index])

  const openDocuments = () => {
      setOpenKey(null)
      setIsSample(false)
      setActiveDocument(null)
      setStage(isAuthenticated ? 'documents' : 'landing')
      setStep(1)
      setAnalysis(null)
      setRegistrationError('')
      setFestivalPlanResponse(null)
      navigate(isAuthenticated ? '/documents' : '/')
    },
    home = openDocuments,
    startNewPlan = () => {
      setOpenKey(null)
      setIsSample(false)
      setActiveDocument(null)
      setPlan(EMPTY_PLAN)
      setAutoFilledFields({})
      setAnalysis(null)
      setStep(1)
      setRegistrationError('')
      setFestivalPlanResponse(null)
      setStage('input')
      navigate('/plans/new')
    },
    goEdit = () => {
      setOpenKey(null)
      setStep(1)
      setRegistrationError('')
      setFestivalPlanResponse(null)
      setStage('input')
      navigate('/plans/new')
    },
    finish = () => {
      const nextAnalysis = analyze(plan)
      const id = getResponseId(festivalPlanResponse) || `local-${Date.now()}`
      const document = {
        analysisId: id,
        festivalName: plan.planName || plan.name || '새 축제 기획안',
        hostRegion: plan.org || [plan.sido, plan.sigungu].filter(Boolean).join(' ') || '—',
        plan,
      }
      setActiveDocument(document)
      setAnalysis(nextAnalysis)
      setStage('result')
      navigate(`/reports/${encodeURIComponent(id)}`)
    }

  const handleParsedPlan = ({ response }) => {
    const parsed = mergeParsedFestivalPlan(EMPTY_PLAN, response)
    if (!parsed.hasValues) return

    setPlan(parsed.plan)
    setAutoFilledFields(parsed.autoFilledFields || {})
      setActiveDocument(null)
    setAnalysis(null)
    setStep(1)
    setRegistrationError('')
    setFestivalPlanResponse(null)
    setStage('input')
    navigate('/plans/new')
  }

  const handleAnalyze = async () => {
    if (registrationInFlightRef.current) return

    registrationInFlightRef.current = true
    setIsRegisteringPlan(true)
    setRegistrationError('')

    try {
      const payload = buildFestivalPlanPayload(plan)
      const response = await createFestivalPlan(payload)
      // ApiResponse.data is intentionally untyped in the backend OpenAPI spec.
      // Keep the complete response so a future analysis request can use the
      // server-issued identifier without guessing its field name here.
      setFestivalPlanResponse(response)
      setStage('loading')
    } catch (error) {
      setRegistrationError(
        error?.message || '축제 기획안 등록에 실패했습니다. 다시 시도해주세요.',
      )
    } finally {
      registrationInFlightRef.current = false
      setIsRegisteringPlan(false)
    }
  }

  const openLogin = () => {
    setLoginError('')
    setLoginOpen(true)
  }

  const handleLogin = async (credentials) => {
    setLoginError('')
    try {
      await login(credentials)
      setIsSample(false)
      setLoginOpen(false)
      setStage('documents')
      navigate('/documents')
    } catch (error) {
      setLoginError(error?.message || '로그인에 실패했습니다. 입력 정보를 확인해주세요.')
    }
  }

  const handleSignup = (credentials) => signup(credentials)

  const handleAuthModeChange = () => setLoginError('')

  const openSample = () => {
    const samplePlan = {
      ...SAMPLE,
      festivalThemes: SAMPLE.festivalThemes.map((pair) => ({ ...pair })),
      programs: [...SAMPLE.programs],
    }
    setOpenKey(null)
    setPlan(samplePlan)
    setAutoFilledFields({})
    setAnalysis(analyze(samplePlan))
    setIsSample(true)
    setStage('report')
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsSample(false)
      setStage('landing')
      setStep(1)
      setAnalysis(null)
      navigate('/')
    } catch {
      // AuthProvider keeps the session when logout fails; the service remains usable.
    }
  }

  return (
    <>
      <Header
        stage={stage}
        onHome={openDocuments}
        onDocuments={openDocuments}
        onNew={startNewPlan}
        isAuthenticated={isAuthenticated}
        isPending={isPending}
        onLogin={openLogin}
        onSample={openSample}
        onLogout={handleLogout}
      />
      {stage === 'landing' && <LandingPage onStart={openLogin} onSample={openSample} />}
      {stage === 'documents' && (
        <DocumentsPage
          onDocumentsLoaded={handleDocumentsLoaded}
          onParsedPlan={handleParsedPlan}
          onOpenReport={(document) => {
            setActiveDocument(document)
            const reportPlan = normalizeFestivalPlan(document.plan || EMPTY_PLAN)
            setPlan(reportPlan)
            setAutoFilledFields({})
            setAnalysis(document.plan ? analyze(reportPlan) : null)
            setStage('report')
            navigate(`/reports/${encodeURIComponent(document.analysisId)}`)
          }}
        />
      )}
      {stage === 'input' && (
        <FormScreen
          plan={plan}
          setPlan={setPlan}
          step={step}
          setStep={setStep}
          autoFilledFields={autoFilledFields}
          setAutoFilledFields={setAutoFilledFields}
          onReview={(p) => {
            setPlan(p)
            setRegistrationError('')
            setFestivalPlanResponse(null)
            setStage('review')
          }}
        />
      )}
      {stage === 'review' && (
        <ReviewScreen
          plan={plan}
          onEdit={goEdit}
          onAnalyze={handleAnalyze}
          isSubmitting={isRegisteringPlan}
          error={registrationError}
        />
      )}
      {stage === 'loading' && <LoadingScreen plan={plan} onDone={finish} />}
      {stage === 'result' && A && (
        <ResultScreen
          A={A}
          onEdit={goEdit}
          onReport={() => setStage('report')}
          onOpen={setOpenKey}
          openKey={openKey}
        />
      )}
      {stage === 'report' && A && (
        <ReportScreen
          A={A}
          onBack={() => (isSample ? home() : setStage('result'))}
          onPrint={() => window.print()}
          backLabel={isSample ? '랜딩으로 돌아가기' : '결과로 돌아가기'}
        />
      )}
      {openItem && A && (
        <Panel
          item={openItem}
          A={A}
          onClose={() => setOpenKey(null)}
          onEdit={goEdit}
          onMove={(direction) => {
            const next = ITEMS[index + direction]
            if (next) setOpenKey(next.key)
          }}
        />
      )}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={handleLogin}
        onSignup={handleSignup}
        onModeChange={handleAuthModeChange}
        isPending={isPending}
        error={loginError}
      />
    </>
  )
}
