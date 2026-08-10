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
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'FOR PMT REVIEW':
    case 'SUBMITTED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onView(opcr)
    }
  }

  return (
    <button
      className="group relative bg-linear-to-br from-white to-gray-50 hover:from-primary-50 hover:to-primary-100 border-2 border-gray-200 hover:border-primary-300 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 overflow-hidden cursor-pointer"
      onClick={() => onView(opcr)}
      onKeyDown={handleKeyDown}
      type="button"
      aria-label={`View OPCR ${opcr.name || `FY ${opcr.fiscalYear.year}`}`}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="p-3 bg-linear-to-br from-primary-100 to-primary-200 group-hover:from-primary-200 group-hover:to-primary-300 rounded-xl transition-all duration-300 flex-shrink-0">
              <Calendar className="h-6 w-6 text-primary-600 group-hover:text-primary-700" />
            </div>
            <div className="min-w-0">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3
                      tabIndex={0}
                      className="text-xl font-bold text-gray-900 group-hover:text-primary-900 transition-colors line-clamp-2 leading-tight"
                    >
                      {opcr.name || `OPCR ${opcr.fiscalYear.year}`}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-[20rem] text-sm"
                  >
                    {opcr.name || `OPCR ${opcr.fiscalYear.year}`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-gray-500 group-hover:text-primary-700 transition-colors">
                FY {opcr.fiscalYear.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${getStatusClasses(opcr.commitmentStatus || '')} text-xs max-w-[7rem] line-clamp-2 break-words !block text-center`}
            >
              {getStatusLabel(opcr.commitmentStatus || '')}
            </Badge>

            {/* Arrow indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 bg-linear-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
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
          <p className="text-sm text-gray-600 group-hover:text-primary-800 transition-colors leading-relaxed line-clamp-2">
            Manage OPCR records and performance commitments for{' '}
            {opcr.fiscalYear.year}
          </p>

          {/* Metrics */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">KPIs:</span>
            <span className="font-medium text-gray-900">{kpiCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Activities:</span>
            <span className="font-medium text-gray-900">{activityCount}</span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-linear-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 group-hover:w-full w-0"></div>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-primary-600 transition-colors">
              Ready
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
