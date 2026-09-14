import { useCallback, useEffect, useState } from 'react'
import Header from './components/layout/Header'
import LoginModal from './components/common/LoginModal'
import AnalysisDetailDrawer from './components/report/AnalysisDetailDrawer'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import FeatureExtractionPage from './pages/FeatureExtractionPage'
import FeatureConfirmPage from './pages/FeatureConfirmPage'
import AnalysisPage from './pages/AnalysisPage'
import ReportPage from './pages/ReportPage'

const initialForm = {
  capacity: '',
  spaceType: '야외형',
  operationTime: '야간',
  venueConfirmed: '확정',
  venueType: '수변',
}

export default function App() {
  const [view, setView] = useState('landing')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSample, setIsSample] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [form, setForm] = useState(initialForm)

  useEffect(() => window.scrollTo(0, 0), [view])

  const navigate = useCallback((nextView) => {
    if (['dashboard', 'upload', 'confirm'].includes(nextView)) {
      setIsLoggedIn(true)
      setIsSample(false)
    }
    setView(nextView)
    setLoginOpen(false)
    setSelectedDetail(null)
  }, [])

  const openSample = () => {
    setIsSample(true)
    setView('report')
    setLoginOpen(false)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setIsSample(false)
    navigate('landing')
  }

  const showReport = (sample = false) => {
    setIsSample(sample)
    setView('report')
  }

  const page = {
    landing: <LandingPage onLogin={() => setLoginOpen(true)} onSample={openSample} />,
    dashboard: <DashboardPage onNavigate={navigate} onReport={() => showReport(false)} />,
    upload: <UploadPage file={selectedFile} onFileChange={setSelectedFile} onNavigate={navigate} />,
    extract: <FeatureExtractionPage onComplete={() => navigate('confirm')} />,
    confirm: <FeatureConfirmPage form={form} onFormChange={setForm} onNavigate={navigate} />,
    analyze: <AnalysisPage onComplete={() => showReport(false)} />,
    report: <ReportPage isSample={isSample} onLogin={() => setLoginOpen(true)} onBack={() => navigate(isLoggedIn && !isSample ? 'dashboard' : 'landing')} onDetail={setSelectedDetail} />,
  }[view]

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onNavigate={navigate} onLogin={() => setLoginOpen(true)} onSample={openSample} onLogout={logout} />
      {page}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={() => { setIsLoggedIn(true); navigate('dashboard') }} />
      <AnalysisDetailDrawer detailId={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </>
  )
}
