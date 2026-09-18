import { useEffect, useRef, useState } from 'react'

export function LoginModal({
  open,
  onClose,
  onSubmit,
  onSignup,
  onModeChange,
  isPending,
  error,
}) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const firstFieldRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setMode('login')
      setEmail('')
      setPassword('')
      setName('')
      setSignupEmail('')
      setSignupPassword('')
      setFormError('')
      setSuccessMessage('')
      return
    }
    setFormError('')
    setSuccessMessage('')
    window.setTimeout(() => firstFieldRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => firstFieldRef.current?.focus(), 0)
  }, [mode, open])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) return null

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setFormError('')
    setSuccessMessage('')
    onModeChange?.(nextMode)
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setFormError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    setFormError('')
    await onSubmit({ email: email.trim(), password })
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setFormError('이름을 입력해주세요.')
      return
    }
    if (!signupEmail.trim()) {
      setFormError('이메일을 입력해주세요.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      setFormError('올바른 이메일 형식을 입력해주세요.')
      return
    }
    if (!signupPassword) {
      setFormError('비밀번호를 입력해주세요.')
      return
    }

    setFormError('')
    try {
      await onSignup({
        name: name.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      })
      setName('')
      setSignupEmail('')
      setSignupPassword('')
      setEmail('')
      setPassword('')
      setMode('login')
      setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.')
      onModeChange?.('login')
    } catch (signupError) {
      setFormError(
        signupError?.message || '회원가입에 실패했습니다. 입력 정보를 확인해주세요.',
      )
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="landing-mask" role="presentation" onMouseDown={onClose}>
      <div
        className="landing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="landing-modal-close" type="button" onClick={onClose} aria-label="인증 모달 닫기">
          ×
        </button>
        {isLogin ? (
          <>
            <h2 id="auth-modal-title">로그인</h2>
            <p className="landing-modal-sub">기획안 검증을 시작하려면 로그인하세요.</p>
            <form onSubmit={handleLoginSubmit} noValidate>
              <label className="landing-field-label" htmlFor="login-email">기관 이메일</label>
              <input ref={firstFieldRef} id="login-email" className="landing-input" type="email" autoComplete="email" placeholder="name@gp.go.kr" value={email} onChange={(event) => setEmail(event.target.value)} />
              <label className="landing-field-label" htmlFor="login-password">비밀번호</label>
              <input id="login-password" className="landing-input" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} />
              {(formError || error) && <p className="landing-login-error" role="alert">{formError || error}</p>}
              {successMessage && <p className="landing-login-success" role="status">{successMessage}</p>}
              <button className="landing-btn landing-btn-primary landing-login-submit" type="submit" disabled={isPending}>{isPending ? '로그인 중…' : '로그인'}</button>
              <div className="landing-auth-switch">
                <span>계정이 없으신가요?</span>{' '}
                <button type="button" onClick={() => changeMode('signup')}>회원가입하기</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 id="auth-modal-title">회원가입</h2>
            <p className="landing-modal-sub">FestivalScope를 시작하려면 계정을 만들어주세요.</p>
            <form onSubmit={handleSignupSubmit} noValidate>
              <label className="landing-field-label" htmlFor="signup-name">이름</label>
              <input ref={firstFieldRef} id="signup-name" className="landing-input" type="text" autoComplete="name" placeholder="홍길동" value={name} onChange={(event) => setName(event.target.value)} />
              <label className="landing-field-label" htmlFor="signup-email">기관 이메일</label>
              <input id="signup-email" className="landing-input" type="email" autoComplete="email" placeholder="name@gp.go.kr" value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} />
              <label className="landing-field-label" htmlFor="signup-password">비밀번호</label>
              <input id="signup-password" className="landing-input" type="password" autoComplete="new-password" placeholder="••••••••" value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} />
              {formError && <p className="landing-login-error" role="alert">{formError}</p>}
              <button className="landing-btn landing-btn-primary landing-login-submit" type="submit" disabled={isPending}>{isPending ? '회원가입 중…' : '회원가입'}</button>
              <div className="landing-auth-switch">
                <span>이미 계정이 있으신가요?</span>{' '}
                <button type="button" onClick={() => changeMode('login')}>로그인하기</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
