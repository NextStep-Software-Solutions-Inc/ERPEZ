import { createFileRoute } from '@tanstack/react-router'

import { PageContainer } from '@/components/PageContainer'

export const Route = createFileRoute('/v1/finance/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FinanceSettings />
}

export default function FinanceSettings() {
  return (
    <PageContainer
      title="Finance Settings"
      description="Configure finance module settings"
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Finance Settings - Coming Soon</p>
      </div>
    </PageContainer>
  )
}
