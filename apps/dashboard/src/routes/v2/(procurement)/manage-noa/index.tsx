import { createFileRoute } from '@tanstack/react-router'
import { ManageNoticeOfAwardsPage } from '@/features/procurement/notice-of-award/pages'

export const Route = createFileRoute('/v2/(procurement)/manage-noa/')({
  component: ManageNoaRoute,
})

function ManageNoaRoute() {
  return <ManageNoticeOfAwardsPage />
}
