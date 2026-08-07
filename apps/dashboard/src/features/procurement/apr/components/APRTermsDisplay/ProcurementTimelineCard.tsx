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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-blue-600" />
          Procurement Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400" />

          {/* Timeline items */}
          <div className="space-y-6">
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
                        className={`h-5 w-5 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${color}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {label}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {description}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-white bg-gray-400 px-2 py-1 rounded">
                            {shortLabel}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
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
