import * as React from 'react'
import { cn } from '@/lib/utils'

interface Target {
  id: string
  value: string | number
  period?: string
  color?: string
}

interface KpiTargetCardProps {
  title: string
  targetLabel?: string
  targets: Array<Target>
  className?: string
}

const Pill: React.FC<{
  target: Target
  isAnnual: boolean
  index?: number
}> = ({ target, isAnnual, index }) => {
  const getOrdinal = (n: number) => {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return '4th'
  }

  return (
    <div
      className={cn(
        'relative rounded-md px-4 py-2 text-sm font-medium',
        isAnnual
          ? 'bg-linear-to-r from-blue-500 to-green-500 text-white text-lg px-6 py-3 shadow-lg'
          : 'bg-linear-to-r from-blue-400 to-green-400 text-white shadow-md',
        'select-none',
      )}
      style={target.color ? { backgroundColor: target.color } : undefined}
    >
      {isAnnual ? (
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs opacity-80">Annual: </span>
          <span>{target.value}</span>
        </div>
      ) : (
          <div className="flex flex-row items-center gap-2">
            <span className="text-xs opacity-80">{getOrdinal((index ?? 0) + 1)} quarter: </span>
          <span>{target.value}</span>
        </div>
      )}
    </div>
  )
}

export const KpiTargetCard = ({
  title,
  targetLabel,
  targets,
  className,
}: KpiTargetCardProps) => {
  const isAnnual = targets.length === 1 
  return (
    <div
      className={cn(
        'relative p-4 rounded-md border border-blue-500 bg-white shadow-md flex flex-col space-y-2',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {targetLabel && (
          <span className="text-sm text-gray-500">{targetLabel}</span>
        )}
      </div>
      <div className="px-6 items-center flex flex-row justify-center">
        {isAnnual ? (
          <div className="flex justify-center">
            {targets.length > 0 && <Pill target={targets[0]} isAnnual={true} />}
          </div>
        ) : (
            <div className="flex flex-row items-center justify-center gap-4">
            {targets.slice(0, 4).map((target, index) => (
              <Pill key={target.id} target={target} isAnnual={false} index={index} />
            ))}
            {/* Fill up to 4 if fewer targets */}
            {Array.from({ length: Math.max(0, 4 - targets.length) }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="h-12 w-20 rounded-full bg-gray-100 opacity-50"
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
