import { createFileRoute } from '@tanstack/react-router'
import EvaluationDetailViewPage from '@/pages/planning/evaluation/EvaluationDetailViewPage'

export const Route = createFileRoute('/v1/planning/evaluation-detail-view')({
  component: EvaluationDetailView,
})

export default function EvaluationDetailView() {
  return <EvaluationDetailViewPage />
}
