import { Calendar } from 'lucide-react'
import { getFullMonthName } from './constants'

interface SelectedPeriodsSummaryProps {
  selectedCount: number
  targetValues: Record<string, string>
  selectedType: string
  getPeriodDates: (period: string, type: string, projectStart?: string) => string
  projectStart?: string
}

export function SelectedPeriodsSummary({
  selectedCount,
  targetValues,
  selectedType,
  getPeriodDates,
  projectStart
}: SelectedPeriodsSummaryProps) {
  if (selectedCount === 0) return null

  return (
    <div className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
          Selected Periods Summary
        </p>
        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {selectedCount} {selectedCount === 1 ? 'Period' : 'Periods'}
        </span>
      </div>

      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {Object.entries(targetValues).map(([period, val]) => (
          <div
            key={period}
            className="bg-[#10b981] text-white p-3 rounded-xl flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black leading-none mb-1">
                  {selectedType === 'Monthly' ? getFullMonthName(period) : period}
                </p>
                <p className="text-[10px] font-medium opacity-90 italic">
                  {getPeriodDates(period, selectedType, projectStart)}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-white/20 pl-4">
              <p className="text-sm font-black leading-none">{val}</p>
              <p className="text-[8px] uppercase font-bold opacity-80 mt-1 tracking-tighter">Target</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}