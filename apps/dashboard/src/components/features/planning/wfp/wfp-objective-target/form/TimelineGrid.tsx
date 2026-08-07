import { Calendar } from 'lucide-react'
import { TIMELINE_CONFIG } from './constants'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TimelineGridProps {
  selectedType: string
  periods: ReadonlyArray<string>
  targetValues: Record<string, string>
  activeInput: string | null
  setActiveInput: (input: string | null) => void
  handleTargetChange: (period: string, val: string) => void
  getDayOfWeek: (period: string, type: string, projectStart?: string) => string
  projectStart?: string
}
export function TimelineGrid({
  selectedType,
  periods,
  targetValues,
  activeInput,
  setActiveInput,
  handleTargetChange,
  getDayOfWeek,
  projectStart
}: TimelineGridProps) {
  const theme = TIMELINE_CONFIG[selectedType] || TIMELINE_CONFIG.Quarterly
  const selectedCount = Object.keys(targetValues).length
  return (
    <div className="space-y-4">
      <div className={`${theme.bg} border ${theme.border} p-3 rounded-lg flex items-center justify-between`}>
        <span className={`text-sm font-medium ${theme.text}`}>The Whole {selectedType.toLowerCase()} target value</span>
        <Calendar size={16} className={theme.text}/>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-gray-700">Select {selectedType} and Enter Target Value *</Label>
        <span className={`${theme.active} px-3 py-1 rounded text-[10px] font-bold`}>{selectedCount} Selected</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {periods.map((item) => (
          <div key={item} className="flex flex-col gap-1">
            <div
              onClick={() => setActiveInput(item)}
              className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${targetValues[item] ? theme.active : `${theme.bg} ${theme.border} text-gray-700`}`}
            >
              <p className="text-[10px] font-bold">
                {item}
                {selectedType === 'Daily' && (
                  <span className="text-[8px] text-gray-500"> ({getDayOfWeek(item, selectedType, projectStart)})</span>
                )}
              </p>
            </div>
            {activeInput === item && (
              <Input
                autoFocus
                type="number"
                className="h-7 text-xs p-1 text-center border-emerald-300"
                value={targetValues[item] || ''}
                onChange={(e) => handleTargetChange(item, e.target.value)}
                onBlur={() => setActiveInput(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}