import { createFileRoute } from '@tanstack/react-router'
import { NoticeOfAwardDetailsPage } from '@/features/procurement/notice-of-award/pages'

export const Route = createFileRoute('/v2/(procurement)/manage-noa/$noaId/')({
  component: ManageNoaDetailsRoute,
})

function ManageNoaDetailsRoute() {
  const { noaId } = Route.useParams()

  return (
    <NoticeOfAwardDetailsPage
      noaId={noaId}
      role="hope"
      backTo="/v2/manage-noa"
    />
  )
}
