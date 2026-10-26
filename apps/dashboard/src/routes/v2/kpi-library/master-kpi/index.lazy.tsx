/**
 * Master KPI Registry Page Route
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard';
import { PERMISSIONS } from '@/constants/permissions';

const MasterKpiPage = lazy(() =>
  import('@/features/planning/master-kpi/pages/MasterKpiPage').then((m) => ({
    default: m.MasterKpiPage,
  }))
);

export const Route = createLazyFileRoute(
  '/v2/kpi-library/master-kpi/'
)({
  component: () => (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Kpi.View}
      message="You do not have permission to view the Master KPI Registry."
    >
      <Suspense fallback={<div>Loading Master KPI Registry...</div>}>
        <MasterKpiPage />
      </Suspense>
    </RoutePermissionGuard>
  ),
});
