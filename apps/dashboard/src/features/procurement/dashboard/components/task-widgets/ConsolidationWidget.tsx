import { GitMerge } from 'lucide-react'
import type { ConsolidatePRMetadata } from '../../types'
import { Progress } from '@/components/ui/progress'

interface Props {
  metadata: ConsolidatePRMetadata
}

export function ConsolidationWidget({ metadata }: Props) {
  const { totalPRs, consolidatedCount, pendingCount, progressPercent } = metadata

  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2">
          <span className="text-xl font-bold text-blue-700">{totalPRs}</span>
          <span className="text-[10px] text-blue-500 font-medium mt-0.5">Total PRs</span>
        </div>
        <div className="flex flex-col items-center bg-emerald-50 rounded-lg p-2">
          <span className="text-xl font-bold text-emerald-700">{consolidatedCount}</span>
          <span className="text-[10px] text-emerald-500 font-medium mt-0.5">Consolidated</span>
        </div>
        <div className="flex flex-col items-center bg-amber-50 rounded-lg p-2">
          <span className="text-xl font-bold text-amber-700">{pendingCount}</span>
          <span className="text-[10px] text-amber-500 font-medium mt-0.5">Pending</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <GitMerge className="h-3 w-3" />
            <span>Consolidation Progress</span>
          </div>
          <span className="text-xs font-bold text-blue-700">{progressPercent.toFixed(1)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
    </div>
  )
}
