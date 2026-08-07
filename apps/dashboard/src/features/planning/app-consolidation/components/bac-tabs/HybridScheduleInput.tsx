import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X, Calendar } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface HybridScheduleInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  milestoneLabel?: string
}

const PREDEFINED_VALUES = [
  'N/A',
  'As the need arises',
  'Various dates',
  'TBD',
  'To be coordinated',
]

/**
 * HybridScheduleInputComponent
 * Supports multiple input types for procurement schedule milestones:
 * - Calendar picker (select date/date range)
 * - Predefined options (N/A, As needed, etc.)
 * - Free text input (for multiple dates like "01/2024, 07/2024")
 */
export function HybridScheduleInput({
  value,
  onChange,
  placeholder = 'Enter date, text, or select an option',
  disabled = false,
  milestoneLabel,
}: HybridScheduleInputProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [monthYear, setMonthYear] = useState(new Date())

  const isPredefined = PREDEFINED_VALUES.includes(value)

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue)
  }

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
  }

  const handleClear = () => {
    onChange('')
  }

  // Format date to DD/MM/YYYY
  const formatDateToComplete = (date: Date): string => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  }

  // Handle date selection from calendar
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(monthYear.getFullYear(), monthYear.getMonth(), day)
    
    if (!startDate) {
      setStartDate(selectedDate)
      setEndDate(null)
    } else if (!endDate && selectedDate > startDate) {
      setEndDate(selectedDate)
      const formatted = `${formatDateToComplete(startDate)}, ${formatDateToComplete(selectedDate)}`
      onChange(formatted)
      setIsCalendarOpen(false)
      setStartDate(null)
      setEndDate(null)
    } else if (!endDate && selectedDate <= startDate) {
      // If user clicks an earlier date, treat it as single date
      const formatted = formatDateToComplete(selectedDate)
      onChange(formatted)
      setIsCalendarOpen(false)
      setStartDate(null)
      setEndDate(null)
    } else {
      // Reset and start over
      setStartDate(selectedDate)
      setEndDate(null)
    }
  }

  // Get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Generate calendar days
  const generateCalendarDays = (): (number | null)[] => {
    const daysInMonth = getDaysInMonth(monthYear)
    const firstDay = getFirstDayOfMonth(monthYear)
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const isDateInRange = (day: number): boolean => {
    if (!startDate || !endDate) return false
    const date = new Date(monthYear.getFullYear(), monthYear.getMonth(), day)
    return date > startDate && date < endDate
  }

  const isStartDate = (day: number): boolean => {
    if (!startDate) return false
    return startDate.getDate() === day && 
           startDate.getMonth() === monthYear.getMonth() &&
           startDate.getFullYear() === monthYear.getFullYear()
  }

  const isEndDate = (day: number): boolean => {
    if (!endDate) return false
    return endDate.getDate() === day && 
           endDate.getMonth() === monthYear.getMonth() &&
           endDate.getFullYear() === monthYear.getFullYear()
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-2">
      {milestoneLabel && (
        <label className="text-xs font-medium text-gray-700">{milestoneLabel}</label>
      )}
      
      <div className="flex gap-2">
        {/* Select for predefined values */}
        <Select value={isPredefined ? value : 'custom'} onValueChange={handleSelectChange}>
          <SelectTrigger className="flex-1 relative z-50" disabled={disabled}>
            <SelectValue placeholder="Select or enter..." />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={8} className="z-[99999]">
            <SelectItem value="custom">Custom input</SelectItem>
            {PREDEFINED_VALUES.map((val) => (
              <SelectItem key={val} value={val}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Calendar picker button */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="px-2"
              title="Open calendar to select date or date range"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 z-[99999]" align="start">
            <div className="space-y-4">
              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthYear(new Date(monthYear.getFullYear(), monthYear.getMonth() - 1))}
                >
                  ← Prev
                </Button>
                <div className="text-sm font-semibold">
                  {monthYear.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthYear(new Date(monthYear.getFullYear(), monthYear.getMonth() + 1))}
                >
                  Next →
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, idx) => (
                  <div key={idx} className="aspect-square">
                    {day === null ? (
                      <div />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 text-sm ${
                          isStartDate(day) || isEndDate(day)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : isDateInRange(day)
                              ? 'bg-blue-100 text-gray-900 hover:bg-blue-200'
                              : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleDateSelect(day)}
                      >
                        {day}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Selection info */}
              <div className="text-xs text-gray-600 pt-2 border-t">
                <p>
                  {startDate ? `Start: ${formatDateToComplete(startDate)}` : 'Click a date to start'}
                </p>
                {endDate && <p>End: {formatDateToComplete(endDate)}</p>}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Custom text input */}
      {!isPredefined && (
        <Input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-sm"
        />
      )}
    </div>
  )
}
