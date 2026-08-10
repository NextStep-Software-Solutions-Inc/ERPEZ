import { Gavel } from 'lucide-react'
import type { EvaluateAOBMetadata } from '../../types'

interface Props {
  metadata: EvaluateAOBMetadata
}

export function AobWidget({ metadata }: Props) {
  const { totalEvaluations, technicalEvaluation, financialEvaluation, rfqNumber } = metadata
  const techPercent = Math.round((technicalEvaluation / totalEvaluations) * 100)
  const finPercent = Math.round((financialEvaluation / totalEvaluations) * 100)

  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <Gavel className="h-3 w-3" />
        <span>Abstract of Bids · {rfqNumber}</span>
      </div>

      {/* Total pending big number */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-violet-700">{totalEvaluations}</span>
        <span className="text-xs text-gray-500">pending evaluations</span>
      </div>

      {/* Technical vs Financial split */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-amber-700">Technical Evaluation</span>
          <span className="font-bold text-amber-700">{technicalEvaluation}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${techPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs mt-1">
          <span className="font-medium text-violet-700">Financial Evaluation</span>
          <span className="font-bold text-violet-700">{financialEvaluation}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-400 transition-all duration-500"
            style={{ width: `${finPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
