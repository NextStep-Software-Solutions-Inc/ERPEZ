import { createFileRoute } from '@tanstack/react-router'

import KpiAssignmentDetailViewPage from '@/pages/planning/kpi-assignment/KpiAssignmentDetailViewPage'

export const Route = createFileRoute('/v1/planning/kpi-assignment-view')({
  component: RouteComponent,
})

function RouteComponent() {
  return <KpiAssignmentView />
}

function KpiAssignmentView() {
  return <KpiAssignmentDetailViewPage />
}

export default KpiAssignmentView
