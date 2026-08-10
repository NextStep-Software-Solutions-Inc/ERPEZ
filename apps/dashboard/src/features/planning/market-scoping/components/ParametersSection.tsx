/**
 * Market Scoping - Parameter Evaluation Section
 * Displays all parameters with pleasing light colors, badge highlights, and recommendations
 * Location: src/features/planning/market-scoping/components/
 */

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, HelpCircle, MessageSquareText, Paperclip, ChevronDown, ChevronUp } from 'lucide-react'
import { AttachmentViewer } from './AttachmentViewer'
import type { MarketScopingForm } from '../types/marketScopingTypes'

interface ParametersSectionProps {
  form: MarketScopingForm
}

function getConsideredStyle(considered?: string) {
  if (considered === 'Yes') {
    return {
      border: 'border-l-4 border-l-emerald-500 hover:border-emerald-300',
      badgeClass: 'bg-emerald-100/90 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />,
      label: 'Yes',
    }
  }
  if (considered === 'No') {
    return {
      border: 'border-l-4 border-l-rose-500 hover:border-rose-300',
      badgeClass: 'bg-rose-100/90 text-rose-800 border-rose-300 hover:bg-rose-100',
      icon: <XCircle className="w-4 h-4 text-rose-600 mr-1.5" />,
      label: 'No',
    }
  }
  return {
    border: 'border-l-4 border-l-slate-400 hover:border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-100',
    icon: <HelpCircle className="w-4 h-4 text-slate-500 mr-1.5" />,
    label: 'N/A',
  }
}

export function ParametersSection({ form }: ParametersSectionProps) {
  const parameters = form.parameters || []
  const [expandedParams, setExpandedParams] = useState<Record<string, boolean>>({})

  const toggleExpand = (paramId: string) => {
    setExpandedParams((prev) => ({
      ...prev,
      [paramId]: !prev[paramId],
    }))
  }

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardContent className="pt-6">
        {parameters.length > 0 ? (
          <div className="space-y-4">
            {parameters.map((param, index) => {
              const statusStyle = getConsideredStyle(param.considered)
              const hasAttachments = param.attachments && param.attachments.length > 0

              return (
                <div
                  key={param.parameterId}
                  className={`group relative border border-slate-200/90 rounded-xl p-4.5 bg-white hover:shadow-xs transition-all duration-200 space-y-3.5 ${statusStyle.border}`}
                >
                  {/* Header: Parameter tag, name & badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
                        Parameter {index + 1}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-base pt-0.5">
                        {param.displayName || param.parameterName}
                      </h4>
                      {param.guidedQuestion && (
                        <p className="text-sm text-slate-500 italic leading-relaxed pt-0.5">
                          {param.guidedQuestion}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className={`inline-flex items-center px-3 py-1 font-semibold text-xs rounded-full shadow-2xs ${statusStyle.badgeClass}`}
                    >
                      {statusStyle.icon}
                      <span>{statusStyle.label}</span>
                    </Badge>
                  </div>

                  {/* Recommendations Callout */}
                  {param.recommendations && (
                    <div className="bg-sky-50/60 border border-sky-100/90 rounded-lg p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-sky-700 text-xs font-semibold uppercase tracking-wider">
                        <MessageSquareText className="w-3.5 h-3.5 text-sky-600" />
                        <span>Recommendations & Key Findings</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-normal pl-5">
                        {param.recommendations}
                      </p>
                    </div>
                  )}

                  {/* Toggle Button / Trigger for Attachments */}
                  {hasAttachments && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(param.parameterId)}
                        className="h-8 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 gap-2 rounded-lg"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Supporting Documents</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50">
                          {param.attachments.length} {param.attachments.length === 1 ? 'file' : 'files'}
                        </span>
                        {expandedParams[param.parameterId] ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-indigo-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-indigo-400" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Attachments */}
                  {hasAttachments && expandedParams[param.parameterId] && (
                    <div className="pt-3 border-t border-slate-100">
                      <AttachmentViewer attachments={param.attachments} showLabel={false} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium text-sm">No parameters evaluated yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
