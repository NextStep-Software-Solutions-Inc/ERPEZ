import { createFileRoute } from '@tanstack/react-router'
import EvaluationPage from '@/pages/planning/evaluation/EvaluationPage'

export const Route = createFileRoute('/v1/planning/evaluation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EvaluationPage />
}
