import { createFileRoute } from '@tanstack/react-router'
import { BACDocumentViewer } from '@/features/procurement/bac-public-portal/pages/BACDocumentViewer'

export const Route = createFileRoute('/v2/bac/document/$docId')({
  component: BACDocumentViewerRoute,
})

function BACDocumentViewerRoute() {
  const { docId } = Route.useParams()
  return <BACDocumentViewer docId={docId} />
}
