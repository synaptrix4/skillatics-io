import { Target } from 'lucide-react'

export default function Brand({ withText = true, size = 'md' }) {
  const sizeMap = {
    sm: { box: 'h-6 w-6', icon: 'h-3.5 w-3.5', text: 'text-base' },
    md: { box: 'h-8 w-8', icon: 'h-5 w-5', text: 'text-xl' },
    lg: { box: 'h-10 w-10', icon: 'h-6 w-6', text: 'text-2xl' },
  }
  const s = sizeMap[size] || sizeMap.md
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`flex ${s.box} items-center justify-center rounded-lg bg-indigo-600`}>
        <Target className={`${s.icon} text-white`} />
      </div>
      {withText && <span className={`${s.text} font-bold text-gray-900`}>Skillatics</span>}
    </div>
  )
}


