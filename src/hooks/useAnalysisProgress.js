import { useCallback, useEffect, useState } from 'react'

export function useAnalysisProgress(stepList, onComplete) {
  const [activeStep, setActiveStep] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return undefined
    if (activeStep >= stepList.length) {
      const doneTimer = window.setTimeout(onComplete, 450)
      return () => window.clearTimeout(doneTimer)
    }
    const timer = window.setTimeout(() => setActiveStep((step) => step + 1), 820)
    return () => window.clearTimeout(timer)
  }, [activeStep, onComplete, started, stepList.length])

  const start = useCallback(() => { setActiveStep(0); setStarted(true) }, [])
  return {
    activeStep,
    progress: Math.min(100, Math.round((activeStep / stepList.length) * 100)),
    start,
  }
}
