import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, History, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDisplayDate } from '@/utils/formatters'
import type { WFPDetails } from '../table/types'
import type { OPCR } from '../../opcr/table/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface WFPStatusHistoryPanelProps {
  wfp: WFPDetails
  opcr?: OPCR
  activityCount?: number
  timelineCount?: number
  expenditureCount?: number
  remainingWeight?: number
}

export const WFPStatusHistoryPanel: React.FC<WFPStatusHistoryPanelProps> = ({
  wfp,
  opcr,
  activityCount = 0,
  timelineCount = 0,
  expenditureCount = 0,
  remainingWeight = 0,
}) => {
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const isOPCRMode = wfp?.mode === 'OPCR'
  const isWeightAllocated = remainingWeight === 0

  const createdDate = wfp?.createdAt ? formatDisplayDate(wfp.createdAt) : 'Initial record'

  return (
    <>
      <Card className="border-slate-200/80 shadow-xs mb-3.5 bg-white">
        <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            WFP Readiness & Audit History
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold py-0.5 px-2 bg-slate-50 border-slate-200 text-slate-700"
          >
            Status: {wfp?.status || 'Draft'}
          </Badge>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sub-Section 1: Readiness Checklist */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Readiness Checklist
              </h4>

              <div className="space-y-1.5 text-xs">
                {isOPCRMode && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>OPCR Linked ({opcr?.code || 'Connected'})</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Proposed Budget Set (₱{(wfp?.proposedBudget || 0).toLocaleString()})</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {activityCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{activityCount} Activities Linked</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {timelineCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{timelineCount} Quarterly Timelines Configured</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {expenditureCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{expenditureCount} PPMP Items Attached</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {isWeightAllocated ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  )}
                  <span>
                    Objective Weights ({100 - remainingWeight}% Allocated, {remainingWeight}% Remaining)
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Section 2: Audit History Log */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-600" />
                Recent Activity
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Created</span>
                  <span className="font-semibold text-slate-800">{createdDate}</span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Last Modified</span>
                  <span className="text-slate-600 italic">No modifications logged yet</span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setAuditModalOpen(true)}
                    className="p-0 h-auto text-xs text-indigo-600 hover:text-indigo-800 gap-1 font-semibold"
                  >
                    View full audit trail <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Modal */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Audit Trail Log — {wfp?.code || wfp?.projectTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Detailed chronological change records for this Work Financial Plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>WFP Record Created</span>
                <span className="text-[10px] text-slate-400">{createdDate}</span>
              </div>
              <p className="text-[11px] text-slate-500">Initial Work Financial Plan record initialized.</p>
            </div>

            <div className="text-center py-4">
              <p className="text-xs text-slate-400 italic">End of audit trail entries.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
