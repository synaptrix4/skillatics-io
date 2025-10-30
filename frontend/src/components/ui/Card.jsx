export default function Card({ className = '', ...props }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`} {...props} />
  )
}


