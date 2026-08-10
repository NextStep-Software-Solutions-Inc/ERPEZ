import { Percent, Plus, TrendingUp, Activity } from 'lucide-react'
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
  return (
    <PageContainer
      title={toTitleCase(wfpObjectiveData.data.description) || 'WFP Objective Details'}
      backTo={ { to: '/v2/wfp/$wfpId', params: { wfpId: wfpObjectiveData.data.wfp.id } } }
      backLabel="Back to WFP Objectives"
    >
      <div className="space-y-6 mx-auto">
        {/* Info Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Expected Outcome Card */}
          <Card className="md:col-span-2 border-emerald-100/60 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Expected Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-700 leading-relaxed italic bg-emerald-50/20 p-3 rounded-lg border-l-4 border-emerald-500">
                "{toSentenceCase(wfpObjectiveData.data.outcome) || 'No outcome specified.'}"
              </p>
            </CardContent>
          </Card>

          {/* Metrics Column */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            {/* Weight Card */}
            <Card className="border-blue-100/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5" /> Weight Allocation
                  </span>
                  <div className="w-full bg-blue-100/50 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${wfpObjectiveData.data.weight}%` }}></div>
                  </div>
                </div>
                <div className="bg-blue-600 text-white px-3.5 py-2 rounded-xl text-lg font-extrabold shadow-sm">
                  {wfpObjectiveData.data.weight}%
                </div>
              </CardContent>
            </Card>

            {/* Activities Count Card */}
            <Card className="border-purple-100/60 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Registered Activities
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Actions defined for this objective</p>
                </div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-xl text-lg font-extrabold shadow-sm">
                  {activities.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activities Table Card */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" /> Activities Registry
              </CardTitle>
              <p className="text-xs text-slate-500 font-normal">
                Monitor and manage the timeline segments, weights, and indicators for this objective.
              </p>
            </div>
            
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex gap-2" onClick={() => setCreateDialog({ isOpen: true, showUnsavedWarning: false, wfpId: wfpObjectiveData.data.wfpId })}>
              <Plus className="h-4 w-4" /> Create Activity
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <TemplateTable
              columns={Column}
              data={activities}
              actions={['read', 'write', 'delete']}
              readonly={false}
            />
          </CardContent>
        </Card>
      </div>
      <CreateWFPObjectiveTargetDialog wfpObjectiveId={wfpObjectiveId} wfpData={wfpObjectiveData.data.wfp} />
      <UpdateWFPObjectiveTargetDialog />
      <DeleteWFPObjectiveTargetDialog />
    </PageContainer>
  )
}

export default WFPObjectiveDetailPage