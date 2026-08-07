import { createFileRoute } from '@tanstack/react-router'
import ManageSupplierPortalProjectPage from '@/features/procurement/manage-supplier-portal/pages/ManageSupplierPortalProjectPage'

export const Route = createFileRoute(
  '/v2/(procurement)/manage-supplier-portal/$projectId',
)({
  component: ManageSupplierPortalProjectRoute,
})

function ManageSupplierPortalProjectRoute() {
  const { projectId } = Route.useParams()
  return <ManageSupplierPortalProjectPage projectId={projectId} />
}
