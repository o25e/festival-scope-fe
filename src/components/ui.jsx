export function Button({
  children,
  primary = false,
  ghost = false,
  small = false,
  ...props
}) {
  return (
    <button
      className={`btn ${primary ? 'btn-primary' : ''} ${ghost ? 'btn-ghost' : ''} ${small ? 'btn-sm' : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
export function Input({ label, required, hint, error, full = false, children }) {
  return (
    <div className={`field ${full ? 'full ' : ''}${error ? 'err' : ''}`}>
      <label>
        {label} {required && <span className="req">필수</span>}{' '}
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function WarningNotice({ children }) {
  return (
    <div className="capacity-warning" role="note">
      <span className="capacity-warning-icon" aria-hidden="true">
        !
      </span>
      <p>{children}</p>
    </div>
  )
}

