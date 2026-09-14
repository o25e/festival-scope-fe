import AnalysisLoader from '../components/common/AnalysisLoader'
import { analysisSteps } from '../data/analysis'
export default function AnalysisPage({ onComplete }) { return <main className="wrap page"><AnalysisLoader title="타당성 분석을 진행하고 있습니다" subtitle="별빛강변 뮤직페스티벌 · 2026.10.09–10.11 · 경기 가평군" steps={analysisSteps} onComplete={onComplete} /></main> }
