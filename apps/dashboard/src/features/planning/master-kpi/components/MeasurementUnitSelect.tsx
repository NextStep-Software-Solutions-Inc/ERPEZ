import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MeasurementUnit } from '../types'

interface MeasurementUnitSelectProps {
  value: string | MeasurementUnit | undefined
  onChange: (value: any) => void
  disabled?: boolean
  className?: string
}

const PRESET_UNITS = [
  { value: 'Number', label: 'Number / Count' },
  { value: 'Percentage', label: 'Percentage (%)' },
  { value: 'Currency', label: 'Currency (₱)' },
]

export function MeasurementUnitSelect({
  value,
  onChange,
  disabled = false,
  className,
}: MeasurementUnitSelectProps) {
  const stringVal = String(value || '')

  const getMatchedPreset = (val: string) => {
    if (!val) return undefined
    const cleanVal = val.trim().toLowerCase()
    return PRESET_UNITS.find(
      (u) =>
        u.value.toLowerCase() === cleanVal ||
        cleanVal.includes(u.value.toLowerCase()) ||
        u.label.toLowerCase() === cleanVal ||
        (u.value === 'Number' && (val === MeasurementUnit.NUMBER || val === '1')) ||
        (u.value === 'Percentage' && (val === MeasurementUnit.PERCENTAGE || val === '2')) ||
        (u.value === 'Currency' && (val === MeasurementUnit.CURRENCY || val === '3'))
    )
  }

  const matchedPreset = getMatchedPreset(stringVal)

  const [selectedOption, setSelectedOption] = useState<string>(
    matchedPreset ? matchedPreset.value : stringVal ? 'Custom' : ''
  )
  const [customValue, setCustomValue] = useState<string>(
    matchedPreset ? '' : stringVal
  )

  useEffect(() => {
    const matched = getMatchedPreset(stringVal)
    if (matched) {
      setSelectedOption(matched.value)
      setCustomValue('')
    } else if (stringVal) {
      setSelectedOption('Custom')
      setCustomValue(stringVal)
    } else {
      setSelectedOption('')
      setCustomValue('')
    }
  }, [stringVal])


  const handleSelectChange = (newOpt: string) => {
    setSelectedOption(newOpt)
    if (newOpt === 'Custom') {
      onChange(customValue || '')
    } else {
      onChange(newOpt)
    }
  }

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomValue(val)
    onChange(val)
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectedOption}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select measurement unit" />
        </SelectTrigger>
        <SelectContent>
          {PRESET_UNITS.map((unit) => (
            <SelectItem key={unit.value} value={unit.value}>
              {unit.label}
            </SelectItem>
          ))}
          <SelectItem value="Custom">Other / Custom Unit...</SelectItem>
        </SelectContent>
      </Select>

      {selectedOption === 'Custom' && (
        <Input
          type="text"
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder="Enter custom unit (e.g. Hours, Units, Trainees)"
          disabled={disabled}
          className="text-sm mt-1"
        />
      )}
    </div>
  )
}

