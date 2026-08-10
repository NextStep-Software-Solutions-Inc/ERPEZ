import React, { useState, useMemo } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ScheduleValueType } from '../types'

interface HybridScheduleInputProps {
  value?: ScheduleValueType
  onChange?: (value: ScheduleValueType) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
}

const PREDEFINED_OPTIONS = [
  { value: 'N/A', label: 'N/A' },
  { value: 'as the need arises', label: 'As the need arises' },
  { value: 'various dates', label: 'Various dates' },
]

/**
 * HybridScheduleInput - Flexible Schedule Date Input Component
 *
 * Supports multiple input modes:
 * 1. Calendar date picker (YYYY-MM-DD)
 * 2. Predefined strings: "N/A", "as the need arises", "various dates"
 * 3. Free-text months: "01/2024, 07/2024" (comma-separated months)
 *
 * Usage:
 * ```tsx
 * <HybridScheduleInput
 *   value={item.milestones?.advertisementDate}
 *   onChange={(val) => updateSchedule('advertisementDate', val)}
 * />
 * ```
 *
 * Features:
 * - Accepts Date objects or strings
 * - Validates month format (MM/YYYY)
 * - Shows formatted display (e.g., "Jan 2024, Jul 2024")
 * - Tab between date picker and text input
 * - Error feedback for invalid formats
 */
export function HybridScheduleInput({
  value,
  onChange,
  placeholder = 'Select date, type N/A, or enter months (01/2024, 07/2024)',
  disabled = false,
  readOnly = false,
  className,
}: HybridScheduleInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'date' | 'text'>('date')
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState<string>('')

  // Parse and format display value
  const displayValue = useMemo(() => {
    if (!value) return placeholder

    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    if (typeof value === 'string') {
      // Check if it's predefined string
      if (
        value === 'N/A' ||
        value === 'as the need arises' ||
        value === 'various dates'
      ) {
        return value
      }

      // Try to parse comma-separated months
      if (value.includes(',') || value.includes('/')) {
        const months = value
          .split(',')
          .map((m) => m.trim())
          .filter((m) => /^\d{1,2}\/\d{4}$/.test(m))

        if (months.length > 0) {
          return months
            .map((m) => {
              const [month, year] = m.split('/')
              const date = new Date(parseInt(year), parseInt(month) - 1, 1)
              return date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            })
            .join(', ')
        }
      }

      return value
    }

    return placeholder
  }, [value, placeholder])

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    onChange?.(dateStr)
    setIsOpen(false)
    setError('')
  }

  const handleTextChange = (text: string) => {
    setTextInput(text)
    setError('')

    // Validate input
    if (!text.trim()) {
      return
    }

    const trimmed = text.trim()

    // Check for predefined strings
    if (PREDEFINED_OPTIONS.some((opt) => opt.value.toLowerCase() === trimmed.toLowerCase())) {
      onChange?.(trimmed)
      return
    }

    // Try to parse month format (MM/YYYY)
    const monthPattern = /^\d{1,2}\/\d{4}$/
    const commaPattern = /^(\d{1,2}\/\d{4}\s*,\s*)*\d{1,2}\/\d{4}$/

    if (monthPattern.test(trimmed)) {
      // Single month
      onChange?.(trimmed)
    } else if (commaPattern.test(trimmed)) {
      // Multiple months
      onChange?.(trimmed)
    } else if (trimmed.includes(',') || trimmed.includes('/')) {
      // Has separators but invalid format
      setError('Invalid format. Use MM/YYYY or comma-separated months (e.g., 01/2024, 07/2024)')
    } else {
      // Could be free text - allow it
      onChange?.(trimmed)
    }
  }

  const handlePredefinedSelect = (predefinedValue: string) => {
    onChange?.(predefinedValue)
    setTextInput('')
    setError('')
    setMode('date')
  }

  if (readOnly) {
    return (
      <div
        className={cn(
          'px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm',
          className,
        )}
      >
        {displayValue}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate">{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-3">
            {/* Mode Toggle */}
            <div className="flex gap-2 border-b pb-3">
              <Button
                size="sm"
                variant={mode === 'date' ? 'default' : 'outline'}
                onClick={() => setMode('date')}
              >
                Date
              </Button>
              <Button
                size="sm"
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => setMode('text')}
              >
                Text
              </Button>
            </div>

            {/* Date Picker Mode */}
            {mode === 'date' && (
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {/* Simple date grid - would use a calendar library in production */}
                  <p className="col-span-7 text-xs text-gray-500 mb-2">
                    Quick select: Use date or enter text below
                  </p>
                  <Input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDateSelect(new Date(e.target.value))
                      }
                    }}
                    className="col-span-7"
                    disabled={disabled}
                  />
                </div>

                {/* Predefined options */}
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-medium text-gray-600">Quick Options:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PREDEFINED_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant="outline"
                        onClick={() => handlePredefinedSelect(opt.value)}
                        className="text-xs"
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Text input fallback */}
                <div className="space-y-2 border-t pt-3">
                  <label className="text-xs font-medium text-gray-600">
                    Or enter months (MM/YYYY):
                  </label>
                  <Input
                    placeholder="e.g., 01/2024 or 01/2024, 07/2024"
                    value={textInput}
                    onChange={(e) => handleTextChange(e.target.value)}
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {/* Text Mode */}
            {mode === 'text' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter date information:</label>
                  <Input
                    placeholder={placeholder}
                    value={textInput}
                    onChange={(e) => handleTextChange(e.target.value)}
                    disabled={disabled}
                    className="text-sm"
                  />
                </div>

                {/* Predefined options */}
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-medium text-gray-600">Suggestions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PREDEFINED_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant="outline"
                        onClick={() => handlePredefinedSelect(opt.value)}
                        className="text-xs justify-start h-auto py-2"
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Format helper */}
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-900">
                  <p className="font-medium mb-1">Accepted formats:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Date: YYYY-MM-DD (2024-06-15)</li>
                    <li>Single month: MM/YYYY (06/2024)</li>
                    <li>Multiple months: 01/2024, 07/2024</li>
                    <li>Predefined: N/A, as the need arises, various dates</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 bg-red-50 p-2 rounded text-xs text-red-900">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Display current value below input */}
      {value && (
        <p className="text-xs text-gray-600 px-2">
          Current: <span className="font-medium">{displayValue}</span>
        </p>
      )}
    </div>
  )
}
