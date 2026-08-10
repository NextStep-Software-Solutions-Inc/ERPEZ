import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MonitoringFrequency } from '../types'

interface FrequencyOfMonitoringSelectProps {
  value: MonitoringFrequency | undefined
  onChange: (value: MonitoringFrequency) => void
  disabled?: boolean
}

const frequencyOptions = [
  {
    value: MonitoringFrequency.QUARTERLY,
    label: 'Quarterly',
    description: 'Monitor and report KPI performance quarterly',
  },
  {
    value: MonitoringFrequency.SEMI_ANNUAL,
    label: 'Semi-Annual',
    description: 'Monitor and report KPI performance twice per year',
  },
  {
    value: MonitoringFrequency.ANNUAL,
    label: 'Annual',
    description: 'Monitor and report KPI performance annually',
  },
]

export function FrequencyOfMonitoringSelect({
  value,
  onChange,
  disabled = false,
}: FrequencyOfMonitoringSelectProps) {
  return (
    <div className="space-y-2">
      <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select monitoring frequency..." />
        </SelectTrigger>
        <SelectContent>
          <TooltipProvider delayDuration={200}>
            {frequencyOptions.map((option) => (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <SelectItem value={option.value}>
                    <div className="font-medium text-xs">{option.label}</div>
                  </SelectItem>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {option.description}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </SelectContent>
      </Select>
    </div>
  )
}
