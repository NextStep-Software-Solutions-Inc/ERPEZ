import {
  DollarSign,
  TrendingDownIcon,
  TrendingUpIcon,
  Wallet2,
} from 'lucide-react'
import { PageContainer } from '@/components/PageContainer'
import { StatCard } from '@/components/StatCard'

const stats = [
  {
    label: 'Total KPI',
    value: 24,
    icon: DollarSign,
    details: '+3 from last quarter',
  },
  {
    label: 'Active DUs',
    value: 12,
    icon: TrendingDownIcon,
    details: 'Accross all department',
  },
  {
    label: 'Completion Rate',
    value: '87%',
    icon: Wallet2,
    details: '+5 from last quarter',
  },
  {
    label: 'Pending Evaluation',
    value: 8,
    icon: TrendingUpIcon,
    details: 'Requires attention',
  },
]

const recent = [
  {
    title: 'Account created',
    desc: 'Welcome to ERP EZ! Your trial has started.',
    time: 'Just now',
  },
  {
    title: 'Trial activated',
    desc: 'Your 14-day free trial is now active.',
    time: 'Just now',
  },
  {
    title: 'Dashboard accessed',
    desc: "You've successfully logged into your tenant dashboard.",
    time: 'Just now',
  },
]

export default function OverviewPage() {
  return (
    <PageContainer
      title="Overview"
      description="Performance management system dashboard"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard
              key={i}
              label={s.label}
              value={s.value}
              icon={s.icon}
              details={s.details}
            />
          ))}
        </div>
        <div>
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Your latest account activities and updates.
            </p>
            <div className="mt-4 space-y-3">
              {recent.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between bg-border/10 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="h-3 w-3 rounded-full bg-blue-500 mt-1" />
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-muted-foreground text-sm">
                        {r.desc}
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">{r.time}</div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button className="w-full rounded-md border px-4 py-2">
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
