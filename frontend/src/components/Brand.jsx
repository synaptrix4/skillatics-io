import Logo from './Logo'

/**
 * Brand Component
 * Displays Skillatics logo with text for navigation headers
 */
export default function Brand({ size = 'md', theme = 'light', withText = true }) {
  const sizeMap = { sm: 'h-6', md: 'h-8', lg: 'h-10' }
  const logoSize = sizeMap[size] || sizeMap.md

  if (!withText) {
    return <Logo className={logoSize} />
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Logo className={logoSize} />
      <span className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-white' : 'text-gray-900'}`}>
        Skillatics
      </span>
    </div>
  )
}
