export default function Card({ className = '', ...props }) {
  return (
    <div className={`glass-card p-6 ${className}`} {...props} />
  )
}


