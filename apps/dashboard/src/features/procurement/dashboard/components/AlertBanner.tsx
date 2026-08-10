import { AlertTriangle, Clock, FileSignature, ArrowRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { AlertItem } from '../types'
import { cn } from '@/lib/utils'

interface Props {
  alerts: AlertItem[]
  isLoading?: boolean
}

const alertConfig = {
  critical: {
    bg: 'bg-red-50 border-red-200 hover:bg-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    countColor: 'text-red-700',
    labelColor: 'text-red-900',
    sublabelColor: 'text-red-500',
    linkColor: 'text-red-600',
    icon: AlertTriangle,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    countColor: 'text-amber-700',
    labelColor: 'text-amber-900',
    sublabelColor: 'text-amber-500',
    linkColor: 'text-amber-600',
    icon: Clock,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    countColor: 'text-blue-700',
    labelColor: 'text-blue-900',
    sublabelColor: 'text-blue-500',
    linkColor: 'text-blue-600',
    icon: FileSignature,
  },
} as const

function AlertCard({ alert }: { alert: AlertItem }) {
  const navigate = useNavigate()
  const config = alertConfig[alert.severity]
  const Icon = config.icon

  return (
    <button
      onClick={() => navigate({ to: alert.route as Parameters<typeof navigate>[0]['to'] })}
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer flex-1 min-w-0',
        config.bg,
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', config.iconBg)}>
        <Icon className={cn('h-5 w-5', config.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-2xl font-black leading-none', config.countColor)}>{alert.count}</p>
        <p className={cn('text-sm font-semibold mt-0.5 truncate', config.labelColor)}>{alert.label}</p>
        <p className={cn('text-xs mt-0.5', config.sublabelColor)}>{alert.sublabel}</p>
      </div>

      <ArrowRight className={cn('h-4 w-4 shrink-0', config.linkColor)} />
    </button>
  )
}

function AlertSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4 flex-1 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-8 bg-gray-200 rounded" />
        <div className="h-3 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export function AlertBanner({ alerts, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {Array.from({ length: 3 }).map((_, i) => <AlertSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  )
}
