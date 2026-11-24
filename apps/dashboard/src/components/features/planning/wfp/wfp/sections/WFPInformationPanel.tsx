import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit3, Calendar, Layers, FileText, Wallet } from 'lucide-react'
import { formatDisplayDate } from '@/utils/formatters'
import type { WFPDetails } from '../table/types'

interface FundSource {
  name: string
  code: string
  isActive: boolean
  fiscalYear?: {
    year: string
    startDate: string
    endDate: string
  }
}

interface WFPInformationPanelProps {
  wfp: WFPDetails
  fundSource?: FundSource
  onEditObjective?: () => void
}

export const WFPInformationPanel: React.FC<WFPInformationPanelProps> = ({
  wfp,
  fundSource,
  onEditObjective,
}) => {
  const startFmt = formatDisplayDate(wfp?.projectStartDate)
  const endFmt = formatDisplayDate(wfp?.projectEndDate)
  const durationText = startFmt && endFmt ? `${startFmt} – ${endFmt}` : 'Not specified'

  return (
    <Card className="border-slate-200/80 shadow-xs mb-3.5 bg-white">
      <CardHeader className="py-2.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          WFP Information
        </CardTitle>
        {onEditObjective && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onEditObjective}
            className="text-xs text-indigo-600 hover:text-indigo-800 gap-1.5 h-7 px-2.5 font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Objective
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Fiscal Year & Funding Source */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fiscal Year
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {fundSource?.fiscalYear?.year || new Date(wfp?.projectStartDate || Date.now()).getFullYear()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded bg-purple-50 text-purple-600 border border-purple-100 mt-0.5">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Funding Source
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {fundSource?.name || 'Regular Agency Fund'}
                </span>
                {fundSource?.code && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Code: {fundSource.code}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: General Objective & Duration */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-100 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  General Objective
                </span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                  "{wfp?.generalObjective || wfp?.objective || 'No general objective defined.'}"
                </p>
                {wfp?.description && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {wfp.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="p-1.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Project Duration
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {durationText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
