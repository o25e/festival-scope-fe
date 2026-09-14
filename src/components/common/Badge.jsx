export default function Badge({ risk, children = risk }) {
  const className = { LOW: 'b-low', MODERATE: 'b-mod', HIGH: 'b-high', OPPORTUNITY: 'b-teal' }[risk] || 'b-mod'
  return <span className={`badge ${className}`}>{children}</span>
}
