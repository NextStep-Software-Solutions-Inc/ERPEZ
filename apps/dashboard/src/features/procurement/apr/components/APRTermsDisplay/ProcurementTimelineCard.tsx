import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { APRMilestones } from '@/features/procurement/apr/types'

interface ProcurementTimelineCardProps {
  milestones: APRMilestones | undefined
}

const MILESTONE_STEPS = [
  {
    key: 'advertisementDate',
    label: 'Advertisement/Posting',
    shortLabel: 'Posted',
    description: 'Advertisement/Posting of IB/REI',
    color: 'from-blue-500 to-blue-600',
  },
  {
    key: 'submissionDate',
    label: 'Submission/Opening of Bids',
    shortLabel: 'Submitted',
    description: 'Submission and opening of bids',
    color: 'from-purple-500 to-purple-600',
  },
  {
    key: 'noticeOfAwardDate',
    label: 'Notice of Award',
    shortLabel: 'Awarded',
    description: 'Winner announcement date',
    color: 'from-green-500 to-green-600',
  },
  {
    key: 'contractSigningDate',
    label: 'Contract Signing',
    shortLabel: 'Signed',
    description: 'Contract execution date',
    color: 'from-indigo-500 to-indigo-600',
  },
] as const

export function ProcurementTimelineCard({
  milestones,
}: ProcurementTimelineCardProps) {
  if (!milestones) return null

  const hasMilestones = Object.values(milestones).some((date) => date)

  if (!hasMilestones) return null

  return (
    <Card className="border border-border shadow-xs bg-card text-card-foreground rounded-2xl overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/70 bg-slate-50/60 dark:bg-slate-900/50">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Procurement Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-400/70 to-purple-400/70 dark:from-blue-500/50 dark:to-purple-500/50" />

          {/* Timeline items */}
          <div className="space-y-5">
            {MILESTONE_STEPS.map(
              ({
                key,
                label,
                shortLabel,
                description,
                color,
              }) => {
                const dateStr =
                  milestones[key as keyof APRMilestones]
                const hasDate = !!dateStr

                if (!hasDate) return null

                const date = new Date(dateStr as string)

                return (
                  <div key={key} className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative pt-1">
                      <div
                        className={`h-4.5 w-4.5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm bg-gradient-to-br ${color}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-1">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {description}
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-200/80 dark:text-slate-200 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 px-2 py-0.5 rounded-md">
                            {shortLabel}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground mt-2.5 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          {format(date, 'EEE, MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
