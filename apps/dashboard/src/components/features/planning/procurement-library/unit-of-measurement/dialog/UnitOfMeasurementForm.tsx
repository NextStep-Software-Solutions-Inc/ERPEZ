import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UnitOfMeasurementFormData } from '../../types'

export interface ParentUnitOption {
  id: string
  name: string
}

interface UnitOfMeasurementFormProps {
  onSubmit: (data: UnitOfMeasurementFormData) => void
  onCancel: () => void
  initialData?: UnitOfMeasurementFormData
  isLoading?: boolean
  isCreating?: boolean
  parentUnits?: ParentUnitOption[]
}

export function UnitOfMeasurementForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  isCreating = false,
  parentUnits = [],
}: UnitOfMeasurementFormProps) {
  const [formData, setFormData] = useState<UnitOfMeasurementFormData>(
    initialData || {
      name: '',
      abbreviation: '',
      parentUnitId: undefined,
      conversionFactor: 1,
      status: 'active',
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.abbreviation.trim()) {
      newErrors.abbreviation = 'Abbreviation is required'
    }
    if (formData.conversionFactor <= 0) {
      newErrors.conversionFactor = 'Conversion factor must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Kilogram, Meter"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Abbreviation */}
      <div className="space-y-2">
        <Label htmlFor="abbreviation">
          Abbreviation <span className="text-red-500">*</span>
        </Label>
        <Input
          id="abbreviation"
          placeholder="e.g., kg, m"
          value={formData.abbreviation}
          onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
          className={errors.abbreviation ? 'border-red-500' : ''}
        />
        {errors.abbreviation && <p className="text-sm text-red-500">{errors.abbreviation}</p>}
      </div>

      {/* Parent Unit */}
      <div className="space-y-2">
        <Label htmlFor="parentUnitId">Parent UOM (Optional)</Label>
        <Select
          value={formData.parentUnitId || 'none'}
          onValueChange={(value) => setFormData({ ...formData, parentUnitId: value === 'none' ? undefined : value })}
        >
          <SelectTrigger id="parentUnitId">
            <SelectValue placeholder="Select parent unit" />
          </SelectTrigger>
          <SelectContent side="bottom" className="z-[9999]">
            <SelectItem value="none">None</SelectItem>
            {parentUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">For derived units, specify the base unit</span>
      </div>

      {/* Conversion Factor */}
      <div className="space-y-2">
        <Label htmlFor="conversionFactor">
          Conversion Factor <span className="text-red-500">*</span>
        </Label>
        <Input
          id="conversionFactor"
          type="number"
          min="0"
          step="0.01"
          placeholder="1"
          value={formData.conversionFactor}
          onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1 })}
          className={errors.conversionFactor ? 'border-red-500' : ''}
        />
        {errors.conversionFactor && (
          <p className="text-sm text-red-500">{errors.conversionFactor}</p>
        )}
        <span className="text-xs text-muted-foreground">Conversion factor relative to parent unit</span>
      </div>

      {/* Status - only for creating and always set to Active */}
      {isCreating && (
        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            Status is automatically set to <strong>Active</strong> for new units
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save UOM'}
        </Button>
      </div>
    </form>
  )
}
