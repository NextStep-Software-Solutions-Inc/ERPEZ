import { createFileRoute } from '@tanstack/react-router'
import { NoticeOfAwardDetailsPage } from '@/features/procurement/notice-of-award/pages'

export const Route = createFileRoute(
  '/v2/(procurement)/notice-of-award-noa/$noaId/',
)({
  component: NoticeOfAwardNoaDetailsRoute,
})

function NoticeOfAwardNoaDetailsRoute() {
  const { noaId } = Route.useParams()

  return (
    <NoticeOfAwardDetailsPage
      noaId={noaId}
      role="procurement-staff"
      backTo="/v2/notice-of-award-noa"
    />
  )
}
