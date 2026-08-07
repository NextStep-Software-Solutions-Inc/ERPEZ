import { createFileRoute } from '@tanstack/react-router'
import { BiddingDocumentWorkspacePage } from '@/features/procurement/bidding-documents'

export const Route = createFileRoute(
  '/v2/(procurement)/bidding-documents/$bacResolutionId/',
)({
  component: BiddingDocumentsWorkspaceRoute,
})

function BiddingDocumentsWorkspaceRoute() {
  const { bacResolutionId } = Route.useParams()

  return <BiddingDocumentWorkspacePage bacResolutionId={bacResolutionId} />
}
