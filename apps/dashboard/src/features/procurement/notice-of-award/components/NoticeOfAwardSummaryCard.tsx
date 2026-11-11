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
    countText: 'text-blue-700 dark:text-blue-300',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  slate: {
    borderLeft: 'border-l-muted-foreground',
    activeBorder: 'border-border ring-2 ring-muted-foreground/30',
    countText: 'text-foreground',
    badgeBg: 'bg-secondary text-muted-foreground border-border',
    badgeText: 'text-muted-foreground',
  },
  sky: {
    borderLeft: 'border-l-sky-500',
    activeBorder: 'border-sky-400 ring-2 ring-sky-500/30',
    countText: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    badgeText: 'text-sky-600 dark:text-sky-400',
  },
  rose: {
    borderLeft: 'border-l-rose-500',
    activeBorder: 'border-rose-400 ring-2 ring-rose-500/30',
    countText: 'text-rose-700 dark:text-rose-300',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
  },
  emerald: {
    borderLeft: 'border-l-emerald-500',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/30',
    countText: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
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
        'w-full text-left rounded-xl border border-border bg-card p-4 transition-all duration-200 flex flex-col justify-between gap-2 shadow-xs cursor-pointer select-none border-l-4 hover:translate-y-[-2px] hover:bg-secondary/40 hover:shadow-md',
        theme.borderLeft,
        isSelected && cn('bg-secondary/70 shadow-sm', theme.activeBorder)
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




