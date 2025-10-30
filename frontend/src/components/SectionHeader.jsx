export default function SectionHeader({ eyebrow, title, align = 'center', className = '' }) {
  const alignCls = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
  return (
    <div className={`mx-auto max-w-3xl ${alignCls} ${className}`}>
      {eyebrow && (
        <div className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          {eyebrow}
        </div>
      )}
      {title && (
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      )}
    </div>
  )
}


