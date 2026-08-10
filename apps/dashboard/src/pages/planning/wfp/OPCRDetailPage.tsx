import { useNavigate } from '@tanstack/react-router'
import {
  Plus,
  Target,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getOPCRRequest } from '@/components/features/planning/wfp/opcr/handlers/getOPCRRequest'

const useOPCR = createQueryHookFromTemplate(getOPCRRequest)

interface OPCRDetailPageProps {
  wfpId: string
  opcrId: string
}

interface ActivityTarget {
  id: string
  indicator: string
  targetValue: number
  month: string
}

interface MockActivity {
  id: string
  name: string
  description: string
  weight: number
  targets: ActivityTarget[]
}

interface TransformedActivity extends Omit<any, 'targets'> {
  id: string
  name: string
  description: string
  weight: number
  targets: ActivityTarget[]
}

function OPCRDetailPage({ wfpId, opcrId }: OPCRDetailPageProps) {
  const navigate = useNavigate()

  const { data: opcrData, isLoading } = useOPCR({
    pathParams: { id: opcrId },
    queryParams: {},
  })

  // Mock OPCR activities for development
  const isDevelopment = import.meta.env.DEV
  const mockActivities: MockActivity[] = isDevelopment
    ? [
        {
          id: 'activity-1',
          name: 'Strategic Planning & Governance',
          description: 'Develop and implement strategic plans aligned with organizational goals',
          weight: 25,
          targets: [
            {
              id: 'target-1',
              indicator: 'Strategic Plans Completed',
              targetValue: 1,
              month: 'Q1',
            },
            {
              id: 'target-2',
              indicator: 'Governance Reviews Conducted',
              targetValue: 4,
              month: 'Quarterly',
            },
          ],
        },
        {
          id: 'activity-2',
          name: 'Operational Excellence',
          description: 'Improve operational efficiency and process optimization',
          weight: 20,
          targets: [
            {
              id: 'target-3',
              indicator: 'Process Improvements Implemented',
              targetValue: 5,
              month: 'Ongoing',
            },
            {
              id: 'target-4',
              indicator: 'Efficiency Gain (%)',
              targetValue: 15,
              month: 'Annual',
            },
          ],
        },
        {
          id: 'activity-3',
          name: 'Stakeholder Engagement',
          description: 'Enhance communication and engagement with key stakeholders',
          weight: 20,
          targets: [
            {
              id: 'target-5',
              indicator: 'Stakeholder Meetings Held',
              targetValue: 12,
              month: 'Monthly',
            },
            {
              id: 'target-6',
              indicator: 'Satisfaction Score',
              targetValue: 85,
              month: 'Annual Survey',
            },
          ],
        },
        {
          id: 'activity-4',
          name: 'Resource Management',
          description: 'Optimize resource allocation and utilization',
          weight: 18,
          targets: [
            {
              id: 'target-7',
              indicator: 'Budget Variance',
              targetValue: 5,
              month: 'Quarterly',
            },
            {
              id: 'target-8',
              indicator: 'Resource Utilization',
              targetValue: 90,
              month: 'Monthly',
            },
          ],
        },
        {
          id: 'activity-5',
          name: 'Risk Management & Compliance',
          description: 'Ensure compliance and manage organizational risks',
          weight: 17,
          targets: [
            {
              id: 'target-9',
              indicator: 'Compliance Audits Passed',
              targetValue: 100,
              month: 'Annual',
            },
            {
              id: 'target-10',
              indicator: 'Risk Mitigation Plans',
              targetValue: 3,
              month: 'as needed',
            },
          ],
        },
      ]
    : []

  if (isLoading) {
    return (
      <PageContainer
        title="OPCR Details"
        backTo={true}
        backLabel="Back to OPCR List"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading OPCR details...</p>
        </div>
      </PageContainer>
    )
  }

  const opdcrInfo = opcrData?.data || {
    id: opcrId,
    name: 'Office Performance Commitment and Review',
    status: 'Draft',
    totalBudget: 250000,
    office: {
      id: 'exec-unit',
      name: 'Executive Office',
    } as any,
    fiscalYear: {
      id: 'fy-2026',
      year: 2026,
    },
    ratingStatus: null,
    submittedDate: null,
    createdDate: new Date().toISOString().split('T')[0],
  }

  // Use activities from OPCR data, or fall back to mock activities
  const activities = opcrData?.data?.activities || mockActivities

  // Transform activities to match the expected format
  const transformedActivities: TransformedActivity[] = activities.map(activity => {
    // If activity has quarterlyTargets, transform to targets array
    if ('quarterlyTargets' in activity) {
      const quarterlyActivity = activity as any
      return {
        ...activity,
        targets: [
          {
            id: `${activity.id}-q1`,
            indicator: quarterlyActivity.indicator,
            targetValue: quarterlyActivity.quarterlyTargets.q1,
            month: 'Q1',
          },
          {
            id: `${activity.id}-q2`,
            indicator: quarterlyActivity.indicator,
            targetValue: quarterlyActivity.quarterlyTargets.q2,
            month: 'Q2',
          },
          {
            id: `${activity.id}-q3`,
            indicator: quarterlyActivity.indicator,
            targetValue: quarterlyActivity.quarterlyTargets.q3,
            month: 'Q3',
          },
          {
            id: `${activity.id}-q4`,
            indicator: quarterlyActivity.indicator,
            targetValue: quarterlyActivity.quarterlyTargets.q4,
            month: 'Q4',
          },
        ] as ActivityTarget[],
      } as TransformedActivity
    }
    return activity as TransformedActivity
  })

  const totalWeight = transformedActivities.reduce((sum, activity) => sum + activity.weight, 0)

  return (
    <PageContainer
      title={opdcrInfo.name || 'OPCR Details'}
      description="Office Performance Commitment and Review - Activities and Targets"
      backTo={true}
      backLabel="Back to OPCR List"
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate({ 
              to: '/v2/wfp/$wfpId',
              params: { wfpId }
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to WFP
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#059669] text-white shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* OPCR Overview Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-50/20 to-orange-50/20 border-b">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
              <FileText className="h-5 w-5 text-amber-600" />
              OPCR Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</p>
                <p className="text-lg font-bold text-gray-800">{opdcrInfo.status || 'Draft'}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total Budget</p>
                <p className="text-lg font-bold text-gray-800">${(opdcrInfo.totalBudget || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50/50 border border-green-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Department</p>
                <p className="text-lg font-bold text-gray-800">{opdcrInfo.office?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Distribution Summary */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              Performance Activities & Weight Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full"
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total Weight: <span className="font-semibold">{totalWeight}%</span>
              {totalWeight !== 100 && <span className="text-amber-600 ml-2">({100 - totalWeight}% remaining)</span>}
            </p>
          </CardContent>
        </Card>

        {/* Activities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Performance Activities</h2>
              <p className="text-sm text-gray-500">Manage activities and targets for this OPCR</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              {transformedActivities.length} Activities
            </span>
          </div>

          <div className="space-y-4">
            {transformedActivities.map((activity) => (
              <Card key={activity.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base text-gray-800">{activity.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {activity.weight}% Weight
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-600" />
                      Performance Targets
                    </h4>
                    <div className="space-y-2">
                      {activity.targets.map((target: ActivityTarget) => (
                        <div
                          key={target.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{target.indicator}</p>
                            <p className="text-xs text-gray-500 mt-1">Timeline: {target.month}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">{target.targetValue}</p>
                            <p className="text-xs text-gray-500">Target Value</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default OPCRDetailPage
