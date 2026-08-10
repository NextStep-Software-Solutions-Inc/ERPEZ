/**
 * WFP Gantt Chart Workspace Page
 * Fetches WFP data by ID and displays hierarchical Gantt chart
 * Reference: documentations/gantt-chart-timeline-enhancement.md
 */

import { useParams } from "@tanstack/react-router"
import GanttChart from "~/components/features/planning/wfp/wfp/workspace/GanttChart"
import { useWFPById } from "~/features/planning/hooks/useWFPById"
import { Loader2 } from "lucide-react"

export function WFPGanttChartWorkspacePage() {
  const { wfpId } = useParams({ from: '/v2/(planning)/wfp/$wfpId/gantt-chart' })
  const { data: wfpData, isLoading, error } = useWFPById({ 
    pathParams: { id: wfpId }, 
    queryParams: {},
    enabled: !!wfpId 
  })

  if (!wfpId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Missing WFP ID parameter</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading WFP data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error Loading WFP Data</p>
          <p className="text-red-600 text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  if (!wfpData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No WFP data available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{wfpData?.projectTitle || "WFP Gantt Chart"}</h1>
        {wfpData?.description && <p className="text-gray-600 text-sm">{wfpData.description}</p>}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-auto">
        <GanttChart
          wfpData={wfpData}
          mode={wfpData?.status === "External" ? "external" : "opcr"}
          projectStartDate={wfpData?.projectStartDate}
          projectEndDate={wfpData?.projectEndDate}
        />
      </div>
    </div>
  )
}
