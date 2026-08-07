import { PageContainer } from '@/components/PageContainer'

export default function FinanceOverview() {
  return (
    <PageContainer
      title="Finance Overview"
      description="Comprehensive analytics and insights for financial management"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Placeholder cards for finance metrics */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Budget
            </h3>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Allocated Funds
            </h3>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Available Balance
            </h3>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Finance Management</h3>
          <p className="text-muted-foreground">
            Finance overview and management features coming soon.
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
