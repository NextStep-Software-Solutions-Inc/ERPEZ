import { Check } from 'lucide-react'
import type { SDG } from '../../SDGs/types'
import { cn } from '@/lib/utils'

interface SDGImageCardProps {
  sdg: SDG
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function SDGImageCard({
  sdg,
  isSelected = false,
  onClick,
  className,
}: SDGImageCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative cursor-pointer overflow-hidden transition-all duration-200',
        'hover:shadow-lg hover:scale-105',
        isSelected && 'ring-2 ring-offset-1',
        className,
      )}
    >
      {/* SDG Image */}
      <img
        src={`/sdgs/${sdg.name}.png`}
        alt={sdg.name}
        className="w-full h-full object-cover"
      />
      {isSelected && (
        <div className="absolute top-1 right-1 rounded-full p-1 shadow-md">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}
    </div>
  )
}
