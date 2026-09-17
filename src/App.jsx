import { useEffect, useMemo, useState } from 'react'
import { analyze } from './data/prototype'
import { Header } from './components/AppHeader'
import { FormScreen } from './features/input/InputPage'
import { ReviewScreen } from './features/review/ReviewPage'
import { LoadingScreen } from './features/loading/LoadingPage'
import { ITEMS } from './features/analysis/analysisData'
import { ResultScreen } from './features/analysis/ResultsPage'
import { Panel } from './features/analysis/DetailPanel'
import { ReportScreen } from './features/report/ReportPage'

export default function App() {
  const [stage, setStage] = useState('input'),
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
      setStage('input')
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

  return (
    <>
      <Header stage={stage} onHome={home} />
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
          onBack={() => setStage('result')}
          onPrint={() => window.print()}
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
    </>
  )
}
