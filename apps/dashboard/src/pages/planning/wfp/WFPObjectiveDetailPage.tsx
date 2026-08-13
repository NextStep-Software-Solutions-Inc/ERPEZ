import { Percent, Plus, TrendingUp, Activity, CheckCircle2, Clock, Circle, Info } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useSetAtom } from 'jotai'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/ui/button'
import { toSentenceCase, toTitleCase } from '@/utils/formatters'
import { getWFPObjectiveRequest } from '@/components/features/planning/wfp/wfp-objective/handlers/getWFPObjectiveRequest'
import { getWFPObjectiveTargetsRequest } from '@/components/features/planning/wfp/wfp-objective-target/handlers/getWFPObjectivesTargetRequest'
import { createDialogAtom } from '@/components/features/planning/wfp/wfp-objective-target/atoms'
import CreateWFPObjectiveTargetDialog from '@/components/features/planning/wfp/wfp-objective-target/dialog/CreateWFPObjectiveTargetDialog'
import UpdateWFPObjectiveTargetDialog from '@/components/features/planning/wfp/wfp-objective-target/dialog/UpdateWFPObjectiveTargetDialog'
import DeleteWFPObjectiveTargetDialog from '@/components/features/planning/wfp/wfp-objective-target/dialog/DeleteWFPObjectiveTargetDialog'
import { TemplateTable } from '@/components/TemplateTable'
import { Column } from '@/components/features/planning/wfp/wfp-objective-target/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const useWFPObjective = createQueryHookFromTemplate(getWFPObjectiveRequest)
const useWFPObjectiveActivities = createQueryHookFromTemplate(getWFPObjectiveTargetsRequest)

function WFPObjectiveDetailPage({ wfpObjectiveId }: { wfpObjectiveId: string }) {
  
  const { data: wfpObjectiveData, isLoading: isLoadingObjective } = useWFPObjective({
    pathParams: { id: wfpObjectiveId },
    queryParams: {}
  })

  const { data: activitiesResponse, isLoading: isLoadingActivities } = useWFPObjectiveActivities({
    pathParams: {},
    queryParams: {
      filters: `wfpObjectiveId==${wfpObjectiveId}`
    }
  })

  const setCreateDialog = useSetAtom(createDialogAtom)

  if (isLoadingObjective || !wfpObjectiveData?.data || isLoadingActivities) {
    return <div className="p-8 text-center">Loading...</div>
  }

  const activities = activitiesResponse?.data || []
  const objWeight = Number(wfpObjectiveData.data.weight) || 0
  const totalActivitiesWeight = activities.reduce(
    (sum: number, act: any) => sum + (Number(act.weight) || 0),
    0,
  )
  const remainingActWeight = objWeight - totalActivitiesWeight
  const isFullyAllocated = totalActivitiesWeight === objWeight && objWeight > 0
  const isOverAllocated = totalActivitiesWeight > objWeight
  const progressPct = objWeight > 0 ? Math.min(100, (totalActivitiesWeight / objWeight) * 100) : 0

  return (
    <PageContainer
      title={toTitleCase(wfpObjectiveData.data.description) || 'WFP Objective Details'}
      backTo={{ to: '/v2/wfp/$wfpId', params: { wfpId: wfpObjectiveData.data.wfp.id } }}
      backLabel="Back to WFP Objectives"
    >
      <div className="space-y-4 mx-auto">
        {/* Info Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Expected Outcome Card */}
          <Card className="md:col-span-2 border-emerald-100/60 shadow-xs hover:shadow-sm transition-all duration-300">
            <CardHeader className="py-2.5 px-4">
              <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Expected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <p className="text-xs font-medium text-slate-700 leading-relaxed italic bg-emerald-50/20 p-2.5 rounded-lg border-l-4 border-emerald-500">
                "{toSentenceCase(wfpObjectiveData.data.outcome) || 'No outcome specified.'}"
              </p>
            </CardContent>
          </Card>

          {/* Metrics Column */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {/* Activity Weight Allocation Card */}
            <Card className="border-blue-100/60 shadow-xs hover:shadow-sm transition-all duration-300">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="space-y-1 flex-1 pr-3">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5" /> Activity Weight Allocation
                  </span>
                  <div className="w-full bg-blue-100/50 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isFullyAllocated
                          ? 'bg-emerald-600'
                          : isOverAllocated
                            ? 'bg-rose-600'
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-semibold mt-1">
                    {isFullyAllocated ? (
                      <span className="text-emerald-600">✓ Fully Allocated to Activities</span>
                    ) : isOverAllocated ? (
                      <span className="text-rose-600">⚠ {totalActivitiesWeight - objWeight}% Over Objective Weight</span>
                    ) : (
                      <span className="text-amber-600">{remainingActWeight}% Unallocated</span>
                    )}
                  </p>
                </div>
                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-extrabold shadow-2xs whitespace-nowrap">
                  {totalActivitiesWeight}% / {objWeight}%
                </div>
              </CardContent>
            </Card>

            {/* Activities Count Card */}
            <Card className="border-purple-100/60 shadow-xs hover:shadow-sm transition-all duration-300">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Registered Activities
                  </span>
                  <p className="text-[11px] text-slate-500">Actions defined for this objective</p>
                </div>
                <div className="bg-purple-600 text-white px-3 py-1 rounded-xl text-base font-extrabold shadow-2xs">
                  {activities.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activities Table Card */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-0.5">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" /> Activities Registry
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0 font-bold">
                  {activities.length} Activity{activities.length === 1 ? '' : 'ies'}
                </Badge>
              </CardTitle>
              <p className="text-[11px] text-slate-500 font-normal">
                Monitor and manage the timeline segments, weights, and indicators for this objective.
              </p>
            </div>

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs h-7 text-xs px-3 font-semibold flex gap-1.5"
              onClick={() =>
                setCreateDialog({
                  isOpen: true,
                  showUnsavedWarning: false,
                  wfpId: wfpObjectiveData.data.wfpId,
                })
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add Activity
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-2 pt-0.5">
            <TemplateTable
              columns={Column}
              data={activities}
              actions={['read', 'write', 'delete']}
              readonly={false}
            />
          </CardContent>
        </Card>

        {/* Legend Bar */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">
              LEGEND
            </span>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <Clock className="w-4 h-4 text-blue-600" /> In Progress
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Circle className="w-4 h-4 text-slate-300" /> Upcoming
            </div>

            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <div className="text-xs text-slate-600">
              <strong className="text-slate-800 font-bold">Target:</strong> Indicates the quarterly target value
            </div>

            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden md:block" />

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" /> Click any quarter to view or edit timeline details
            </div>
          </div>
        </div>
      </div>
      <CreateWFPObjectiveTargetDialog wfpObjectiveId={wfpObjectiveId} wfpData={wfpObjectiveData.data.wfp} />
      <UpdateWFPObjectiveTargetDialog />
      <DeleteWFPObjectiveTargetDialog />
    </PageContainer>
  )
}

export default WFPObjectiveDetailPage