import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoticeOfAwardInboxFilter } from '../types'

export type NoticeOfAwardSummaryCardProps = {
  id: NoticeOfAwardInboxFilter
  title: string
  count: number
  icon: LucideIcon
  isSelected: boolean
  onClick: () => void
  colorTheme: 'indigo' | 'slate' | 'sky' | 'rose' | 'emerald'
}

const THEME_STYLES: Record<
  NoticeOfAwardSummaryCardProps['colorTheme'],
  {
    borderLeft: string
    activeBorder: string
    countText: string
    badgeBg: string
    badgeText: string
  }
> = {
  indigo: {
    borderLeft: 'border-l-blue-500',
    activeBorder: 'border-blue-400 ring-2 ring-blue-500/30',
    countText: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-600',
  },
  slate: {
    borderLeft: 'border-l-slate-400',
    activeBorder: 'border-slate-400 ring-2 ring-slate-400/30',
    countText: 'text-slate-700',
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeText: 'text-slate-600',
  },
  sky: {
    borderLeft: 'border-l-sky-500',
    activeBorder: 'border-sky-400 ring-2 ring-sky-500/30',
    countText: 'text-sky-700',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-600',
  },
  rose: {
    borderLeft: 'border-l-rose-500',
    activeBorder: 'border-rose-400 ring-2 ring-rose-500/30',
    countText: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-600',
  },
  emerald: {
    borderLeft: 'border-l-emerald-500',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/30',
    countText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-600',
  },
}

export function NoticeOfAwardSummaryCard({
  title,
  count,
  icon: Icon,
  onClick,
  colorTheme,
  isSelected,
}: NoticeOfAwardSummaryCardProps) {
  const theme = THEME_STYLES[colorTheme]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border border-default-200 bg-white p-4 transition-all duration-200 flex flex-col justify-between gap-2 shadow-xs cursor-pointer select-none border-l-4 hover:translate-y-[-2px] hover:shadow-md',
        theme.borderLeft,
        isSelected && cn('bg-default-50/70 shadow-sm', theme.activeBorder)
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        <div
          className={cn(
            'p-1.5 rounded-md border flex items-center justify-center shrink-0 shadow-2xs',
            theme.badgeBg
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className={cn('text-2xl font-extrabold tracking-tight', theme.countText)}>
          {count}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          {isSelected ? 'Active Filter' : 'Click to filter'}
        </span>
      </div>
    </button>
  )
}




