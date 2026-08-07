import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ProcurementActivityFormData } from '../../types'

interface ProcurementActivityFormProps {
  onSubmit: (data: ProcurementActivityFormData) => void
  onCancel: () => void
  initialData?: ProcurementActivityFormData
  isLoading?: boolean
}

export function ProcurementActivityForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: ProcurementActivityFormProps) {
  const [formData, setFormData] = useState<ProcurementActivityFormData>(
    initialData || {
      activityName: '',
      description: '',
      minDays: 0,
      maxDays: 0,
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.activityName || formData.activityName.trim() === '') {
      newErrors.activityName = 'Activity name is required'
    }

    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required'
    }

    if (formData.minDays < 0) {
      newErrors.minDays = 'Min days must be greater than or equal to 0'
    }
    if (formData.maxDays < formData.minDays) {
      newErrors.maxDays = 'Max days must be greater than or equal to min days'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
      {/* Activity Name */}
      <div className="space-y-2">
        <Label htmlFor="activityName">
          Activity Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="activityName"
          placeholder="e.g., Pre-Procurement Conference"
          value={formData.activityName}
          onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
          className={errors.activityName ? 'border-red-500' : ''}
        />
        {errors.activityName && <p className="text-sm text-red-500">{errors.activityName}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the procurement activity process and requirements..."
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        <span className="text-xs text-muted-foreground">Provide details about this procurement activity</span>
      </div>

      {/* Min Days */}
      <div className="space-y-2">
        <Label htmlFor="minDays">
          Minimum Days <span className="text-red-500">*</span>
        </Label>
        <Input
          id="minDays"
          type="number"
          min="0"
          placeholder="0"
          value={formData.minDays}
          onChange={(e) => setFormData({ ...formData, minDays: parseInt(e.target.value) || 0 })}
          className={errors.minDays ? 'border-red-500' : ''}
        />
        {errors.minDays && <p className="text-sm text-red-500">{errors.minDays}</p>}
      </div>

      {/* Max Days */}
      <div className="space-y-2">
        <Label htmlFor="maxDays">
          Maximum Days <span className="text-red-500">*</span>
        </Label>
        <Input
          id="maxDays"
          type="number"
          min="0"
          placeholder="0"
          value={formData.maxDays}
          onChange={(e) => setFormData({ ...formData, maxDays: parseInt(e.target.value) || 0 })}
          className={errors.maxDays ? 'border-red-500' : ''}
        />
        {errors.maxDays && <p className="text-sm text-red-500">{errors.maxDays}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Activity'}
        </Button>
      </div>
    </form>
  )
}
