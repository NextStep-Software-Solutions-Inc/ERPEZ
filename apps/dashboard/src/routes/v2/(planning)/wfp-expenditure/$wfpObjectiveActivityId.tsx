import { createFileRoute } from '@tanstack/react-router'
import WFPExpenditurePage from '@/pages/planning/wfp/WFPExpenditurePage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/wfp-expenditure/$wfpObjectiveActivityId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { wfpObjectiveActivityId } = Route.useParams()
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Wfp.View}
      message="You do not have permission to view WFP expenditures."
    >
      <WFPExpenditurePage wfpObjectiveActivityId={wfpObjectiveActivityId} />
    </RoutePermissionGuard>
  )
}

