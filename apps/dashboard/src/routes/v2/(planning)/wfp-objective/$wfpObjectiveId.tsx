import { createFileRoute } from '@tanstack/react-router'
import WFPObjectiveDetailPage from '@/pages/planning/wfp/WFPObjectiveDetailPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/wfp-objective/$wfpObjectiveId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpObjectiveId } = Route.useParams()
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Wfp.View}
      message="You do not have permission to view WFP objectives."
    >
      <WFPObjectiveDetailPage wfpObjectiveId={wfpObjectiveId} />
    </RoutePermissionGuard>
  )
}
