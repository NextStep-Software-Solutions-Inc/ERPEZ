import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'

interface FiscalYearSelectorProps {
  onSelect: (fiscalYear: number) => void
  selectedYear?: number | null
}

/**
 * FiscalYearSelector Component
 * Allows users to select a fiscal year for APP creation.
 * Displays the last 5 years and next 5 years from the current year.
 */
export function FiscalYearSelector({
  onSelect,
  selectedYear,
}: FiscalYearSelectorProps) {
  const [selected, setSelected] = useState<string | null>(
    selectedYear ? selectedYear.toString() : null,
  )
  const currentYear = new Date().getFullYear()
  const fiscalYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  useEffect(() => {
    if (selectedYear) {
      setSelected(selectedYear.toString())
    }
  }, [selectedYear])

  const handleSelect = (year: string) => {
    setSelected(year)
    onSelect(parseInt(year, 10))
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Select Fiscal Year</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Choose the fiscal year for which you want to create the Annual
        Procurement Plan.
      </p>

      <div className="space-y-4">
        <Select value={selected || ''} onValueChange={handleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a fiscal year..." />
          </SelectTrigger>
          <SelectContent>
            {fiscalYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {`FY ${year}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Selected Fiscal Year: <span className="font-bold">{selected}</span>
          </p>
        </div>
      )}
    </div>
  )
}
