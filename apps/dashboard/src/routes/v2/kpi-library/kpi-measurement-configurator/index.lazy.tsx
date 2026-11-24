/**
 * KPI Measurement Configurator Route
 */

import { createLazyFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const KpiMeasurementConfiguratorPage = lazy(() =>
  import(
    '@/features/planning/kpi-measurement-configurator/pages/KpiMeasurementConfiguratorPage'
  ).then((m) => ({
    default: m.KpiMeasurementConfiguratorPage,
  })),
)

export const Route = createLazyFileRoute(
  '/v2/kpi-library/kpi-measurement-configurator/',
)({
  component: () => (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Kpi.View}
      message="You do not have permission to view the KPI Measurement Configurator."
    >
      <Suspense fallback={<div>Loading KPI Measurement Configurator...</div>}>
        <KpiMeasurementConfiguratorPage />
      </Suspense>
    </RoutePermissionGuard>
  ),
})
