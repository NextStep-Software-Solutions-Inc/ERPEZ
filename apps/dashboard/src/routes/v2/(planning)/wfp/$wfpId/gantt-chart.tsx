/**
 * WFP Gantt Chart Route
 * Path: /v2/wfp/{wfpId}/gantt-chart
 */

import { createFileRoute } from '@tanstack/react-router'
import { WFPGanttChartWorkspacePage } from '~/pages/planning/wfp/WFPGanttChartWorkspacePage'

export const Route = createFileRoute('/v2/(planning)/wfp/$wfpId/gantt-chart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <WFPGanttChartWorkspacePage />
}
