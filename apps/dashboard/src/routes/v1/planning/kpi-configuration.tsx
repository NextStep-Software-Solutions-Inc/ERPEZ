import { createFileRoute } from '@tanstack/react-router'

import KpiConfigPage from '@/pages/planning/kpi-config/KpiConfigPage'

export const Route = createFileRoute('/v1/planning/kpi-configuration')({
  component: RouteComponent,
})

function RouteComponent() {
  return <KpiConfig />
}

function KpiConfig() {
  return <KpiConfigPage />
}

export default KpiConfig
