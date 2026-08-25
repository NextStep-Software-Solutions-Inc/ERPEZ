import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SupplierCategoryFormData } from '../../../types'

interface SupplierCategoryFormProps {
  onSubmit: (data: SupplierCategoryFormData) => void
  onCancel: () => void
  initialData?: SupplierCategoryFormData
  isLoading?: boolean
}

export function SupplierCategoryForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: SupplierCategoryFormProps) {
  const [formData, setFormData] = useState<SupplierCategoryFormData>(
    initialData || {
      name: '',
      description: '',
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier category name is required'
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
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="supplier-category-name">
          Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="supplier-category-name"
          placeholder="e.g., Office Supplies, IT Equipment"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="supplier-category-description">Description</Label>
        <Textarea
          id="supplier-category-description"
          placeholder="Describe the supplier category..."
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
        <span className="text-xs text-muted-foreground">Optional description for this supplier category</span>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Category'}
        </Button>
      </div>
    </form>
  )
}
