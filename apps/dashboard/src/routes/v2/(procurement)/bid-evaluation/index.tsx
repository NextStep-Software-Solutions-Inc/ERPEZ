import { createFileRoute } from '@tanstack/react-router';
import { BidEvaluationPage } from '@/features/procurement/bid-evaluation';
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard';
import { PERMISSIONS } from '@/constants/permissions';

export const Route = createFileRoute('/v2/(procurement)/bid-evaluation/')({
  component: BidEvaluationRoute,
});

function BidEvaluationRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to view Bid Evaluations."
    >
      <BidEvaluationPage />
    </RoutePermissionGuard>
  );
}
