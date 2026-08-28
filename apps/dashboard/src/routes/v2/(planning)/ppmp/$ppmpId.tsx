import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

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
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Ppmp.View}
      message="You do not have permission to view PPMP details."
    >
      <Suspense fallback={<div>Loading PPMP details...</div>}>
        <OfficeLevelPPMPDetailsPage ppmpId={ppmpId} />
      </Suspense>
    </RoutePermissionGuard>
  )
}

