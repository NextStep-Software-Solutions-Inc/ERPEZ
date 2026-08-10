import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OPCR } from '../../opcr/table/types'

interface OPCRReadinessCardProps {
  opcr: OPCR | undefined
}

export const OPCRReadinessCard = ({ opcr }: OPCRReadinessCardProps) => {
  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
          Readiness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">OPCR Linked</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Budget Set</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">
              {opcr?.activityCount || 0} Activities Ready
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">
              {opcr?.kpiAssignmentCount || 0} Targets Set
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
