export default function SegmentedControl({ options, value, onChange }) {
  return <div className="segs">{options.map((option) => <button key={option} className={`seg ${value === option ? 'on' : ''}`} onClick={() => onChange(option)}>{option}</button>)}</div>
}
