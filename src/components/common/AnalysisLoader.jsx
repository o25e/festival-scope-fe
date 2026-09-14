import { useEffect } from 'react'
import { useAnalysisProgress } from '../../hooks/useAnalysisProgress'

export default function AnalysisLoader({ title, subtitle, steps, onComplete }) {
  const progress = useAnalysisProgress(steps, onComplete)
  useEffect(progress.start, [progress.start])
  return <div className="loader"><h3>{title}</h3><p className="lsub">{subtitle}</p><div>{steps.map((step, index) => <div className={`lstep ${index < progress.activeStep ? 'ok' : index === progress.activeStep ? 'on' : ''}`} key={step}><span className="mark">{index < progress.activeStep ? '✓' : index === progress.activeStep ? '' : index + 1}</span>{step}</div>)}</div><div className="prog"><i style={{ width: `${progress.progress}%` }} /></div></div>
}
