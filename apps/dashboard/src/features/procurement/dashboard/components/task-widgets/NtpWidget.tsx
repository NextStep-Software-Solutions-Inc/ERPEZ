import { Progress } from '@/components/ui/progress'
import { Clock, CalendarCheck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { IssueNTPMetadata } from '../../types'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface Props {
  metadata: IssueNTPMetadata
}



export function NtpWidget({ metadata }: Props) {
  const { contractNo, contractAmount, timelinePercent, mobilizationDate, pendingDays } = metadata
  const isOverdue = pendingDays < 0
  const formattedDate = format(parseISO(mobilizationDate), 'MMM dd, yyyy')

  return (
    <div className="space-y-3 pt-1">
      {/* Contract info row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-gray-500">Contract</p>
          <p className="text-sm font-bold text-gray-900">{contractNo}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500">Amount</p>
          <p className="text-sm font-bold text-emerald-700">{formatCurrencyAbbr(contractAmount)}</p>
        </div>
      </div>

      {/* Timeline progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Project Timeline Progress</span>
          <span className="font-bold text-blue-700">{timelinePercent}%</span>
        </div>
        <Progress value={timelinePercent} className="h-2" />
      </div>

      {/* Mobilization date + overdue indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${
            isOverdue
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {isOverdue ? (
            <Clock className="h-3 w-3" />
          ) : (
            <CalendarCheck className="h-3 w-3" />
          )}
          <span>
            {isOverdue
              ? `${Math.abs(pendingDays)} day${Math.abs(pendingDays) !== 1 ? 's' : ''} overdue`
              : `${pendingDays} day${pendingDays !== 1 ? 's' : ''} to mobilization`}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">Mob. {formattedDate}</span>
      </div>
    </div>
  )
}
