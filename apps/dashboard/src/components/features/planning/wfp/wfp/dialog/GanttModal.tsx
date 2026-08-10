import { Button } from '@/components/ui/button'
import GanttChart from '../workspace/GanttChart'
import type { WFPPlan } from '../table/types'
import { formatDisplayDate } from '@/utils/formatters';

interface Activity {
  id: string
  name: string
  dateEntries: Array<{
    startDate: string
    endDate: string
  }>
  q1?: boolean | number
  q2?: boolean | number
  q3?: boolean | number
  q4?: boolean | number
}

interface GanttModalProps {
  open: boolean
  onClose: () => void
  wfpData: WFPPlan
}

export function GanttModal({ open, onClose, wfpData }: GanttModalProps) {
  // Flatten all activities from objectives based on WFP mode
  const flattenedActivities = (() => {
    // OPCR mode: activities are directly in opcrActivities
    if (wfpData.mode === 'opcr' && wfpData.opcrActivities) {
      return wfpData.opcrActivities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        budget: 0,
        start: activity.start,
        end: activity.end,
        q1: activity.q1,
        q2: activity.q2,
        q3: activity.q3,
        q4: activity.q4,
      }))
    }

    // External mode: activities are nested under objectives
    if (wfpData.mode === 'external' && wfpData.objectives) {
      return wfpData.objectives.flatMap((obj) =>
        obj.activities
          .filter((activity: Activity) => activity.dateEntries.length > 0)
          .map((activity: Activity) => {
            // Compute start/end dates from dateEntries (take min/max across all entries)
            const validStartDates = activity.dateEntries
              .map((de) => new Date(de.startDate))
              .filter((d) => !isNaN(d.getTime()))
            const validEndDates = activity.dateEntries
              .map((de) => new Date(de.endDate))
              .filter((d) => !isNaN(d.getTime()))
            
            const start = validStartDates.length > 0 
              ? new Date(Math.min(...validStartDates.map((d) => d.getTime()))) 
              : new Date()
            const end = validEndDates.length > 0 
              ? new Date(Math.max(...validEndDates.map((d) => d.getTime()))) 
              : new Date()

            return {
              id: activity.id,
              name: `${obj.name} - ${activity.name}`,
              budget: 0,
              start: !isNaN(start.getTime()) ? start.toISOString().split('T')[0] : '',
              end: !isNaN(end.getTime()) ? end.toISOString().split('T')[0] : '',
              q1: activity.q1,
              q2: activity.q2,
              q3: activity.q3,
              q4: activity.q4,
            }
          }),
      )
    }

    return []
  })()

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📊 {wfpData.name}</h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {formatDisplayDate(wfpData.projectStartDate)} to {formatDisplayDate(wfpData.projectEndDate)}
          </p>
        </div>
        <div className="p-6 h-[70vh] overflow-auto">
          {flattenedActivities.length > 0 ? (
            <GanttChart
              activities={flattenedActivities}
              mode={wfpData.mode === 'opcr' ? 'opcr' : 'external'}
              projectStartDate={wfpData.projectStartDate}
              projectEndDate={wfpData.projectEndDate}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div>
                <div className="text-lg font-medium mb-2">No activities to display</div>
                <p className="text-sm">This WFP doesn't have any activities with date information yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
