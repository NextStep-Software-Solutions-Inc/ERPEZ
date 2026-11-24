import { createFileRoute } from '@tanstack/react-router'
import { BiddingDocumentWorkspacePage } from '@/features/procurement/bidding-documents'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(procurement)/bidding-documents/$bacResolutionId',
)({
  component: BiddingDocumentsWorkspaceRoute,
})

function BiddingDocumentsWorkspaceRoute() {
  const { bacResolutionId } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.BiddingDocuments.View}
      message="You do not have permission to view Bidding Documents."
    >
      <BiddingDocumentWorkspacePage bacResolutionId={bacResolutionId} />
    </RoutePermissionGuard>
  )
}
