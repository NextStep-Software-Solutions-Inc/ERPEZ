import type { LucideIcon } from 'lucide-react'
import { FileText } from 'lucide-react'
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
    cardBg: string
    cardBorder: string
    iconBoxBorder: string
    iconBoxText: string
    countText: string
  }
> = {
  indigo: {
    cardBg: 'bg-indigo-50/80 dark:bg-indigo-950/30',
    cardBorder: 'border-indigo-100 dark:border-indigo-900/60',
    iconBoxBorder: 'border-indigo-100 dark:border-indigo-800',
    iconBoxText: 'text-indigo-600 dark:text-indigo-400',
    countText: 'text-indigo-700 dark:text-indigo-300',
  },
  slate: {
    cardBg: 'bg-gray-50/90 dark:bg-slate-900/30',
    cardBorder: 'border-gray-200/80 dark:border-slate-800/60',
    iconBoxBorder: 'border-slate-200 dark:border-slate-700',
    iconBoxText: 'text-slate-600 dark:text-slate-400',
    countText: 'text-slate-700 dark:text-slate-300',
  },
  sky: {
    cardBg: 'bg-sky-50/80 dark:bg-sky-950/30',
    cardBorder: 'border-sky-100 dark:border-sky-900/60',
    iconBoxBorder: 'border-sky-100 dark:border-sky-800',
    iconBoxText: 'text-sky-600 dark:text-sky-400',
    countText: 'text-sky-700 dark:text-sky-300',
  },
  rose: {
    cardBg: 'bg-rose-50/80 dark:bg-rose-950/30',
    cardBorder: 'border-rose-100 dark:border-rose-900/60',
    iconBoxBorder: 'border-rose-100 dark:border-rose-800',
    iconBoxText: 'text-rose-600 dark:text-rose-400',
    countText: 'text-rose-700 dark:text-rose-300',
  },
  emerald: {
    cardBg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    cardBorder: 'border-emerald-100 dark:border-emerald-900/60',
    iconBoxBorder: 'border-emerald-100 dark:border-emerald-800',
    iconBoxText: 'text-emerald-600 dark:text-emerald-400',
    countText: 'text-emerald-600 dark:text-emerald-300',
  },
}

export function NoticeOfAwardSummaryCard({
  title,
  count,
  icon: Icon,
  onClick,
  colorTheme,
}: NoticeOfAwardSummaryCardProps) {
  const theme = THEME_STYLES[colorTheme]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border p-3.5 transition-all duration-150 flex flex-col justify-between gap-2.5 focus:outline-none cursor-pointer select-none hover:shadow-xs hover:brightness-[0.98]',
        theme.cardBg,
        theme.cardBorder
      )}
    >
      {/* Top Header: Title & Small Icon */}
      <div className="flex items-center justify-between gap-1.5 text-xs font-medium text-muted-foreground w-full">
        <div className="flex items-center gap-1.5 truncate">
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{title}</span>
        </div>
      </div>

      {/* Main Content: White square icon box on left + Bold colored count */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-md bg-white dark:bg-card shadow-xs border flex items-center justify-center shrink-0',
            theme.iconBoxBorder,
            theme.iconBoxText
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className={cn('text-2xl font-bold tracking-tight', theme.countText)}>
            {count}
          </div>
        </div>
      </div>
    </button>
  )
}




