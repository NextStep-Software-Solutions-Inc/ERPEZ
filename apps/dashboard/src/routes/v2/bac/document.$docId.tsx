import { createFileRoute } from '@tanstack/react-router'
import { BACDocumentViewer } from '@/features/procurement/bac-public-portal/pages/BACDocumentViewer'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/bac/document/$docId')({
  component: BACDocumentViewerRoute,
})

function BACDocumentViewerRoute() {
  const { docId } = Route.useParams()
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Bac.Manage}
      message="You do not have permission to access this BAC document."
    >
      <BACDocumentViewer docId={docId} />
    </RoutePermissionGuard>
  )
}
