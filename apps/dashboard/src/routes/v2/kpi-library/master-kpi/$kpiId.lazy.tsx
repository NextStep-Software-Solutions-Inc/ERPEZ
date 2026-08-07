/**
 * Master KPI Details Page Route
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const MasterKpiDetailsPage = lazy(() =>
  import('@/features/planning/master-kpi/pages/MasterKpiDetailsPage').then((m) => ({
    default: m.MasterKpiDetailsPage,
  }))
);

export const Route = createLazyFileRoute(
  '/v2/kpi-library/master-kpi/$kpiId'
)({
  component: () => (
    <Suspense fallback={<div>Loading Master KPI details...</div>}>
      <MasterKpiDetailsPage />
    </Suspense>
  ),
});
