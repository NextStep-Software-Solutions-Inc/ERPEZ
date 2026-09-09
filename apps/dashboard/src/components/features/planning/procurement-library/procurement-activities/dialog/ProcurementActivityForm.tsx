import { useState, useEffect, type FormEvent } from 'react'
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
  externalErrors?: Record<string, string>
}

export function ProcurementActivityForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  externalErrors = {},
}: ProcurementActivityFormProps) {
  const [formData, setFormData] = useState<ProcurementActivityFormData>(
    initialData || {
      activityName: '',
      activityCode: '',
      description: '',
      minDays: 0,
      maxDays: 0,
    }
  )

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const activeErrors = { ...errors, ...externalErrors }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.activityName || formData.activityName.trim() === '') {
      newErrors.activityName = 'Activity name is required'
    }

    if (!formData.activityCode || formData.activityCode.trim() === '') {
      newErrors.activityCode = 'Activity code is required'
    } else if (formData.activityCode.length > 10) {
      newErrors.activityCode = 'Activity code cannot exceed 10 characters'
    } else if (!/^[A-Z0-9]+$/.test(formData.activityCode)) {
      newErrors.activityCode = 'Activity code must contain only uppercase letters and digits'
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
          className={activeErrors.activityName ? 'border-red-500' : ''}
        />
        {activeErrors.activityName && <p className="text-sm text-red-500">{activeErrors.activityName}</p>}
      </div>

      {/* Activity Code */}
      <div className="space-y-2">
        <Label htmlFor="activityCode">
          Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="activityCode"
          placeholder="e.g., PPC"
          maxLength={10}
          value={formData.activityCode}
          onChange={(e) => {
            const val = e.target.value.toUpperCase()
            setFormData({ ...formData, activityCode: val })
            if (errors.activityCode) {
              setErrors((prev) => {
                const next = { ...prev }
                delete next.activityCode
                return next
              })
            }
          }}
          className={activeErrors.activityCode ? 'border-red-500 font-mono' : 'font-mono'}
        />
        {activeErrors.activityCode && <p className="text-sm text-red-500">{activeErrors.activityCode}</p>}
        <span className="text-xs text-muted-foreground">Shorthand abbreviation (alphanumeric, uppercase, max 10 chars)</span>
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
          className={activeErrors.description ? 'border-red-500' : ''}
        />
        {activeErrors.description && <p className="text-sm text-red-500">{activeErrors.description}</p>}
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
          className={activeErrors.minDays ? 'border-red-500' : ''}
        />
        {activeErrors.minDays && <p className="text-sm text-red-500">{activeErrors.minDays}</p>}
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
          className={activeErrors.maxDays ? 'border-red-500' : ''}
        />
        {activeErrors.maxDays && <p className="text-sm text-red-500">{activeErrors.maxDays}</p>}
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
