/**
 * Office-level PPMP workspace route
 */

import { createLazyFileRoute } from '@tanstack/react-router'
import OfficeLevelPPMPDetailsPage from '@/features/planning/ppmp/pages/OfficeLevelPPMPDetailsPage'

export const Route = createLazyFileRoute('/v2/ppmp/office-level/$ppmpId')({
  component: OfficeLevelPPMPDetailsRoute,
})

function OfficeLevelPPMPDetailsRoute() {
  const { ppmpId } = Route.useParams()

  return <OfficeLevelPPMPDetailsPage ppmpId={ppmpId} />
}
