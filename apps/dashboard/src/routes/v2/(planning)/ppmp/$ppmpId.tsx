import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const OfficeLevelPPMPDetailsPage = lazy(() =>
  import('@/features/planning/ppmp/pages/OfficeLevelPPMPDetailsPage').then(
    (m) => ({
      default: m.OfficeLevelPPMPDetailsPage,
    }),
  ),
)
export const Route = createFileRoute('/v2/(planning)/ppmp/$ppmpId')({
  component: PPMPDetailsRoute,
})

function PPMPDetailsRoute() {
  const { ppmpId } = Route.useParams()

  return (
    <Suspense fallback={<div>Loading PPMP details...</div>}>
      <OfficeLevelPPMPDetailsPage ppmpId={ppmpId} />
    </Suspense>
  )
}

