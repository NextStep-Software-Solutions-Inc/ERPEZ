import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const

interface MonthYearPickerProps {
  value: string
  onValueChange: (value: string) => void | Promise<void>
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

function parseMonthYear(value: string): { month: string; year: string } {
  const [month = '', year = ''] = value.trim().split('/')
  return { month, year }
}

export function MonthYearPicker({
  value,
  onValueChange,
  placeholder = 'Pick MM/YYYY',
  label,
  disabled = false,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 11 }, (_, index) =>
      String(currentYear - 3 + index),
    )
  }, [])

  useEffect(() => {
    const next = parseMonthYear(value)
    setMonth(next.month)
    setYear(next.year)
  }, [value])

  const handleDone = async () => {
    if (!month || !year) return
    await onValueChange(`${month}/${year}`)
    setOpen(false)
  }

  const buttonLabel = value.trim() || placeholder

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) return
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-8 w-full justify-start gap-2 text-left text-xs font-normal',
            !value.trim() && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{buttonLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-72 space-y-3 p-3">
        {label && <Label className="text-xs font-medium">{label}</Label>}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium">Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleDone()}
            disabled={!month || !year}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
