import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toSentenceCase } from '@/utils/formatters'
import type { OPCRActivity } from '@/components/features/planning/wfp/opcr/table/types'

function OPCRActivitiesExpenditureListPage({ 
  wfpId, 
  opcrId,
  activities = []
}: { 
  wfpId: string
  opcrId: string
  activities?: OPCRActivity[]
}) {
  
  const navigate = useNavigate()

  const getQuarterlyTotal = (targets: OPCRActivity['quarterlyTargets'] | undefined): number => {
    if (!targets) return 0
    return (targets.q1 ?? 0) + (targets.q2 ?? 0) + (targets.q3 ?? 0) + (targets.q4 ?? 0)
  }

  // Mock activities if not provided
  const displayActivities = activities.length > 0 ? activities : [
    {
      id: 'activity-1-1',
      opcrId: opcrId,
      name: 'Develop Core Features',
      description: 'Build and implement core product features',
      indicator: 'Features Completed',
      weight: 40,
      quarterlyTargets: { q1: 2, q2: 3, q3: 4, q4: 3 },
    },
    {
      id: 'activity-1-2',
      opcrId: opcrId,
      name: 'User Testing & Feedback',
      description: 'Conduct user testing sessions and gather feedback',
      indicator: 'Test Sessions Completed',
      weight: 30,
      quarterlyTargets: { q1: 1, q2: 2, q3: 2, q4: 2 },
    },
    {
      id: 'activity-1-3',
      opcrId: opcrId,
      name: 'Documentation',
      description: 'Create technical and user documentation',
      indicator: 'Documents Published',
      weight: 30,
      quarterlyTargets: { q1: 1, q2: 1, q3: 2, q4: 1 },
    },
  ]

  return (
    <PageContainer
      title="Manage Activity Expenditures"
      backTo={{ 
        to: '/v2/wfp/$wfpId',
        params: { wfpId }
      }}
      backLabel="Back to WFP Details"
    >
      <div className="space-y-4 mx-auto">
        {/* Header Info */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">📋 Instructions:</span> Select an activity below to manage its expenditures. 
            Each activity's budget is based on its quarterly targets and weight allocation.
          </p>
        </div>

        {/* Activities Listing */}
        <div className="space-y-3">
          {displayActivities.map((activity, index) => (
            <Card key={activity.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="py-4 px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">
                        Activity {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-blue-700">{activity.weight}% Weight</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{activity.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    
                    {/* Activity Meta Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="text-gray-500 font-medium">Indicator</p>
                        <p className="text-gray-700 font-semibold">{toSentenceCase(activity.indicator)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="text-gray-500 font-medium">Q1 Target</p>
                        <p className="text-gray-700 font-semibold">{activity.quarterlyTargets?.q1 ?? 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="text-gray-500 font-medium">Q2 Target</p>
                        <p className="text-gray-700 font-semibold">{activity.quarterlyTargets?.q2 ?? 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <p className="text-gray-500 font-medium">Total Quarters</p>
                        <p className="text-gray-700 font-semibold">
                          {getQuarterlyTotal(activity.quarterlyTargets)}
                        </p>
                      </div>
                    </div>

                    {/* Budget Estimate */}
                    <div className="bg-blue-50 border border-blue-100 p-2 rounded text-xs mb-3">
                      <p className="text-blue-900">
                        <span className="font-semibold">Estimated Budget:</span> $
                        {(getQuarterlyTotal(activity.quarterlyTargets) * 10000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap flex gap-2"
                      onClick={() => navigate({
                        to: '/v2/wfp/$wfpId',
                        params: {
                          wfpId: wfpId,
                        }
                      })}
                    >
                      <Plus className="h-4 w-4" />
                      Add Expenditure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 whitespace-nowrap"
                      onClick={() => navigate({
                        to: '/v2/wfp/$wfpId',
                        params: {
                          wfpId: wfpId,
                        }
                      })}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm">
          <CardContent className="py-4 px-4">
            <h3 className="font-semibold text-blue-900 mb-2">Activity Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <p className="text-blue-600 font-medium">Total Activities</p>
                <p className="text-xl font-bold">{displayActivities.length}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Total Weight</p>
                <p className="text-xl font-bold">{displayActivities.reduce((sum, a) => sum + a.weight, 0)}%</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Total Target Units</p>
                <p className="text-xl font-bold">
                  {displayActivities.reduce((sum, a) => sum + getQuarterlyTotal(a.quarterlyTargets), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

export default OPCRActivitiesExpenditureListPage
