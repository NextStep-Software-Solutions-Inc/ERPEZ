import { Percent, Plus, TrendingUp, Activity, CheckCircle2, Clock, Circle, Info } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useSetAtom } from 'jotai'
import { Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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

  const wfpId = wfpObjectiveData.data.wfpId || wfpObjectiveData.data.wfp?.id
  const wfpTitle = wfpObjectiveData.data.wfp?.projectTitle || 'WFP Details'
  const objectiveDesc = wfpObjectiveData.data.description

  const breadcrumbs = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/v2/wfp" className="text-slate-500 hover:text-indigo-600 font-medium text-xs">
              Work & Financial Plans
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {wfpId && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/v2/wfp/$wfpId"
                  params={{ wfpId }}
                  className="text-slate-500 hover:text-indigo-600 font-medium text-xs max-w-[200px] truncate"
                  title={wfpTitle}
                >
                  {wfpTitle}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-slate-800 dark:text-slate-200 text-xs max-w-[300px] truncate" title={objectiveDesc}>
            {toTitleCase(objectiveDesc) || 'Objective Details'}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <PageContainer
      title={toTitleCase(wfpObjectiveData.data.description) || 'WFP Objective Details'}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-4 mx-auto">
        {/* Info Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Expected Outcome Card */}
          <Card className="md:col-span-2 border-emerald-100/60 dark:border-emerald-900/40 bg-white dark:bg-slate-900 shadow-xs hover:shadow-sm transition-all duration-300">
            <CardHeader className="py-2.5 px-4">
              <CardTitle className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Expected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic bg-emerald-50/20 dark:bg-emerald-950/30 p-2.5 rounded-lg border-l-4 border-emerald-500">
                "{toSentenceCase(wfpObjectiveData.data.outcome) || 'No outcome specified.'}"
              </p>
            </CardContent>
          </Card>

          {/* Metrics Column */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {/* Activity Weight Allocation Card */}
            <Card className="border-blue-100/60 dark:border-blue-900/40 bg-white dark:bg-slate-900 shadow-xs hover:shadow-sm transition-all duration-300">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="space-y-1 flex-1 pr-3">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5" /> Activity Weight Allocation
                  </span>
                  <div className="w-full bg-blue-100/50 dark:bg-blue-950/50 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isFullyAllocated
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : isOverAllocated
                            ? 'bg-rose-600 dark:bg-rose-500'
                            : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] font-semibold mt-1">
                    {isFullyAllocated ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓ Fully Allocated to Activities</span>
                    ) : isOverAllocated ? (
                      <span className="text-rose-600 dark:text-rose-400">⚠ {totalActivitiesWeight - objWeight}% Over Objective Weight</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">{remainingActWeight}% Unallocated</span>
                    )}
                  </p>
                </div>
                <div className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-sm font-extrabold shadow-2xs whitespace-nowrap">
                  {totalActivitiesWeight}% / {objWeight}%
                </div>
              </CardContent>
            </Card>

            {/* Activities Count Card */}
            <Card className="border-purple-100/60 dark:border-purple-900/40 bg-white dark:bg-slate-900 shadow-xs hover:shadow-sm transition-all duration-300">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Registered Activities
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Actions defined for this objective</p>
                </div>
                <div className="bg-purple-600 dark:bg-purple-500 text-white px-3 py-1 rounded-xl text-base font-extrabold shadow-2xs">
                  {activities.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activities Table Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
          <CardHeader className="py-2 px-3.5 mb-0 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <div className="space-y-0.5">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Activities Registry
                <Badge variant="soft" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0 font-bold">
                  {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                </Badge>
              </CardTitle>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Monitor and manage the timeline segments, weights, and indicators for this objective.
              </p>
            </div>

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-2xs h-7 text-xs px-3 font-semibold flex gap-1.5"
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
        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              LEGEND
            </span>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Completed
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /> In Progress
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" /> Upcoming
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

            <div className="text-xs text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-100 font-bold">Target:</strong> Indicates the quarterly target value
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Click any quarter to view or edit timeline details
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