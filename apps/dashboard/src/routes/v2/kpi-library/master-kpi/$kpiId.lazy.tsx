/**
 * Master KPI Details Page Route
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard';
import { PERMISSIONS } from '@/constants/permissions';

const MasterKpiDetailsPage = lazy(() =>
  import('@/features/planning/master-kpi/pages/MasterKpiDetailsPage').then((m) => ({
    default: m.MasterKpiDetailsPage,
  }))
);

export const Route = createLazyFileRoute(
  '/v2/kpi-library/master-kpi/$kpiId'
)({
  component: () => (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Kpi.View}
      message="You do not have permission to view Master KPI details."
    >
      <Suspense fallback={<div>Loading Master KPI details...</div>}>
        <MasterKpiDetailsPage />
      </Suspense>
    </RoutePermissionGuard>
  ),
});
