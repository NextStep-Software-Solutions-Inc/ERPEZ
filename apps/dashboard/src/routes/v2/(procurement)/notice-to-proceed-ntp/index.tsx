import { createFileRoute } from '@tanstack/react-router'
import { NTPListPage } from '@/features/procurement/ntp'

export const Route = createFileRoute('/v2/(procurement)/notice-to-proceed-ntp/')({
  component: NoticeToProceedNtpRoute,
})

function NoticeToProceedNtpRoute() {
  return <NTPListPage />
}