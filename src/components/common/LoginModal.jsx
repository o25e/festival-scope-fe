import { useState } from 'react'
import Button from './Button'

export default function LoginModal({ open, onClose, onLogin }) {
  const [email, setEmail] = useState('')
  if (!open) return null
  return <div className="mask" onClick={onClose}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="x" onClick={onClose} aria-label="로그인 창 닫기">×</button>
      <h2>로그인</h2><p className="sub">기획안 검증을 시작하려면 로그인하세요.</p>
      <label htmlFor="email">기관 이메일</label>
      <input id="email" className="inp" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@gp.go.kr" />
      <label htmlFor="password">비밀번호</label><input id="password" className="inp" type="password" placeholder="••••••••" />
      <Button className="full-btn" onClick={onLogin}>로그인</Button>
      <div className="demo">계정이 없으신가요? <button onClick={onLogin}>데모 계정으로 체험하기</button></div>
    </div>
  </div>
}
