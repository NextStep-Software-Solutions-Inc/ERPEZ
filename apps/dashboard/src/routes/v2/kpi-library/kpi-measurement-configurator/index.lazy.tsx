/**
 * KPI Measurement Configurator Route
 */

import { createLazyFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

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
    <Suspense fallback={<div>Loading KPI Measurement Configurator...</div>}>
      <KpiMeasurementConfiguratorPage />
    </Suspense>
  ),
})
