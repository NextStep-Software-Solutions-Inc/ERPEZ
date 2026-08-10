import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { OPCRActivity } from '@/components/features/planning/wfp/opcr/table/types'

interface OPCRActivitiesSectionProps {
  activities?: OPCRActivity[]
  totalBudget: number
  onActivitySelect?: (activity: OPCRActivity) => void
}

export function OPCRActivitiesSection({
  activities = [],
  totalBudget,
  onActivitySelect,
}: OPCRActivitiesSectionProps) {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(
    activities[0]?.id || null
  )

  // Calculate total quarterly targets across all activities
  const totalQuarterlyTargets = useMemo(() => {
    return activities.reduce(
      (acc, activity) => ({
        q1: acc.q1 + (activity.quarterlyTargets?.q1 || 0),
        q2: acc.q2 + (activity.quarterlyTargets?.q2 || 0),
        q3: acc.q3 + (activity.quarterlyTargets?.q3 || 0),
        q4: acc.q4 + (activity.quarterlyTargets?.q4 || 0),
      }),
      { q1: 0, q2: 0, q3: 0, q4: 0 }
    )
  }, [activities])

  if (!activities || activities.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="pt-8 pb-8 flex items-center justify-center gap-4">
          <p className="text-muted-foreground">No activities available for this OPCR</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Activities Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">OPCR Activities</h3>
            <p className="text-sm text-gray-500">
              {activities.length} activities with quarterly targets
            </p>
          </div>
        </div>
        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-700">
            Budget Ceiling: <span className="text-lg">${totalBudget?.toLocaleString() || 0}</span>
          </p>
        </div>
      </div>

      {/* Quarterly Summary Grid */}
      <Card className="shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50/50 to-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Quarterly Targets Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, idx) => {
              const key = (['q1', 'q2', 'q3', 'q4'][idx] as keyof typeof totalQuarterlyTargets)
              const value = totalQuarterlyTargets[key]
              return (
                <div
                  key={quarter}
                  className="p-3 rounded-lg bg-white border border-blue-100"
                >
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{quarter}</p>
                  <p className="text-2xl font-bold text-blue-600">{value}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="shadow-sm border hover:border-blue-200 transition-colors cursor-pointer"
            onClick={() => {
              setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)
              onActivitySelect?.(activity)
            }}
          >
            <CardContent className="pt-4">
              {/* Activity Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1 bg-blue-50 rounded">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      {activity.weight}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-7">{activity.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedActivityId(expandedActivityId === activity.id ? null : activity.id)
                  }}
                >
                  {expandedActivityId === activity.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Activity Details - Expanded */}
              {expandedActivityId === activity.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Indicator */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">KPI Indicator</p>
                      <p className="text-sm font-semibold text-gray-800">{activity.indicator}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Weight</p>
                      <p className="text-sm font-semibold text-gray-800">{activity.weight}%</p>
                    </div>
                  </div>

                  {/* Quarterly Targets (Read-Only) */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <p className="text-xs font-semibold text-amber-900 uppercase mb-3">
                      📊 Pre-set Quarterly Targets (Read-Only)
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {['q1', 'q2', 'q3', 'q4'].map((quarter, idx) => {
                        const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
                        const value =
                          activity.quarterlyTargets?.[
                            quarter as keyof typeof activity.quarterlyTargets
                          ] || 0
                        return (
                          <div key={quarter} className="text-center">
                            <p className="text-xs font-medium text-amber-700 mb-1">{quarters[idx]}</p>
                            <p className="text-lg font-bold text-amber-900">{value}</p>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-amber-700 mt-3 italic">
                      ✓ These targets come from the OPCR KPI and cannot be modified in WFP planning
                    </p>
                  </div>

                  {/* Info Message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">💡 Note:</span> These activities form the basis for your WFP planning. 
                      Use these targets to structure your financial resources and timeline.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Constraint Warning */}
      <Card className="shadow-sm border border-amber-100 bg-amber-50/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Target className="h-4 w-4 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">Financial Constraint</p>
              <p className="text-xs text-amber-700">
                The total expenditure of all financial items added to this WFP must not exceed the 
                Departmental Budget Ceiling of <span className="font-bold">${totalBudget?.toLocaleString() || 0}</span>.
                Budget tracking will be monitored during financial planning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
