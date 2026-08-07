import { createFileRoute } from '@tanstack/react-router'
import { NoticeOfAwardsPage } from '@/features/procurement/notice-of-award/pages'

export const Route = createFileRoute('/v2/(procurement)/notice-of-award-noa/')({
  component: NoticeOfAwardNoaRoute,
})

function NoticeOfAwardNoaRoute() {
  return <NoticeOfAwardsPage />
}
