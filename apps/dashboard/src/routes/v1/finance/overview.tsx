import { createFileRoute } from '@tanstack/react-router'

import {
  DollarSign,
  TrendingDownIcon,
  TrendingUpIcon,
  Wallet2,
} from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OverviewChart } from '@/components/OverviewChart'

export const Route = createFileRoute('/v1/finance/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FinanceOverview />
}
const stats = [
  {
    label: 'Total Revenue',
    value: 328000,
    icon: DollarSign,
    details: '+13% from last period',
    prefix: 'dollar',
  },
  {
    label: 'Total Expenses',
    value: 215000,
    icon: TrendingDownIcon,
    details: '-5% from the period',
    prefix: 'dollar',
  },
  {
    label: 'Net Balance',
    value: 113000,
    icon: Wallet2,
    details: 'Available Balance',
    prefix: 'dollar',
  },
  {
    label: 'Active Allocations',
    value: 8,
    icon: TrendingUpIcon,
    details: 'Across 8 departments',
  },
]

export default function FinanceOverview() {
  return (
    <PageContainer
      title="Finance Overview"
      description="Comprehensive analytics and insights "
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard
            key={i}
            label={s.label}
            value={s.value}
            icon={s.icon}
            details={s.details}
            prefix={s.prefix}
          />
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Line Chart - Interactive</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing total visitors for the last 3 months
          </p>
        </CardHeader>
        <CardContent>
          <OverviewChart />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
