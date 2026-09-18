import { useEffect, useMemo, useRef, useState } from 'react'
import { analyze, SAMPLE } from './data/prototype'
import { createFestivalPlan, parseFestivalPlan } from './api/festivalPlans'
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
import { buildFestivalPlanPayload } from './features/input/festivalPlanPayload'
import { mergeParsedFestivalPlan } from './features/input/festivalPlanParser'

export default function App() {
  const { isAuthenticated, isPending, login, signup, logout } = useAuth()
  const [stage, setStage] = useState(isAuthenticated ? 'input' : 'landing'),
    [loginOpen, setLoginOpen] = useState(false),
    [loginError, setLoginError] = useState(''),
    [isSample, setIsSample] = useState(false),
    [step, setStep] = useState(1),
    [plan, setPlan] = useState({
      planName: '',
      name: '',
      org: '',
      festivalThemes: [{ type: '', topic: '' }],
      target: 0,
      eventType: 'new',
      firstHeldYear: null,
      region: 'yeongwol',
      venueType: 'outdoor',
      venue: '',
      venueLocation: null,
      venueCapacity: '',
      start: '',
      end: '',
      programs: [],
    }),
    [analysis, setAnalysis] = useState(null),
    [openKey, setOpenKey] = useState(null),
    [isRegisteringPlan, setIsRegisteringPlan] = useState(false),
    [registrationError, setRegistrationError] = useState(''),
    [festivalPlanResponse, setFestivalPlanResponse] = useState(null),
    [pdfParseState, setPdfParseState] = useState({
      status: 'idle',
      fileName: '',
      message: '',
      error: '',
    })
  const registrationInFlightRef = useRef(false)
  const pdfParseInFlightRef = useRef(false)
  const A = useMemo(
      () => analysis || (stage === 'input' ? null : analyze(plan)),
      [analysis, plan, stage],
    ),
    index = ITEMS.findIndex((x) => x.key === openKey),
    openItem = index >= 0 ? { ...ITEMS[index], index } : null

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [stage, step])

  useEffect(() => {
    if (isAuthenticated) {
      if (stage === 'landing' && !isSample) setStage('input')
      return
    }
    if (!isSample && stage !== 'landing' && stage !== 'report') setStage('landing')
  }, [isAuthenticated, isSample, stage])

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

  const home = () => {
      setOpenKey(null)
      setIsSample(false)
      setStage(isAuthenticated ? 'input' : 'landing')
      setStep(1)
      setAnalysis(null)
      setRegistrationError('')
      setFestivalPlanResponse(null)
      setPdfParseState({ status: 'idle', fileName: '', message: '', error: '' })
    },
    goEdit = () => {
      setOpenKey(null)
      setStep(1)
      setRegistrationError('')
      setFestivalPlanResponse(null)
      setStage('input')
    },
    finish = () => {
      setAnalysis(analyze(plan))
      setStage('result')
    }

  const handlePdfFileSelected = async (file) => {
    if (pdfParseInFlightRef.current) return

    if (!file) {
      setPdfParseState({
        status: 'error',
        fileName: '',
        message: '',
        error: 'PDF 파일을 선택해 주세요.',
      })
      return
    }

    const isPdf =
      file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
    if (!isPdf) {
      setPdfParseState({
        status: 'error',
        fileName: file.name || '',
        message: '',
        error: 'PDF 파일만 업로드할 수 있습니다.',
      })
      return
    }

    pdfParseInFlightRef.current = true
    setPdfParseState({
      status: 'parsing',
      fileName: file.name || '',
      message: '',
      error: '',
    })

    try {
      const response = await parseFestivalPlan(file)
      if (!mergeParsedFestivalPlan({}, response).hasValues) {
        throw new Error('PDF에서 입력할 수 있는 기획안 정보를 찾지 못했습니다.')
      }

      setPlan((currentPlan) => mergeParsedFestivalPlan(currentPlan, response).plan)
      setPdfParseState({
        status: 'success',
        fileName: file.name || '',
        message:
          '파싱된 값이 입력 폼에 반영되었습니다. 필요한 항목은 직접 수정할 수 있습니다.',
        error: '',
      })
    } catch (error) {
      setPdfParseState({
        status: 'error',
        fileName: file.name || '',
        message: '',
        error:
          error?.message ||
          'PDF 기획안 파싱에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      })
    } finally {
      pdfParseInFlightRef.current = false
    }
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
      setStage('input')
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
    } catch {
      // AuthProvider keeps the session when logout fails; the service remains usable.
    }
  }

  return (
    <>
      <Header
        stage={stage}
        onHome={home}
        isAuthenticated={isAuthenticated}
        isPending={isPending}
        onLogin={openLogin}
        onSample={openSample}
        onLogout={handleLogout}
      />
      {stage === 'landing' && <LandingPage onStart={openLogin} onSample={openSample} />}
      {stage === 'input' && (
        <FormScreen
          plan={plan}
          setPlan={setPlan}
          step={step}
          setStep={setStep}
          pdfParseState={pdfParseState}
          onPdfFileSelected={handlePdfFileSelected}
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
