import Button from '../common/Button'

export default function Header({ isLoggedIn, onNavigate, onLogin, onSample, onLogout }) {
  return <header className="nav"><div className="wrap nav-inner">
    <button className="logo" onClick={() => onNavigate('landing')}><span className="dot" />FestivalScope</button>
    <span className="nav-sub">B2G 축제 기획안 사전 검증</span>
    <div className="nav-actions">{isLoggedIn ? <><Button variant="onnavy" size="sm" onClick={() => onNavigate('dashboard')}>분석 문서 목록</Button><Button variant="onnavy" size="sm" onClick={onLogout}>로그아웃</Button></> : <><Button variant="onnavy" size="sm" onClick={onSample}>리포트 예시</Button><Button variant="onnavy" size="sm" onClick={onLogin}>로그인</Button></>}</div>
  </div></header>
}
