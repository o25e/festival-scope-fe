import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { analyze, SAMPLE } from './data/prototype'
import { createFestivalPlan, getFestivalPlanId } from './api/festivalPlans'
import {
  executeFestivalPlanAnalysis,
  getAnalysis,
  getAnalysisId,
  getConflictRiskAnalysis,
  getDemandFitAnalysis,
  getTargetVisitorAnalysis,
  getTrendFitAnalysis,
} from './api/analyses'
import { ApiError } from './api/http'
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
import { mergeServerAnalysis } from './features/analysis/serverAnalysis'

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
  programNames: [],
  programCandidates: [],
  customProgramNames: [],
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
    [registeredPlanId, setRegisteredPlanId] = useState(null),
    [registeredAnalysisId, setRegisteredAnalysisId] = useState(null),
    [isAnalysisComplete, setIsAnalysisComplete] = useState(false),
    [autoFilledFields, setAutoFilledFields] = useState({})
  const registrationInFlightRef = useRef(false)
  const A = useMemo(
      () =>
        analysis ||
        (stage === 'result' || stage === 'report' ? analyze(plan) : null),
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
          setAnalysis(document.analysis || (document.plan ? analyze(reportPlan) : null))
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
      setRegisteredPlanId(null)
      setRegisteredAnalysisId(null)
      setIsAnalysisComplete(false)
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
      setRegisteredPlanId(null)
      setRegisteredAnalysisId(null)
      setIsAnalysisComplete(false)
      setStage('input')
      navigate('/plans/new')
    },
    goEdit = () => {
      setOpenKey(null)
      setStep(1)
      setRegistrationError('')
      setFestivalPlanResponse(null)
      setRegisteredPlanId(null)
      setRegisteredAnalysisId(null)
      setIsAnalysisComplete(false)
      setStage('input')
      navigate('/plans/new')
    },
    finish = () => {
      const id = registeredAnalysisId
      if (!id || !analysis) {
        setIsAnalysisComplete(false)
        setRegistrationError('분석 결과를 확인하지 못했습니다. 다시 시도해주세요.')
        setStage('review')
        return
      }
      const document = {
        analysisId: id,
        festivalName: plan.planName || plan.name || '새 축제 기획안',
        hostRegion: plan.org || [plan.sido, plan.sigungu].filter(Boolean).join(' ') || '—',
        plan,
        analysis,
      }
      setActiveDocument(document)
      setStage('result')
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
    setRegisteredPlanId(null)
    setRegisteredAnalysisId(null)
    setIsAnalysisComplete(false)
    setStage('input')
    navigate('/plans/new')
  }

  const handleAnalyze = async () => {
    if (registrationInFlightRef.current) return

    registrationInFlightRef.current = true
    setIsRegisteringPlan(true)
    setRegistrationError('')
    let phase = 'registration'

    try {
      const payload = buildFestivalPlanPayload(plan)
      const response = await createFestivalPlan(payload)
      const planId = getFestivalPlanId(response)
      if (!planId) {
        throw new ApiError('기획안 등록 응답에서 planId를 확인하지 못했습니다.', {
          data: response,
        })
      }

      setFestivalPlanResponse(response)
      setRegisteredPlanId(planId)
      setRegisteredAnalysisId(null)
      setAnalysis(null)
      setIsAnalysisComplete(false)
      setStage('loading')
      phase = 'analysis-execution'
      const executionResponse = await executeFestivalPlanAnalysis(planId)
      const analysisId = getAnalysisId(executionResponse)
      if (!analysisId) {
        throw new ApiError('분석 실행 응답에서 analysisId를 확인하지 못했습니다.', {
          data: executionResponse,
        })
      }
      setRegisteredAnalysisId(analysisId)

      phase = 'analysis-summary'
      const summary = await getAnalysis(analysisId)
      const supportedItemTypes = ['TARGET_VISITOR', 'TREND_FIT', 'DEMAND_FIT', 'CONFLICT_RISK'].filter((itemType) =>
        summary?.items?.some((item) => item?.itemType === itemType),
      )
      phase = 'analysis-detail'
      const detailGetters = {
        TARGET_VISITOR: getTargetVisitorAnalysis,
        TREND_FIT: getTrendFitAnalysis,
        DEMAND_FIT: getDemandFitAnalysis,
        CONFLICT_RISK: getConflictRiskAnalysis,
      }
      const detailEntries = await Promise.all(
        supportedItemTypes.map(async (itemType) => [
          itemType,
          await detailGetters[itemType](analysisId),
        ]),
      )
      const details = Object.fromEntries(detailEntries)
      const serverAnalysis = mergeServerAnalysis(analyze(plan), summary, details)
      setAnalysis(serverAnalysis)
      setIsAnalysisComplete(true)
    } catch (error) {
      setRegistrationError(
        error?.message || '축제 기획안 등록에 실패했습니다. 다시 시도해주세요.',
      )
      if (phase === 'analysis-execution' && error?.status === 404) {
        setRegistrationError('등록된 축제 기획안을 찾을 수 없습니다. 다시 시도해주세요.')
      } else if (phase === 'analysis-execution' && error?.status >= 500) {
        setRegistrationError('축제 기획안 분석 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else if (phase === 'analysis-summary' && error?.status === 404) {
        setRegistrationError('분석 결과 요약을 찾을 수 없습니다. 다시 시도해주세요.')
      } else if (phase === 'analysis-detail' && error?.status === 404) {
        setRegistrationError('분석 상세 결과를 찾을 수 없습니다. 다시 시도해주세요.')
      } else if ((phase === 'analysis-summary' || phase === 'analysis-detail') && error?.status >= 500) {
        setRegistrationError('분석 결과를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else if (phase === 'analysis' && error?.status === 404) {
        setRegistrationError('등록된 축제 기획안을 찾을 수 없습니다. 다시 시도해주세요.')
      } else if (phase === 'analysis' && error?.status >= 500) {
        setRegistrationError('축제 기획안 분석 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else if (error?.status === 401 || error?.status === 403) {
        setRegistrationError('인증이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.')
      }
      setIsAnalysisComplete(false)
      setStage('review')
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
      programNames: [...(SAMPLE.programNames || [])],
      programCandidates: [...(SAMPLE.programCandidates || SAMPLE.programNames || [])],
      customProgramNames: [...(SAMPLE.customProgramNames || [])],
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
            setAnalysis(document.analysis || (document.plan ? analyze(reportPlan) : null))
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
      {stage === 'loading' && (
        <LoadingScreen plan={plan} onDone={finish} isComplete={isAnalysisComplete} />
      )}
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
