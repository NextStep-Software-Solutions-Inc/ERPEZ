import { PageContainer } from '@/components/PageContainer'

export default function FundMonitoring() {
  return (
    <PageContainer
      title="Fund Monitoring"
      description="Monitor and track fund allocations and expenditures"
    >
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">
            Fund Monitoring Dashboard
          </h3>
          <p className="text-muted-foreground">
            Fund monitoring and tracking features coming soon.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h4 className="font-medium mb-2">Fund Allocation Status</h4>
            <p className="text-sm text-muted-foreground">
              Track fund distribution across programs
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h4 className="font-medium mb-2">Expenditure Tracking</h4>
            <p className="text-sm text-muted-foreground">
              Monitor spending against allocated budgets
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
