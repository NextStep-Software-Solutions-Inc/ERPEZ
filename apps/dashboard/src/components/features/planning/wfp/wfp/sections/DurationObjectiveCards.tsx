import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WFPDetails } from '../table/types'

interface DurationObjectiveCardsProps {
  wfp: WFPDetails
}

export const DurationObjectiveCards = ({ wfp }: DurationObjectiveCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-xs text-gray-600">Start</p>
            <p className="font-semibold text-gray-900 text-sm">
              {wfp?.projectStartDate 
                ? new Date(wfp.projectStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">End</p>
            <p className="font-semibold text-gray-900 text-sm">
              {wfp?.projectEndDate 
                ? new Date(wfp.projectEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {wfp?.generalObjective && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 line-clamp-3">{wfp.generalObjective}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
