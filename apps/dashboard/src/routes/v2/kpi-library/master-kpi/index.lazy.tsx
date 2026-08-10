/**
 * Master KPI Registry Page Route
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const MasterKpiPage = lazy(() =>
  import('@/features/planning/master-kpi/pages/MasterKpiPage').then((m) => ({
    default: m.MasterKpiPage,
  }))
);

export const Route = createLazyFileRoute(
  '/v2/kpi-library/master-kpi/'
)({
  component: () => (
    <Suspense fallback={<div>Loading Master KPI Registry...</div>}>
      <MasterKpiPage />
    </Suspense>
  ),
});
