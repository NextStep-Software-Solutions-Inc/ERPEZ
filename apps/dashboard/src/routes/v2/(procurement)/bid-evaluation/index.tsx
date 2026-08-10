import { createFileRoute } from '@tanstack/react-router';
import { BidEvaluationPage } from '@/features/procurement/bid-evaluation';

export const Route = createFileRoute('/v2/(procurement)/bid-evaluation/')({
  component: BidEvaluationRoute,
});

function BidEvaluationRoute() {
  return <BidEvaluationPage />;
}
