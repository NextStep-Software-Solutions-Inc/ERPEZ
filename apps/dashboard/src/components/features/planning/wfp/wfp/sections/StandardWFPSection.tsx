import { useMemo } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UpdateWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/UpdateWfpObjectiveDialog'
import DeleteWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/DeleteWfpObjectiveDialog'
import CreateWFPObjectiveDialog from '@/components/features/planning/wfp/wfp-objective/dialog/CreateWfpObjectiveDialog'
import { GanttModal } from '@/components/features/planning/wfp/wfp/dialog/GanttModal'
import type { MetaActions } from '@/types/global'
import type { WFPDetails } from '../table/types'
import { transformWFPObjectives } from './transformObjectives'
import { ProjectOverviewCard } from './ProjectOverviewCard'
import { ObjectivesTableSection } from './ObjectivesTableSection'

interface WFPObjectiveData {
  id: string
  description: string
  outcome: string
  weight: number
  wfp?: { activityName?: string }
  wfpObjectiveTargets?: Array<{
    id: string
    activityName: string
    wfpObjectiveTimelines?: Array<{ id: string; month: string }>
  }>
}

interface StandardWFPSectionProps {
  wfp: WFPDetails
  wfpData: { data: WFPDetails }
  timelineOpen: boolean
  onTimelineOpenChange: (open: boolean) => void
}

export const StandardWFPSection = ({
  wfp,
  wfpData,
  timelineOpen,
  onTimelineOpenChange,
}: StandardWFPSectionProps) => {
  const actions: MetaActions = ['write', 'delete', 'read']

  const remainingWeight = useMemo(() =>
    100 -
    (wfpData?.data?.wfpObjectives?.reduce(
      (acc: number, obj: { weight: number }) => acc + obj.weight,
      0,
    ) ?? 0),
    [wfpData?.data?.wfpObjectives]
  )

  const transformedObjectives = transformWFPObjectives(
    wfpData?.data.wfpObjectives,
    wfp.id
  )

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex items-center gap-2 justify-end">
        <Button 
          variant="outline"
          onClick={() => onTimelineOpenChange(true)}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          View Timeline
        </Button>
        <Button className="bg-[#10B981] hover:bg-[#059669] text-white shadow-md">
          <Download className="mr-2 h-4 w-4" />
          Download/Generate WFP
        </Button>
      </div>

      <ProjectOverviewCard wfp={wfp} />
      
      <ObjectivesTableSection
        wfpData={wfpData}
        transformedObjectives={transformedObjectives}
        remainingWeight={remainingWeight}
        actions={actions}
      />

      {/* Dialog Components */}
      <CreateWFPObjectiveDialog wfpId={wfpData?.data.id} remainingWeight={remainingWeight} />
      <UpdateWFPObjectiveDialog />
      <DeleteWFPObjectiveDialog />

      {/* Timeline Modal */}
      <GanttModal
        open={timelineOpen}
        onClose={() => onTimelineOpenChange(false)}
        wfpData={buildGanttData(wfp, wfpData)}
      />
    </div>
  )
}

// Helper function to build Gantt chart data
function buildGanttData(wfp: WFPDetails, wfpData: { data: WFPDetails }) {
  return {
    id: wfp.id,
    name: wfp.projectTitle,
    code: '',
    fiscalYear: new Date().getFullYear(),
    officeName: wfp.officeName,
    fundName: '',
    mode: 'external' as const,
    projectStartDate: wfp.projectStartDate,
    projectEndDate: wfp.projectEndDate,
    status: wfp.status,
    generalObjective: wfp.generalObjective,
    description: '',
    proposedBudget: 0,
    objectives: wfpData?.data.wfpObjectives?.map((obj: WFPObjectiveData) => ({
      id: obj.id,
      name: obj.wfp?.activityName || obj.description,
      activities: obj.wfpObjectiveTargets?.map(target => ({
        id: target.id,
        name: target.activityName,
        dateEntries: target.wfpObjectiveTimelines?.map((timeline: { id: string; month: string }) => ({
          startDate: timeline.month,
          endDate: timeline.month
        })) || []
      })) || []
    })) || []
  }
}
