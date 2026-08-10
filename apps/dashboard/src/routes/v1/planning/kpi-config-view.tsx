import { createFileRoute } from '@tanstack/react-router'

import KpiConfigDetailViewPage from '@/pages/planning/kpi-config/KpiConfigDetailViewPage'

export const Route = createFileRoute('/v1/planning/kpi-config-view')({
  component: RouteComponent,
})

function RouteComponent() {
  return <KpiConfigView />
}

function KpiConfigView() {
  return <KpiConfigDetailViewPage />
}

export default KpiConfigView
