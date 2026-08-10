import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import type { UNSPSCodeFormData, UNSPSCode } from '../../../types'

interface UNSPSCodeFormProps {
  onSubmit: (data: UNSPSCodeFormData) => void
  onCancel: () => void
  initialData?: UNSPSCodeFormData
  isLoading?: boolean
  availableParents?: UNSPSCode[]
}

export function UNSPSCodeForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  availableParents = [],
}: UNSPSCodeFormProps) {
  const [formData, setFormData] = useState<UNSPSCodeFormData>(
    initialData || {
      ParentId: '',
      Name: '',
      Code: '',
      Level: 1,
      IsActive: true,
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.Name.trim()) {
      newErrors.Name = 'UNSPSC code name is required'
    }
    if (!formData.Code.trim()) {
      newErrors.Code = 'UNSPSC code is required'
    }
    if (formData.Level < 1) {
      newErrors.Level = 'Level must be at least 1'
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

  // Create options for parent selection - searchable by both code and name
  const parentOptions = availableParents.map(parent => ({
    value: parent.id,
    label: `${parent.Code} - ${parent.Name}`,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
      {/* Parent Name */}
      <div className="space-y-2">
        <Label id="ParentId-label" htmlFor="ParentId">Parent Name</Label>
        <Combobox
          aria-labelledby="ParentId-label"
          options={parentOptions}
          value={formData.ParentId || ''}
          onValueChange={(value) => setFormData({ ...formData, ParentId: value })}
          placeholder="Select parent UNSPSC code (optional)"
          searchPlaceholder="Search by code or name..."
          emptyMessage="No UNSPSC codes found."
        />
        <span className="text-xs text-muted-foreground">Leave empty for root level codes</span>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="Name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="Name"
          placeholder="e.g., Live Plant and Animal Material and Accessories and Supplies"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
          className={errors.Name ? 'border-red-500' : ''}
        />
        {errors.Name && <p className="text-sm text-red-500">{errors.Name}</p>}
      </div>

      {/* Level */}
      <div className="space-y-2">
        <Label htmlFor="Level">
          Level <span className="text-red-500">*</span>
        </Label>
        <Input
          id="Level"
          type="number"
          placeholder="e.g., 2"
          value={formData.Level}
          onChange={(e) => setFormData({ ...formData, Level: parseInt(e.target.value) || 1 })}
          className={errors.Level ? 'border-red-500' : ''}
        />
        {errors.Level && <p className="text-sm text-red-500">{errors.Level}</p>}
      </div>

      {/* Code */}
      <div className="space-y-2">
        <Label htmlFor="Code">
          Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="Code"
          placeholder="e.g., 10000000"
          value={formData.Code}
          onChange={(e) => setFormData({ ...formData, Code: e.target.value })}
          className={errors.Code ? 'border-red-500' : ''}
        />
        {errors.Code && <p className="text-sm text-red-500">{errors.Code}</p>}
      </div>



      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save UNSPSC Code'}
        </Button>
      </div>
    </form>
  )
}