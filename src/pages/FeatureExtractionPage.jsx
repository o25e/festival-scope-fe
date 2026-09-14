import AnalysisLoader from '../components/common/AnalysisLoader'
import { extractionSteps } from '../data/analysis'
export default function FeatureExtractionPage({ onComplete }) { return <main className="wrap page"><AnalysisLoader title="AI가 기획안을 분석하고 있습니다" subtitle="별빛강변 뮤직페스티벌 · 경기 가평군" steps={extractionSteps} onComplete={onComplete} /></main> }
