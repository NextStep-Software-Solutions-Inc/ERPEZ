/**
 * OPCR Details Dialog
 * Displays comprehensive OPCR information including:
 * - Basic details (name, status, office, budget)
 * - Linked activities
 * - KPI assignments
 * - Evaluations
 */
import { useState, useMemo } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { FileText, Briefcase, Target, CheckCircle, AlertCircle } from 'lucide-react'
import type { OPCR, OPCRActivityDetail, OPCRKPIAssignment, OPCREvaluation } from '@/components/features/planning/wfp/opcr/table/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getOPCRRequest } from '@/components/features/planning/wfp/opcr/handlers/getOPCRRequest'
import type { APIResponse } from 'erpez-shared-lib'
import { formatCurrencyPHP } from '@/utils/formatters'
import { Skeleton } from '@/components/ui/skeleton'

const useGetOPCR = createQueryHookFromTemplate(getOPCRRequest)

interface OPCRDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opcrId: string
  opcr?: OPCR
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'submitted':
      return 'bg-blue-100 text-blue-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'returned':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const OPCRDetailsDialog = ({
  open,
  onOpenChange,
  opcrId,
  opcr: initialOpcr,
}: OPCRDetailsDialogProps) => {
  const [tab, setTab] = useState('overview')

  // Fetch detailed OPCR data - only if we have an opcrId
  const { data: opcrResponse, isLoading } = useGetOPCR({
    pathParams: { id: opcrId || '' },
    queryParams: {},
  })

  // Extract opcr data - handle both direct data and nested data response
  const opcr = useMemo(() => {
    // If we have fetched data, use it
    if (opcrResponse) {
      // The hook might return the data wrapped or unwrapped
      const detailedData = (opcrResponse as APIResponse<OPCR>)?.data || opcrResponse
      return detailedData
    }
    
    // Fallback to initial data passed from parent
    return initialOpcr
  }, [opcrResponse, initialOpcr, opcrId, isLoading])

  // Memoize computed values
  const stats = useMemo(
    () => ({
      totalActivities: opcr?.opcrActivities?.length || 0,
      totalKPIs: opcr?.dukpiAssignments?.length || 0,
      totalEvaluations: opcr?.opcrEvaluations?.length || 0,
      activityBudget:
        opcr?.opcrActivities?.reduce((sum: number, act: OPCRActivityDetail) => sum + (act.budget || 0), 0) ||
        0,
    }),
    [opcr]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-0 h-[85vh]" size="2xl">
        {/* Fixed Header */}
        <DialogHeader className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2.5 bg-amber-100 rounded-lg flex-shrink-0">
                <FileText className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl">
                  {isLoading ? <Skeleton className="h-6 w-40" /> : opcr?.name || 'OPCR Details'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {isLoading ? (
                    <Skeleton className="h-4 w-60" />
                  ) : (
                    `Office: ${opcr?.office?.name || 'N/A'}`
                  )}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities ({stats.totalActivities})</TabsTrigger>
              <TabsTrigger value="kpis">KPIs ({stats.totalKPIs})</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations ({stats.totalEvaluations})</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Status & Budget Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Status
                    </p>
                    <Badge className={getStatusColor(opcr?.status)}>
                      {opcr?.status || 'Unknown'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Total Budget
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrencyPHP(opcr?.totalBudget || 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Fiscal Year
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {opcr?.fiscalYear?.name || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Details Grid */}
              <Card className="border-amber-100 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="text-base">Core Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Office/Department</p>
                      <p className="text-sm text-gray-900 font-semibold mt-1">
                        {opcr?.office?.name || opcr?.officeName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivery Unit</p>
                      <p className="text-sm text-gray-900 font-semibold mt-1">
                        {opcr?.deliveryUnit?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created Date</p>
                      <p className="text-sm text-gray-900 font-semibold mt-1">
                        {opcr?.createdDate
                          ? new Date(opcr.createdDate).toLocaleDateString()
                          : opcr?.createdAt
                            ? new Date(opcr.createdAt).toLocaleDateString()
                            : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Updated</p>
                      <p className="text-sm text-gray-900 font-semibold mt-1">
                        {opcr?.updatedAt ? new Date(opcr.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Activities</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                          {stats.totalActivities}
                        </p>
                      </div>
                      <Briefcase className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Activity Budget</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">
                          {formatCurrencyPHP(stats.activityBudget)}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              {stats.totalActivities === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No activities assigned to this OPCR</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {opcr?.opcrActivities?.map((activity: OPCRActivityDetail) => (
                    <Card key={activity.id} className="overflow-hidden">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-gray-500">
                                <span className="font-medium">Status: </span>
                                {activity.activityStatus || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                <span className="font-medium">KPI: </span>
                                {activity.kpiName || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">Budget</p>
                            <p className="text-lg font-bold text-gray-800">
                              {formatCurrencyPHP(activity.budget || 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* KPIs Tab */}
            <TabsContent value="kpis" className="space-y-4">
              {stats.totalKPIs === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No KPIs assigned to this OPCR</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {opcr?.dukpiAssignments?.map((kpi: OPCRKPIAssignment) => (
                    <Card key={kpi.id || kpi.kpiId} className="overflow-hidden">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {kpi.kpiName || kpi.name || 'KPI'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {kpi.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-gray-500">
                                <span className="font-medium">Target: </span>
                                {kpi.targetValue || '—'}
                              </span>
                              <span className="text-xs text-gray-500">
                                <span className="font-medium">UOM: </span>
                                {kpi.unitOfMeasure || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">{kpi.status || 'Active'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Evaluations Tab */}
            <TabsContent value="evaluations" className="space-y-4">
              {stats.totalEvaluations === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No evaluations conducted yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {opcr?.opcrEvaluations?.map((evaluation: OPCREvaluation) => (
                    <Card key={evaluation.id} className="overflow-hidden">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {evaluation.evaluatorName || 'Evaluator'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {evaluation.comments || 'No comments provided'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(evaluation.evaluationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(evaluation.status)}>
                            {evaluation.status || 'Unknown'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
