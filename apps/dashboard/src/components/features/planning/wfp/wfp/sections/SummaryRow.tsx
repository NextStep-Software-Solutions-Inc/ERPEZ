import { Badge } from '@/components/ui/badge'
import type { WFPDetails } from '../table/types'
import { Building2, Layers, ShieldCheck, Coins } from 'lucide-react'

interface Office {
  code: string
}

interface SummaryRowProps {
  wfp: WFPDetails
  office: Office | undefined
  isOPCRMode: boolean
}

export const SummaryRow = ({ wfp, office, isOPCRMode }: SummaryRowProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-amber-500/10 text-amber-600 border-amber-200'
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 backdrop-blur-sm">
      {office && (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office</p>
            <p className="text-xs font-bold text-slate-700">{office.code}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
          <Layers className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mode</p>
          <Badge color={isOPCRMode ? 'default' : 'secondary'} className="mt-0.5 text-[11px] font-bold py-0">
            {wfp?.mode || 'N/A'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
          <Badge variant="outline" className={`mt-0.5 text-[11px] font-bold py-0 ${getStatusColor(wfp?.status)}`}>
            {wfp?.status || 'N/A'}
          </Badge>
        </div>
      </div>

      {wfp?.proposedBudget !== undefined && wfp?.proposedBudget !== null && (
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proposed Budget</p>
            <p className="text-xs font-bold text-amber-700">
              ₱{wfp.proposedBudget.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
