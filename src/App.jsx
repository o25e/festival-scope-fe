import { useEffect, useMemo, useState } from 'react'
import { analyze, SAMPLE } from './data/prototype'
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

export default function App() {
  const { isAuthenticated, isPending, login, signup, logout } = useAuth()
  const [stage, setStage] = useState(isAuthenticated ? 'input' : 'landing'),
    [loginOpen, setLoginOpen] = useState(false),
    [loginError, setLoginError] = useState(''),
    [isSample, setIsSample] = useState(false),
    [step, setStep] = useState(1),
    [plan, setPlan] = useState({
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
    [openKey, setOpenKey] = useState(null)
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
    },
    goEdit = () => {
      setOpenKey(null)
      setStep(1)
      setStage('input')
    },
    finish = () => {
      setAnalysis(analyze(plan))
      setStage('result')
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
          onReview={(p) => {
            setPlan(p)
            setStage('review')
          }}
        />
      )}
      {stage === 'review' && (
        <ReviewScreen
          plan={plan}
          onEdit={() => setStage('input')}
          onAnalyze={() => setStage('loading')}
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
