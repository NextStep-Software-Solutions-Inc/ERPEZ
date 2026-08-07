import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { ModeOfProcurement, ModeOfProcurementFormData } from '../../types'
import { useProcurementCategories } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'

interface ModeOfProcurementFormProps {
  onSubmit: (data: ModeOfProcurementFormData) => void
  onCancel: () => void
  initialData?: Partial<ModeOfProcurementFormData>
  isLoading?: boolean
  isEditing?: boolean
  isCreating?: boolean
  existingModes?: ModeOfProcurement[]
  currentModeId?: string
}

export function ModeOfProcurementForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  isEditing = false,
  isCreating = false,
}: ModeOfProcurementFormProps) {
  // Fetch procurement categories from API
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useProcurementCategories({
      pathParams: {},
      queryParams: {},
    })

  // Extract categories from response
  const categories = useMemo(() => {
    return categoriesResponse?.data ?? []
  }, [categoriesResponse])
  const [formData, setFormData] = useState<ModeOfProcurementFormData>(
    initialData
      ? {
          name: initialData.name || '',
          description: initialData.description || null,
          procurementCategoryId: initialData.procurementCategoryId || '',
          isActive:
            initialData.isActive !== undefined ? initialData.isActive : true,
          minThreshold: initialData.minThreshold ?? '',
          maxThreshold: initialData.maxThreshold ?? '',
        }
      : {
          name: '',
          description: null,
          procurementCategoryId: '',
          isActive: true,
          minThreshold: '',
          maxThreshold: '',
        },
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Mode name is required'
    }

    if (!formData.procurementCategoryId) {
      newErrors.procurementCategoryId = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const submitData: ModeOfProcurementFormData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : null,
        procurementCategoryId: formData.procurementCategoryId,
        isActive: formData.isActive,
        minThreshold: formData.minThreshold.trim(),
        maxThreshold: formData.maxThreshold.trim(),
      }

      onSubmit(submitData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="overflow-y-auto max-h-[calc(90vh-280px)] pr-4 space-y-6">
        {/* Mode Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Mode Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Competitive Bidding"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description of the procurement mode"
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minThreshold">Minimum Threshold</Label>
            <Input
              id="minThreshold"
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={formData.minThreshold}
              onChange={(e) =>
                setFormData({ ...formData, minThreshold: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current value unchanged.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxThreshold">Maximum Threshold</Label>
            <Input
              id="maxThreshold"
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={formData.maxThreshold}
              onChange={(e) =>
                setFormData({ ...formData, maxThreshold: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep it unlimited.
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2 relative z-50">
          <Label htmlFor="procurementCategoryId">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.procurementCategoryId}
            onValueChange={(value: string) => {
              setFormData({ ...formData, procurementCategoryId: value })
            }}
            disabled={isCategoriesLoading}
          >
            <SelectTrigger id="procurementCategoryId">
              <SelectValue
                placeholder={
                  isCategoriesLoading
                    ? 'Loading categories...'
                    : 'Select category'
                }
              />
            </SelectTrigger>
            <SelectContent side="bottom" className="z-[9999]">
              {isCategoriesLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No categories available
                </div>
              ) : (
                categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name || 'Unnamed Category'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.procurementCategoryId && (
            <p className="text-sm text-red-500">
              {errors.procurementCategoryId}
            </p>
          )}
        </div>

        {/* Status - only for editing */}
        {isEditing && (
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-2 rounded text-sm font-medium ${
                  formData.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isCreating ? 'Create Mode' : 'Update Mode'}
        </Button>
      </div>
    </form>
  )
}
