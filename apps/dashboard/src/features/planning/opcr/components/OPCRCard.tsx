import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import type { OPCR } from '@/features/planning/opcr/types/type.opcr'

interface OPCRCardProps {
  opcr: OPCR
  onView: (opcr: OPCR) => void
}

const getStatusClasses = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    case 'FOR PMT REVIEW':
    case 'SUBMITTED':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/35'
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/35'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
}

const getStatusLabel = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'Draft'
    case 'SUBMITTED':
    case 'FOR PMT REVIEW':
      return 'For PMT Review'
    case 'APPROVED':
      return 'Approved'
    default:
      return status ?? 'Unknown'
  }
}

export default function OPCRCard({ opcr, onView }: OPCRCardProps) {
  // Prefer server-provided counts; fall back to array length only when unavailable
  const kpiCount =
    opcr.kpiAssignmentCount ?? opcr.dukpiTargetAssignments?.length ?? 0
  const activityCount = opcr.activityCount ?? opcr.opcrActivities?.length ?? 0

  const fyYear =
    typeof opcr.fiscalYear === 'number'
      ? opcr.fiscalYear
      : opcr.fiscalYear?.year ?? ''
  const fyLabel = fyYear ? `FY ${fyYear}` : 'FY'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onView(opcr)
    }
  }

  return (
    <button
      className="group relative bg-card dark:bg-slate-900/65 hover:bg-muted/30 dark:hover:bg-slate-800/75 border border-border hover:border-primary/45 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden cursor-pointer"
      onClick={() => onView(opcr)}
      onKeyDown={handleKeyDown}
      type="button"
      aria-label={`View OPCR ${opcr.name || fyLabel}`}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="p-3 bg-primary/10 dark:bg-primary/15 border border-primary/20 group-hover:bg-primary/15 dark:group-hover:bg-primary/25 rounded-xl transition-all duration-300 flex-shrink-0">
              <Calendar className="h-6 w-6 text-primary dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3
                      tabIndex={0}
                      className="text-xl font-bold text-foreground group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight"
                    >
                      {opcr.name || (fyYear ? `OPCR ${fyYear}` : 'OPCR')}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-[20rem] text-sm"
                  >
                    {opcr.name || (fyYear ? `OPCR ${fyYear}` : 'OPCR')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground transition-colors">
                {fyLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className={`${getStatusClasses(opcr.commitmentStatus || '')} text-xs font-semibold max-w-[7rem] line-clamp-2 break-words !block text-center`}
            >
              {getStatusLabel(opcr.commitmentStatus || '')}
            </Badge>

            {/* Arrow indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            Manage OPCR records and performance commitments for {fyYear || 'selected year'}
          </p>

          {/* Metrics */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">KPIs:</span>
            <span className="font-semibold text-foreground tabular-nums">{kpiCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Activities:</span>
            <span className="font-semibold text-foreground tabular-nums">{activityCount}</span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500 group-hover:w-full w-0"></div>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary dark:group-hover:text-indigo-300 transition-colors">
              Ready
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
