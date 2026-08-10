import { ReactNode } from 'react'

interface ModeCardProps {
  title: string
  description: string
  icon?: ReactNode
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

/**
 * Tile used for selecting the WFP creation mode (OPCR or External).
 * Highlights when `selected` is true and calls `onClick` when pressed.
 */
export default function ModeCard({
  title,
  description,
  icon,
  selected = false,
  onClick,
  disabled = false,
}: ModeCardProps) {
  return (
    <div
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          onClick()
          e.preventDefault()
        }
      }}
      className={`cursor-pointer p-4 border rounded-lg transition-all shadow-sm ${
        selected
          ? 'border-[#10b981] bg-green-50 shadow-md'
          : 'border-gray-200 hover:shadow-md hover:border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center mb-2">
        {icon && <span className="mr-2 flex-shrink-0 text-[#10b981]">{icon}</span>}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
