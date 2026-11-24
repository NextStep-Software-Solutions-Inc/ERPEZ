/**
 * Market Scoping - Activities Conducted Section
 * Displays uniform activity cards with collapsible attachment drawers
 * Location: src/features/planning/market-scoping/components/
 */

import { useState } from 'react'
import { CheckCircle2, Paperclip, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AttachmentViewer } from './AttachmentViewer'
import type { MarketScopingForm } from '../types/marketScopingTypes'

interface ActivitiesSectionProps {
  form: MarketScopingForm
}

export function ActivitiesSection({ form }: ActivitiesSectionProps) {
  const activities = form.activities || []
  const [expandedActivities, setExpandedActivities] = useState<
    Record<string, boolean>
  >({})

  const toggleExpand = (activityId: string) => {
    setExpandedActivities((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }))
  }

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardContent className="pt-6">
        {activities.length > 0 ? (
          <div className="space-y-3.5">
            {activities.map((activity) => {
              const hasAttachments =
                activity.attachments && activity.attachments.length > 0

              return (
                <div
                  key={activity.id}
                  className="group border border-slate-200/90 border-l-4 border-l-emerald-500 rounded-xl p-4 bg-gradient-to-r from-emerald-50/20 via-white to-white hover:border-emerald-300 hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="p-1.5 bg-emerald-100/70 text-emerald-600 rounded-lg flex-shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-base leading-snug">
                          {activity.label || activity.activityType}
                        </h4>
                        {activity.description && (
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button / Trigger for Attachments */}
                  {hasAttachments && (
                    <div className="mt-3 pl-10 pt-2 flex items-center justify-between border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(activity.id)}
                        className="h-8 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 gap-2 rounded-lg"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Supporting Documents</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50">
                          {activity.attachments.length}{' '}
                          {activity.attachments.length === 1 ? 'file' : 'files'}
                        </span>
                        {expandedActivities[activity.id] ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-indigo-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-indigo-400" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Attachments Section */}
                  {hasAttachments && expandedActivities[activity.id] && (
                    <div className="pl-10 pt-3.5 mt-1 border-t border-slate-100">
                      <AttachmentViewer
                        attachments={activity.attachments}
                        showLabel={false}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium text-sm">
              No activities recorded for this scoping form.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
